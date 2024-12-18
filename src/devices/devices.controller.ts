import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service'; // Consistent naming
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ReadDevicesDto } from './dto/read-device.dto'
//import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Devices')
@Controller('devices')
//@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, description: 'The device has been successfully created.' })
  create(@Request() req, @Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create({ ...createDeviceDto, owner: req.user._id });
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all devices' })
  @ApiResponse({ status: 200, description: 'List of devices.' })
  findAll(@Query() readDevicesDto: ReadDevicesDto) {
    return this.devicesService.findAll(readDevicesDto);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Retrieve a specific device by UUID' })
  @ApiResponse({ status: 200, description: 'The device details.' })
  findOne(@Request() req, @Param('uuid') uuid: string) {
    return this.devicesService.findOne(uuid, req.user._id);
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update a specific device by UUID' })
  @ApiResponse({ status: 200, description: 'The device has been successfully updated.' })
  update(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(uuid, req.user._id, updateDeviceDto);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a specific device by UUID' })
  @ApiResponse({ status: 200, description: 'The device has been successfully deleted.' })
  remove(@Request() req, @Param('uuid') uuid: string) {
    return this.devicesService.remove(uuid, req.user._id);
  }
}
