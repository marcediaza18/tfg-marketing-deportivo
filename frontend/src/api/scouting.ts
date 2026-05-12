import { api } from './client';
import { PopulatedRef } from './events';

export type StageStatus = 'planificado' | 'en_curso' | 'completado' | 'descartado';
export type RouteOutcome = 'abierta' | 'firmado' | 'descartado';

export interface ScoutingStage {
  _id?: string;
  date: string;
  location: string;
  observations?: string;
  ratingOverall?: number;
  ratingTechnical?: number;
  ratingPhysical?: number;
  ratingTactical?: number;
  ratingMental?: number;
  status: StageStatus;
}

export interface ScoutingRoute {
  _id: string;
  athlete: PopulatedRef | string;
  scout: PopulatedRef | string;
  startedAt: string;
  closedAt?: string;
  outcome: RouteOutcome;
  stages: ScoutingStage[];
  createdAt: string;
}

export const listRoutes = async () =>
  (await api.get<{ items: ScoutingRoute[]; total: number }>('/scouting')).data;
export const getRoute = async (id: string) =>
  (await api.get<ScoutingRoute>(`/scouting/${id}`)).data;
export const createRoute = async (p: { athlete: string; outcome?: RouteOutcome }) =>
  (await api.post<ScoutingRoute>('/scouting', p)).data;
export const updateRoute = async (id: string, p: { outcome?: RouteOutcome; closedAt?: string }) =>
  (await api.put<ScoutingRoute>(`/scouting/${id}`, p)).data;
export const addStage = async (id: string, stage: Omit<ScoutingStage, '_id'>) =>
  (await api.post<ScoutingRoute>(`/scouting/${id}/stages`, stage)).data;
export const deleteRoute = async (id: string) => {
  await api.delete(`/scouting/${id}`);
};
