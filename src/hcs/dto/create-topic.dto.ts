import { IsString, IsNotEmpty } from 'class-validator'
import type { PrivateKey } from '@hashgraph/sdk'

export class CreateTopicDto {
    @IsNotEmpty()
    @IsString()
    deviceUuid: string

    @IsNotEmpty()
    @IsString()
    devicePrivateKey: string
}
