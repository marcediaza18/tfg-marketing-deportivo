import { api } from './client';

export type AthleteStatus = 'prospecto' | 'en_seguimiento' | 'contactado' | 'firmado' | 'descartado';
export type EducationLevel = 'primaria' | 'secundaria' | 'bachillerato' | 'fp' | 'universitario' | 'otro';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PreferredFoot = 'izquierdo' | 'derecho' | 'ambidiestro';

export interface Athlete {
  _id: string;

  // Identidad
  fullName: string;
  birthDate?: string;
  nationality?: string;
  documentId?: string;
  photoUrl?: string;

  // Contacto
  email?: string;
  phone?: string;
  addressCity?: string;
  addressCountry?: string;
  languages?: string[];

  // Tutor
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;

  // Estudios
  educationLevel?: EducationLevel;
  schoolName?: string;

  // Físico
  heightCm?: number;
  weightKg?: number;
  preferredFoot?: PreferredFoot;

  // Técnico
  position?: string;
  secondaryPositions?: string[];
  yearsPlaying?: number;
  currentClub?: string;
  jerseyNumber?: number;
  isCaptain?: boolean;
  matchesPlayed?: number;
  goalsScored?: number;
  assists?: number;
  sprint40mSeconds?: number;
  cooperTestKm?: number;

  // Médico
  bloodType?: BloodType;
  allergies?: string[];
  injuries?: string;
  lastMedicalCheckDate?: string;

  // Comercial
  marketValueEUR?: number;
  signedAt?: string;
  contractEndsAt?: string;
  agreedFeeEUR?: number;

  // Estado y procedencia
  status: AthleteStatus;
  tags: string[];
  notes?: string;
  discoveredAtTour?: { _id: string; name: string; stops?: unknown[] } | string | null;
  discoveredAtStopIdx?: number;
  averageRating?: number;

  createdAt: string;
}

export type AthletePayload = Partial<Athlete> & { discoveredAtTour?: string };

export async function listAthletes(params?: { q?: string; status?: string; tour?: string }): Promise<{ items: Athlete[]; total: number }> {
  return (await api.get('/athletes', { params })).data;
}

export async function getAthlete(id: string): Promise<Athlete> {
  return (await api.get(`/athletes/${id}`)).data;
}

export async function createAthlete(payload: AthletePayload): Promise<Athlete> {
  return (await api.post('/athletes', payload)).data;
}

export async function updateAthlete(id: string, payload: AthletePayload): Promise<Athlete> {
  return (await api.put(`/athletes/${id}`, payload)).data;
}

export async function deleteAthlete(id: string): Promise<void> {
  await api.delete(`/athletes/${id}`);
}

/** Edad calculada desde birthDate. Devuelve null si no hay fecha. */
export function ageFromBirth(birthDate?: string): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
