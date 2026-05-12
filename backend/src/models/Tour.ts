import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TourStatus = 'planificada' | 'en_curso' | 'completada' | 'cancelada';

export interface ITourStop {
  city: string;
  region?: string;
  country: string;
  lat: number;       // -90..90
  lng: number;       // -180..180
  startDate: Date;
  endDate: Date;
  tournamentName?: string;
  notes?: string;
}

export interface ITour extends Document {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: TourStatus;
  stops: ITourStop[];
  responsibleScout?: Types.ObjectId;
  pricePerKidEUR?: number;     // precio que pagan los niños al inscribirse en eventos derivados
  createdAt: Date;
  updatedAt: Date;
}

const stopSchema = new Schema<ITourStop>(
  {
    city: { type: String, required: true, trim: true },
    region: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tournamentName: String,
    notes: String,
  },
  { _id: true }
);

const tourSchema = new Schema<ITour>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    description: String,
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planificada', 'en_curso', 'completada', 'cancelada'],
      default: 'planificada',
      index: true,
    },
    stops: { type: [stopSchema], default: [] },
    responsibleScout: { type: Schema.Types.ObjectId, ref: 'User' },
    pricePerKidEUR: Number,
  },
  { timestamps: true }
);

export const Tour: Model<ITour> = mongoose.model<ITour>('Tour', tourSchema);
