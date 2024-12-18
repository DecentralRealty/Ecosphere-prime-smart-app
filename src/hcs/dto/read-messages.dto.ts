import { IsNotEmpty, IsDateString, IsEnum, IsOptional, IsMongoId } from 'class-validator'
import { Types } from 'mongoose'

export enum GroupBy {
    DAY = 'day'
}

export class ReadMessagesDto {
    @IsNotEmpty()
    @IsDateString()
    startDate: Date

    @IsNotEmpty()
    @IsDateString()
    endDate: Date

    @IsOptional()
    @IsMongoId()
    deviceId?: Types.ObjectId | string

    @IsOptional()
    @IsEnum(GroupBy)
    groupBy?: GroupBy
}
