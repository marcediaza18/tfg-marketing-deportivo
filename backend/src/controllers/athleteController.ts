import { Request, Response } from 'express';
import { z } from 'zod';
import { Athlete } from '../models/Athlete';
import { Types } from 'mongoose';

const baseSchema = z.object({
  fullName: z.string().min(2),
  birthDate: z.coerce.date().optional(),
  nationality: z.string().optional(),
  position: z.string().optional(),
  preferredFoot: z.enum(['izquierdo', 'derecho', 'ambidiestro']).optional(),
  heightCm: z.number().int().positive().optional(),
  weightKg: z.number().positive().optional(),
  currentClub: z.string().optional(),
  marketValueEUR: z.number().nonnegative().optional(),
  status: z.enum(['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function list(req: Request, res: Response): Promise<void> {
  const { q, status, position, club, limit = '50', skip = '0' } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (position) filter.position = position;
  if (club) filter.currentClub = club;
  if (q) filter.$text = { $search: String(q) };
  const items = await Athlete.find(filter)
    .sort({ createdAt: -1 })
    .skip(parseInt(String(skip), 10))
    .limit(Math.min(parseInt(String(limit), 10), 200));
  const total = await Athlete.countDocuments(filter);
  res.json({ items, total });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Athlete.findById(req.params.id);
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
