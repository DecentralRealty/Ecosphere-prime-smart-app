import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, HydratedDocument } from 'mongoose'
import { TopicId } from '@hashgraph/sdk'

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class HcsTopic {
  @Prop({ type: String, required: true })
  hederaTopicId: TopicId

  @Prop({ type: String, required: true })
  hederaTopicName: string
}

export type HcsTopicDocument = HydratedDocument<HcsTopic>
export const HcsTopicSchema = SchemaFactory.createForClass(HcsTopic)
