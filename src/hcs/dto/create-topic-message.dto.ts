import { IsNotEmptyObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { Temperature, WindDirection, WindSpeed, AtmPressure, AirQuality } from '../../shared/types'

export class CreateTopicMessageDto {
    @ApiProperty({
        description: 'Temperature reading',
        example: {
            unit: '°C',
            value: 27
        }
    })
    @IsNotEmptyObject()
    temperature: Temperature

    @ApiProperty({
        description: 'Atm Pressure reading',
        example: {
            unit: 'Atm',
            value: 1
        }
    })
    @IsNotEmptyObject()
    atmPressure: AtmPressure

    @ApiProperty({
        description: 'Wind Speed reading',
        example: {
            unit: 'Km/h',
            value: 10
        }
    })
    @IsNotEmptyObject()
    windSpeed: WindSpeed

    @ApiProperty({
        description: 'Wind Direction reading',
        example: {
            unit: '°',
            value: 90
        }
    })
    @IsNotEmptyObject()
    windDirection: WindDirection

    @ApiProperty({
        description: 'Air Quality reading',
        example: {
            unit: 'AQI',
            value: 30
        }
    })
    @IsNotEmptyObject()
    airQuality: AirQuality
}
