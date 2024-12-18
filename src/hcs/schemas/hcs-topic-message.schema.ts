import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, HydratedDocument } from 'mongoose'
import { TopicId } from '@hashgraph/sdk'
import { Temperature, TemperatureSchema } from '../../shared/schemas/temperature.schema'
import { AtmPressure, AtmPressureSchema } from '../../shared/schemas/atm-pressure.schema'
import { WindSpeed, WindSpeedSchema } from '../../shared/schemas/wind-speed.schema'
import { WindDirection, WindDirectionSchema } from '../../shared/schemas/wind-direction.schema'
import { AirQuality, AirQualitySchema } from '../../shared/schemas/air-quality.schema'

@Schema({ collection: 'hcs_topic_messages', timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class HcsTopicMessage {
    @Prop({ type: TemperatureSchema, required: true })
    temperature: Temperature

    @Prop({ type: AtmPressureSchema, required: true })
    atmPressure: AtmPressure

    @Prop({ type: WindSpeedSchema, required: true })
    windSpeed: WindSpeed

    @Prop({ type: WindDirectionSchema, required: true })
    windDirection: WindDirection

    @Prop({ type: AirQualitySchema, required: true })
    airQuality: AirQuality

    @Prop({ type: Number, required: false })
    sequenceNumber?: number

    @Prop({ type: String, required: true })
    topicId: TopicId

    @Prop({ type: Types.ObjectId, required: true })
    deviceId: Types.ObjectId

    @Prop({ type: Types.ObjectId, required: true })
    ownerId: Types.ObjectId
}

export type HcsTopicMessageDocument = HydratedDocument<HcsTopicMessage>
export const HcsTopicMessageSchema = SchemaFactory.createForClass(HcsTopicMessage)
