import { api } from './client';

export type ClientType = 'marca' | 'club' | 'medio' | 'institucion' | 'otro';

export interface Client {
  _id: string;
  name: string;
  type: ClientType;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  industry?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export const listClients = async () =>
  (await api.get<{ items: Client[]; total: number }>('/clients')).data;
export const getClient = async (id: string) => (await api.get<Client>(`/clients/${id}`)).data;
export const createClient = async (p: Partial<Client>) =>
  (await api.post<Client>('/clients', p)).data;
export const updateClient = async (id: string, p: Partial<Client>) =>
  (await api.put<Client>(`/clients/${id}`, p)).data;
export const deleteClient = async (id: string) => {
  await api.delete(`/clients/${id}`);
};
