import { IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class ReadTopicMessagesDto {
    @ApiProperty({
        description: 'Start date timestamp of topic messages',
        example: '2024-12-12 00:00:00'
    })
    @IsNotEmpty()
    startDate: Date

    @ApiProperty({
        description: 'End date timestamp of topic messages',
        example: '2024-12-18 00:00:00'
    })
    @IsNotEmpty()
    endDate: Date
}
