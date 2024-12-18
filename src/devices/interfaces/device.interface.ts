import { Types, Document } from 'mongoose';
import { Point } from '../../shared/schemas/point.schema';

export interface Device extends Document {
  name: string
  uuid: string
  location: Point
  hederaAccount: string
  privateKey: string
  publicKey: string
  createdAt: Date
  updatedAt: Date
  owner: Types.ObjectId
}
