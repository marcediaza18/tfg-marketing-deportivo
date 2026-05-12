import { api } from './client';

export type EventType = 'partido' | 'torneo' | 'rueda_prensa' | 'campana' | 'activacion' | 'otro';

export interface PopulatedRef {
  _id: string;
  [k: string]: unknown;
}

export interface SportEvent {
  _id: string;
  title: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location?: string;
  client?: PopulatedRef | string | null;
  participatingAthletes?: PopulatedRef[] | string[];
  budgetEUR?: number;
  actualCostEUR?: number;
  description?: string;
  createdAt: string;
}

export const listEvents = async () =>
  (await api.get<{ items: SportEvent[]; total: number }>('/events')).data;
export const createEvent = async (p: Partial<SportEvent> & { client?: string; participatingAthletes?: string[] }) =>
  (await api.post<SportEvent>('/events', p)).data;
export const updateEvent = async (
  id: string,
  p: Partial<SportEvent> & { client?: string; participatingAthletes?: string[] }
) => (await api.put<SportEvent>(`/events/${id}`, p)).data;
export const deleteEvent = async (id: string) => {
  await api.delete(`/events/${id}`);
};
