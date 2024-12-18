import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HcsService } from './hcs.service';
import { HcsController } from './hcs.controller';
import { SmartConfigModule } from '@hsuite/smart-config';
import { HcsTopicMessage, HcsTopicMessageSchema } from './schemas/hcs-topic-message.schema';
import { Device, DeviceSchema } from '../devices/schemas/device.schema'
import { Wallet, WalletSchema } from '../wallets/entities/wallet.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: HcsTopicMessage.name,
        schema: HcsTopicMessageSchema
      },
      {
        name: Device.name,
        schema: DeviceSchema
      },
      {
        name: Wallet.name,
        schema: WalletSchema
      }
    ]),
    SmartConfigModule,
  ],
  controllers: [HcsController],
  providers: [HcsService],
  exports: [HcsService]
})
export class HcsModule {}
