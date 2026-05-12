import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type SponsorshipStatus = 'borrador' | 'negociacion' | 'activo' | 'finalizado' | 'cancelado';

export interface ISponsorship extends Document {
  client: Types.ObjectId;
  athlete?: Types.ObjectId;
  event?: Types.ObjectId;
  amountEUR: number;
  startDate: Date;
  endDate: Date;
  status: SponsorshipStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorshipSchema = new Schema<ISponsorship>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    athlete: { type: Schema.Types.ObjectId, ref: 'Athlete', index: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
    amountEUR: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['borrador', 'negociacion', 'activo', 'finalizado', 'cancelado'],
      default: 'borrador',
      index: true,
    },
    description: String,
  },
  { timestamps: true }
);

export const Sponsorship: Model<ISponsorship> =
  mongoose.model<ISponsorship>('Sponsorship', sponsorshipSchema);
