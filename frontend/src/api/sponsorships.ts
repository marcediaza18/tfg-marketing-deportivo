import { api } from './client';
import { PopulatedRef } from './events';

export type SponsorshipStatus = 'borrador' | 'negociacion' | 'activo' | 'finalizado' | 'cancelado';

export interface Sponsorship {
  _id: string;
  client: PopulatedRef | string;
  athlete?: PopulatedRef | string | null;
  event?: PopulatedRef | string | null;
  amountEUR: number;
  startDate: string;
  endDate: string;
  status: SponsorshipStatus;
  description?: string;
  createdAt: string;
}

export const listSponsorships = async () =>
  (await api.get<{ items: Sponsorship[]; total: number }>('/sponsorships')).data;
export const createSponsorship = async (p: {
  client: string;
  athlete?: string;
  event?: string;
  amountEUR: number;
  startDate: string;
  endDate: string;
  status?: SponsorshipStatus;
  description?: string;
}) => (await api.post<Sponsorship>('/sponsorships', p)).data;
export const updateSponsorship = async (
  id: string,
  p: Partial<{
    client: string;
    athlete?: string;
    event?: string;
    amountEUR: number;
    startDate: string;
    endDate: string;
    status: SponsorshipStatus;
    description?: string;
  }>
) => (await api.put<Sponsorship>(`/sponsorships/${id}`, p)).data;
export const deleteSponsorship = async (id: string) => {
  await api.delete(`/sponsorships/${id}`);
};
