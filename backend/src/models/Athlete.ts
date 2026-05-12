import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type AthleteStatus = 'prospecto' | 'en_seguimiento' | 'contactado' | 'firmado' | 'descartado';

export interface IAthlete extends Document {
  fullName: string;
  birthDate?: Date;
  nationality?: string;
  position?: string;          // p.ej. portero, defensa central, mediocentro...
  preferredFoot?: 'izquierdo' | 'derecho' | 'ambidiestro';
  heightCm?: number;
  weightKg?: number;
  currentClub?: string;
  marketValueEUR?: number;
  status: AthleteStatus;
  tags: string[];
  notes?: string;
  discoveredAtTour?: Types.ObjectId;     // tour donde se descubrió al niño
  discoveredAtStopIdx?: number;          // índice de la parada dentro del tour
  averageRating?: number;                // rating medio agregado (1-10), calculado externamente
  createdBy: Types.ObjectId;  // ojeador que lo registró
  createdAt: Date;
  updatedAt: Date;
}

const athleteSchema = new Schema<IAthlete>(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    birthDate: Date,
    nationality: String,
    position: { type: String, index: true },
    preferredFoot: { type: String, enum: ['izquierdo', 'derecho', 'ambidiestro'] },
    heightCm: Number,
    weightKg: Number,
    currentClub: { type: String, index: true },
    marketValueEUR: Number,
    status: {
      type: String,
      enum: ['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado'],
      default: 'prospecto',
      index: true,
    },
    tags: { type: [String], default: [] },
    notes: String,
    discoveredAtTour: { type: Schema.Types.ObjectId, ref: 'Tour', index: true },
    discoveredAtStopIdx: { type: Number, min: 0 },
    averageRating: { type: Number, min: 0, max: 10 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

athleteSchema.index({ fullName: 'text', currentClub: 'text', notes: 'text' });

export const Athlete: Model<IAthlete> = mongoose.model<IAthlete>('Athlete', athleteSchema);
