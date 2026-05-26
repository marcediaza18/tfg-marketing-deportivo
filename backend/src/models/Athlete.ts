import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type AthleteStatus = 'prospecto' | 'en_seguimiento' | 'contactado' | 'firmado' | 'descartado';
export type EducationLevel = 'primaria' | 'secundaria' | 'bachillerato' | 'fp' | 'universitario' | 'otro';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface IAthlete extends Document {
  // Identidad
  fullName: string;
  birthDate?: Date;
  nationality?: string;
  documentId?: string;       // DNI/Passport
  photoUrl?: string;

  // Contacto (puede ser propio o, si es menor, del tutor)
  email?: string;
  phone?: string;
  addressCity?: string;
  addressCountry?: string;
  languages?: string[];

  // Datos del tutor legal (para menores)
  guardianName?: string;
  guardianRelation?: string;  // padre, madre, tío, etc.
  guardianPhone?: string;
  guardianEmail?: string;

  // Estudios
  educationLevel?: EducationLevel;
  schoolName?: string;

  // Físico
  heightCm?: number;
  weightKg?: number;
  preferredFoot?: 'izquierdo' | 'derecho' | 'ambidiestro';

  // Técnico-deportivo
  position?: string;
  secondaryPositions?: string[];
  yearsPlaying?: number;
  currentClub?: string;
  jerseyNumber?: number;
  isCaptain?: boolean;
  matchesPlayed?: number;
  goalsScored?: number;
  assists?: number;
  sprint40mSeconds?: number;       // tiempo en 40 metros
  cooperTestKm?: number;           // distancia en el test de cooper (12 min)

  // Médico
  bloodType?: BloodType;
  allergies?: string[];
  injuries?: string;
  lastMedicalCheckDate?: Date;

  // Comercial / agencia
  marketValueEUR?: number;
  signedAt?: Date;
  contractEndsAt?: Date;
  agreedFeeEUR?: number;

  // Estado y procedencia
  status: AthleteStatus;
  tags: string[];
  notes?: string;
  discoveredAtTour?: Types.ObjectId;
  discoveredAtStopIdx?: number;
  averageRating?: number;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const athleteSchema = new Schema<IAthlete>(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    birthDate: Date,
    nationality: String,
    documentId: { type: String, trim: true, index: true, sparse: true },
    photoUrl: String,

    email: { type: String, trim: true, lowercase: true },
    phone: String,
    addressCity: String,
    addressCountry: String,
    languages: { type: [String], default: [] },

    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    guardianEmail: { type: String, trim: true, lowercase: true },

    educationLevel: {
      type: String,
      enum: ['primaria', 'secundaria', 'bachillerato', 'fp', 'universitario', 'otro'],
    },
    schoolName: String,

    heightCm: Number,
    weightKg: Number,
    preferredFoot: { type: String, enum: ['izquierdo', 'derecho', 'ambidiestro'] },

    position: { type: String, index: true },
    secondaryPositions: { type: [String], default: [] },
    yearsPlaying: { type: Number, min: 0 },
    currentClub: { type: String, index: true },
    jerseyNumber: { type: Number, min: 1, max: 99 },
    isCaptain: { type: Boolean, default: false },
    matchesPlayed: { type: Number, min: 0 },
    goalsScored: { type: Number, min: 0 },
    assists: { type: Number, min: 0 },
    sprint40mSeconds: { type: Number, min: 0 },
    cooperTestKm: { type: Number, min: 0 },

    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    allergies: { type: [String], default: [] },
    injuries: String,
    lastMedicalCheckDate: Date,

    marketValueEUR: { type: Number, min: 0 },
    signedAt: Date,
    contractEndsAt: Date,
    agreedFeeEUR: { type: Number, min: 0 },

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

athleteSchema.index({ fullName: 'text', currentClub: 'text', notes: 'text', addressCity: 'text' });

export const Athlete: Model<IAthlete> = mongoose.model<IAthlete>('Athlete', athleteSchema);
