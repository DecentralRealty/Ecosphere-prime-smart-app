// import { Schema } from 'mongoose';

// export const DeviceSchema = new Schema({
//   name: { type: String, required: true },
//   uuid: { type: String, required: true, unique: true },
//   registerDateTime: { type: Date, default: Date.now },
//   updateDateTime: { type: Date, default: Date.now },
//   owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   hederaAccount: { type: String, required: true },
//   pk:{type:String,require:true},
// });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, HydratedDocument } from 'mongoose'
import { Point, PointSchema } from '../../shared/schemas/point.schema'
import { HcsTopic, HcsTopicSchema } from '../../hcs/schemas/hcs-topic.schema'

@Schema({ collection: 'devices', timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Device {
  @Prop({ type: String, required: true })
  name: string

  @Prop({ type: String, required: true, unique: true })
  uuid: string

  @Prop({ type: PointSchema, required: false,default: { type: 'Point', coordinates: [3.2041314065966557, 101.71598555211582] },  })
  location: Point

  @Prop({ type: String, required: true })
  hederaAccount: string

  @Prop({ type: String, required: true,select: false  })
  privateKey: string
  
  @Prop({ type: String, required: true,select: true  })
  publicKey: string

  @Prop({ type: [HcsTopicSchema], required: true })
  hcsTopics: HcsTopic[]

  // Foreign fields
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  owner: Types.ObjectId
}

export type DeviceDocument = HydratedDocument<Device>
export const DeviceSchema = SchemaFactory.createForClass(Device)
