import { IsString, IsNotEmpty, IsOptional, IsNotEmptyObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PointGeometry } from '../../shared/types';
import { IsPointGeometry } from '../../shared/validators/geometry';

export class CreateDeviceDto {
  @ApiProperty({ description: 'Name of the device' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Unique identifier for the device' })
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty({ description: 'Location of the device' })
  @IsNotEmptyObject()
  @IsPointGeometry()
  location: PointGeometry;

  @ApiProperty({ description: 'Hedera account associated with the device' })
  @IsOptional()
  @IsString()
  hederaAccount?: string;

  @ApiProperty({ description: 'Account private key' })
  @IsOptional()
  @IsString()
  privateKey?: string;
  @ApiProperty({ description: 'Account public key' })
  @IsOptional()
  @IsString()
  publickKey?: string;

  @ApiProperty({ description: 'Owner of the device' })
  @IsOptional()
  @IsString()
  owner?: string;
}
