import { Request, Response } from 'express';
import { z } from 'zod';
import { Athlete } from '../models/Athlete';
import { Types } from 'mongoose';

const baseSchema = z.object({
  fullName: z.string().min(2),
  birthDate: z.coerce.date().optional(),
  nationality: z.string().optional(),
  documentId: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),

  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  addressCity: z.string().optional(),
  addressCountry: z.string().optional(),
  languages: z.array(z.string()).optional(),

  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal('')),

  educationLevel: z.enum(['primaria', 'secundaria', 'bachillerato', 'fp', 'universitario', 'otro']).optional(),
  schoolName: z.string().optional(),

  heightCm: z.number().int().positive().optional(),
  weightKg: z.number().positive().optional(),
  preferredFoot: z.enum(['izquierdo', 'derecho', 'ambidiestro']).optional(),

  position: z.string().optional(),
  secondaryPositions: z.array(z.string()).optional(),
  yearsPlaying: z.number().int().nonnegative().optional(),
  currentClub: z.string().optional(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  isCaptain: z.boolean().optional(),
  matchesPlayed: z.number().int().nonnegative().optional(),
  goalsScored: z.number().int().nonnegative().optional(),
  assists: z.number().int().nonnegative().optional(),
  sprint40mSeconds: z.number().nonnegative().optional(),
  cooperTestKm: z.number().nonnegative().optional(),

  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).optional(),
  injuries: z.string().optional(),
  lastMedicalCheckDate: z.coerce.date().optional(),

  marketValueEUR: z.number().nonnegative().optional(),
  signedAt: z.coerce.date().optional(),
  contractEndsAt: z.coerce.date().optional(),
  agreedFeeEUR: z.number().nonnegative().optional(),

  status: z.enum(['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  discoveredAtTour: z.string().optional(),
  discoveredAtStopIdx: z.number().int().nonnegative().optional(),
  averageRating: z.number().min(0).max(10).optional(),
});

export async function list(req: Request, res: Response): Promise<void> {
  const { q, status, position, club, tour, limit = '50', skip = '0' } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (position) filter.position = position;
  if (club) filter.currentClub = club;
  if (tour && Types.ObjectId.isValid(String(tour))) filter.discoveredAtTour = tour;
  if (q) filter.$text = { $search: String(q) };
  const items = await Athlete.find(filter)
    .populate('discoveredAtTour', 'name')
    .sort({ createdAt: -1 })
    .skip(parseInt(String(skip), 10))
    .limit(Math.min(parseInt(String(limit), 10), 500));
  const total = await Athlete.countDocuments(filter);
  res.json({ items, total });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Athlete.findById(req.params.id).populate('discoveredAtTour', 'name stops');
  if (!item) {
    res.status(404).json({ error: 'Deportista no encontrado' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = baseSchema.parse(req.body);
  const created = await Athlete.create({ ...data, createdBy: req.user!.sub });
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = baseSchema.partial().parse(req.body);
  const updated = await Athlete.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Deportista no encontrado' });
    return;
  }
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await Athlete.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Deportista no encontrado' });
    return;
  }
  res.status(204).send();
}
