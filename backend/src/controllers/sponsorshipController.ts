import { Request, Response } from 'express';
import { z } from 'zod';
import { Sponsorship } from '../models/Sponsorship';
import { Types } from 'mongoose';

const schema = z.object({
  client: z.string(),
  athlete: z.string().optional(),
  event: z.string().optional(),
  amountEUR: z.number().nonnegative(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(['borrador', 'negociacion', 'activo', 'finalizado', 'cancelado']).optional(),
  description: z.string().optional(),
});

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await Sponsorship.find()
    .populate('client', 'name type')
    .populate('athlete', 'fullName position')
    .populate('event', 'title startDate')
    .sort({ startDate: -1 });
  res.json({ items, total: items.length });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Sponsorship.findById(req.params.id)
    .populate('client', 'name type')
    .populate('athlete', 'fullName position')
    .populate('event', 'title startDate');
  if (!item) {
    res.status(404).json({ error: 'Patrocinio no encontrado' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = schema.parse(req.body);
  const created = await Sponsorship.create(data);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = schema.partial().parse(req.body);
  const updated = await Sponsorship.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Patrocinio no encontrado' });
    return;
  }
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await Sponsorship.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Patrocinio no encontrado' });
    return;
  }
  res.status(204).send();
}
