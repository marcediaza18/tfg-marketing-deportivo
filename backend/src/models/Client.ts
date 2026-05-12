import mongoose, { Schema, Document, Model } from 'mongoose';

export type ClientType = 'marca' | 'club' | 'medio' | 'institucion' | 'otro';

export interface IClient extends Document {
  name: string;
  type: ClientType;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  industry?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    type: {
      type: String,
      enum: ['marca', 'club', 'medio', 'institucion', 'otro'],
      default: 'marca',
    },
    contactEmail: String,
    contactPhone: String,
    country: String,
    industry: String,
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Client: Model<IClient> = mongoose.model<IClient>('Client', clientSchema);
