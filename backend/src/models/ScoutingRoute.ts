import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ScoutingStageStatus = 'planificado' | 'en_curso' | 'completado' | 'descartado';

export interface IScoutingStage {
  date: Date;
  location: string;
  observations?: string;
  ratingOverall?: number;     // 1-10
  ratingTechnical?: number;
  ratingPhysical?: number;
  ratingTactical?: number;
  ratingMental?: number;
  status: ScoutingStageStatus;
}

export interface IScoutingRoute extends Document {
  athlete: Types.ObjectId;
  scout: Types.ObjectId;        // user (rol ojeador) responsable
  startedAt: Date;
  closedAt?: Date;
  outcome: 'abierta' | 'firmado' | 'descartado';
  stages: IScoutingStage[];
  createdAt: Date;
  updatedAt: Date;
}

const stageSchema = new Schema<IScoutingStage>(
  {
    date: { type: Date, required: true },
    location: { type: String, required: true },
    observations: String,
    ratingOverall: { type: Number, min: 1, max: 10 },
    ratingTechnical: { type: Number, min: 1, max: 10 },
    ratingPhysical: { type: Number, min: 1, max: 10 },
    ratingTactical: { type: Number, min: 1, max: 10 },
    ratingMental: { type: Number, min: 1, max: 10 },
    status: {
      type: String,
      enum: ['planificado', 'en_curso', 'completado', 'descartado'],
      default: 'planificado',
    },
  },
  { _id: true, timestamps: true }
);

const scoutingRouteSchema = new Schema<IScoutingRoute>(
  {
    athlete: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true, index: true },
    scout: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startedAt: { type: Date, required: true, default: Date.now },
    closedAt: Date,
    outcome: {
      type: String,
      enum: ['abierta', 'firmado', 'descartado'],
      default: 'abierta',
      index: true,
    },
    stages: { type: [stageSchema], default: [] },
  },
  { timestamps: true }
);

export const ScoutingRoute: Model<IScoutingRoute> =
  mongoose.model<IScoutingRoute>('ScoutingRoute', scoutingRouteSchema);
