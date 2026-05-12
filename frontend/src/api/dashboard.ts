import { api } from './client';

export interface SummaryResponse {
  counts: {
    athletes: number;
    clients: number;
    events: number;
    sponsorships: number;
    products: number;
    scoutingRoutes: number;
  };
  revenue: {
    sponsorshipsEUR: number;
    productsEUR: number;
  };
}

export interface NameValue {
  name: string;
  value: number;
}

export async function getSummary(): Promise<SummaryResponse> {
  const res = await api.get('/dashboard/summary');
  return res.data;
}

export async function getAthletesByStatus(): Promise<NameValue[]> {
  return (await api.get('/dashboard/athletes-by-status')).data;
}

export async function getAthletesByPosition(): Promise<NameValue[]> {
  return (await api.get('/dashboard/athletes-by-position')).data;
}

export async function getSponsorshipsByMonth(): Promise<{ label: string; total: number; count: number }[]> {
  return (await api.get('/dashboard/sponsorships-by-month')).data;
}

export async function getProductsByCategory(): Promise<{ name: string; revenue: number; units: number; count: number }[]> {
  return (await api.get('/dashboard/products-by-category')).data;
}

export async function getScoutingFunnel(): Promise<NameValue[]> {
  return (await api.get('/dashboard/scouting-funnel')).data;
}
