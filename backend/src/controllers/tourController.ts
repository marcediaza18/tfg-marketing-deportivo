import { Request, Response } from 'express';
import { z } from 'zod';
import { Tour } from '../models/Tour';
import { Types } from 'mongoose';

const stopSchema = z.object({
  city: z.string().min(1),
  region: z.string().optional(),
  country: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  tournamentName: z.string().optional(),
  notes: z.string().optional(),
});

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(['planificada', 'en_curso', 'completada', 'cancelada']).optional(),
  stops: z.array(stopSchema).optional(),
  responsibleScout: z.string().optional(),
  pricePerKidEUR: z.number().nonnegative().optional(),
});

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await Tour.find()
    .populate('responsibleScout', 'fullName email')
    .sort({ startDate: -1 });
  res.json({ items, total: items.length });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Tour.findById(req.params.id).populate('responsibleScout', 'fullName email');
  if (!item) {
    res.status(404).json({ error: 'Tour no encontrado' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = schema.parse(req.body);
  const created = await Tour.create(data);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = schema.partial().parse(req.body);
  const updated = await Tour.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Tour no encontrado' });
    return;
  }
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await Tour.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Tour no encontrado' });
    return;
  }
  res.status(204).send();
}
