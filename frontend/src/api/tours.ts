import { api } from './client';

export type TourStatus = 'planificada' | 'en_curso' | 'completada' | 'cancelada';

export interface TourStop {
  _id?: string;
  city: string;
  region?: string;
  country: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  tournamentName?: string;
  notes?: string;
}

export interface Tour {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: TourStatus;
  stops: TourStop[];
  responsibleScout?: { _id: string; fullName: string; email: string } | string | null;
  pricePerKidEUR?: number;
  createdAt: string;
}

export interface TourPerformance {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TourStatus;
  stops: TourStop[];
  kidsDiscovered: number;
  kidsInEvents: number;
  conversionRate: number;
  avgRating: number;
  topRating: number;
}

export const listTours = async () =>
  (await api.get<{ items: Tour[]; total: number }>('/tours')).data;
export const getTour = async (id: string) => (await api.get<Tour>(`/tours/${id}`)).data;
export const createTour = async (p: Partial<Tour> & { stops?: TourStop[] }) =>
  (await api.post<Tour>('/tours', p)).data;
export const updateTour = async (id: string, p: Partial<Tour> & { stops?: TourStop[] }) =>
  (await api.put<Tour>(`/tours/${id}`, p)).data;
export const deleteTour = async (id: string) => {
  await api.delete(`/tours/${id}`);
};

export const getTourPerformance = async () =>
  (await api.get<TourPerformance[]>('/dashboard/tour-performance')).data;
