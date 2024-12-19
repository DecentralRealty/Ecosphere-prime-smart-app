import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ReadDevicesDto } from './dto/read-device.dto'
import { Device } from './schemas/device.schema';
import { LedgerId, PrivateKey, PublicKey, Status, Transaction } from '@hashgraph/sdk';
import { SmartConfigService } from '@hsuite/smart-config';
import { ClientService } from '@hsuite/client';
import { HederaClientHelper } from '@hsuite/helpers';
import { HcsService } from '../hcs/hcs.service'


@Injectable()
export class DevicesService  {
     private hederaClient: HederaClientHelper;

  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    private readonly smartConfigService: SmartConfigService,
    private readonly clientService: ClientService,
    private readonly hcsService: HcsService
  ) {
    this.hederaClient = new HederaClientHelper(
      LedgerId.fromString(this.smartConfigService.getEnvironment()),
      this.smartConfigService.getOperator(),
      this.smartConfigService.getMirrorNode()
    );
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // 1. Generate the Hedera account for the device
    const privateKey = PrivateKey.generate();
    const payload = {
      key: privateKey.publicKey.toString(),
      balance: 0,
      maxAutomaticTokenAssociations: 10,
      isReceiverSignatureRequired: true,
    };
  
    const response = await this.clientService.axios.post(`/accounts`, payload);
    const transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(response.data)));
  
    const client = this.hederaClient.getClient();
    const signTx = await transaction.sign(privateKey);
    
    const submitTx = await signTx.execute(client);
    const receipt = await submitTx.getReceipt(client);
  
    if (receipt.status !== Status.Success) {
      throw new Error(`Hedera account creation failed with status: ${receipt.status}`);
    }
  
    // 2. Create the Device and save it to the database
    const createdDevice = new this.deviceModel({
      ...createDeviceDto,
      hederaAccount: receipt.accountId.toString(),
      privateKey: privateKey.toString(),
      publicKey: privateKey.publicKey.toString()
    });

    // Create Topics for each device
    const hcsTopics = await this.hcsService.createDeviceTopics({
      deviceUuid: createdDevice.uuid,
      devicePrivateKey: privateKey.toString(),
    })
    createdDevice.hcsTopics = hcsTopics
  
    const savedDevice = (await createdDevice.save()).toJSON();

    return savedDevice;
  }
  
  
  


  async findAll (readDevicesDto: ReadDevicesDto) {
    const { ids, includeLatestMeasurement } = readDevicesDto

    if (ids?.length) {
      const findParams: any = ids?.length
      ? {
        _id: {
          $in: ids
        }
      }
      : undefined
      const devices = await this.deviceModel.find(findParams)
      if (!devices?.length) {
        throw new HttpException('No device found', HttpStatus.NOT_FOUND)
      }
      return devices
    }

    if (includeLatestMeasurement) {
      return await this.deviceModel.aggregate([
        {
          $lookup: {
            from: 'hcs_topic_messages',
            localField: '_id',
            foreignField: 'deviceId',
            as: 'hcs_topic_messages'
          }
        },
        {
          $unwind: {
            path: '$hcs_topic_messages',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: {
            'hcs_topic_messages.createdAt': -1
          }
        },
        {
          $group: {
            _id: '$_id',
            id: { $first: '$_id' },
            name: { $first: '$name' },
            uuid: { $first: '$uuid' },
            location: { $first: '$location' },
            hederaAccount: { $first: '$hederaAccount' },
            userId: { $first: '$owner' },
            hcsTopics: { $first: '$hcsTopics' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            __v: { $first: '$__v' }, 
            latestMeasurement: { $first: '$hcs_topic_messages' }
          }
        },
        {
          $project: {
            _id: true,
            id: true,
            name: true,
            uuid: true,
            location: true,
            hederaAccount: true,
            userId: true,
            hcsTopics: true,
            createdAt: true,
            updatedAt: true,
            __v: true, 
            latestMeasurement: true
          }
        }
      ])
    }

    return await this.deviceModel.find()
  }

  async findOne(uuid: string, ownerId: string): Promise<Device> {
    const device = await this.deviceModel
      .findOne({ uuid, owner: ownerId }) // Query by uuid and owner
      .exec(); // No need to explicitly exclude privateKey
  
    if (!device) {
      throw new NotFoundException('Device not found');
    }
  
    return device;
  }

  async update(
    id: string,
    ownerId: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device> {
    const updatedDevice = await this.deviceModel
      .findOneAndUpdate({ _id: id, owner: ownerId }, updateDeviceDto, {
        new: true,
      })
      .exec();
    if (!updatedDevice) {
      throw new NotFoundException('Device not found');
    }
    return updatedDevice;
  }

  async remove(id: string, ownerId: string): Promise<Device> {
    const removedDevice = await this.deviceModel
      .findOneAndDelete({ _id: id, owner: ownerId })
      .exec();
    if (!removedDevice) {
      throw new NotFoundException('Device not found');
    }
    return removedDevice;
  }
}