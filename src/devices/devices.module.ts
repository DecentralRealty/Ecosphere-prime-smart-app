import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesService } from './devices.service'; // Consistent naming
import { DevicesController } from './devices.controller'; // Consistent naming
import { Device, DeviceSchema } from './schemas/device.schema';
import { SmartConfigModule } from '@hsuite/smart-config';
import { HcsModule } from '../hcs/hcs.module'
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Device.name,
        schema: DeviceSchema
      }
    ]),
    SmartConfigModule,
    HcsModule
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
