import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type EventType = 'partido' | 'torneo' | 'rueda_prensa' | 'campana' | 'activacion' | 'otro';

export interface IEvent extends Document {
  title: string;
  type: EventType;
  startDate: Date;
  endDate?: Date;
  location?: string;
  client?: Types.ObjectId;
  participatingAthletes: Types.ObjectId[];
  budgetEUR?: number;
  actualCostEUR?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['partido', 'torneo', 'rueda_prensa', 'campana', 'activacion', 'otro'],
      default: 'otro',
    },
    startDate: { type: Date, required: true, index: true },
    endDate: Date,
    location: String,
    client: { type: Schema.Types.ObjectId, ref: 'Client' },
    participatingAthletes: [{ type: Schema.Types.ObjectId, ref: 'Athlete' }],
    budgetEUR: Number,
    actualCostEUR: Number,
    description: String,
  },
  { timestamps: true }
);

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
