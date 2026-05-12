import { Request, Response } from 'express';
import { z } from 'zod';
import { Event } from '../models/Event';
import { Types } from 'mongoose';

const schema = z.object({
  title: z.string().min(2),
  type: z.enum(['partido', 'torneo', 'rueda_prensa', 'campana', 'activacion', 'otro']).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
  client: z.string().optional(),
  participatingAthletes: z.array(z.string()).optional(),
  budgetEUR: z.number().nonnegative().optional(),
  actualCostEUR: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await Event.find()
    .populate('client', 'name type')
    .populate('participatingAthletes', 'fullName position')
    .sort({ startDate: -1 });
  res.json({ items, total: items.length });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Event.findById(req.params.id)
    .populate('client', 'name type')
    .populate('participatingAthletes', 'fullName position');
  if (!item) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = schema.parse(req.body);
  const created = await Event.create(data);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = schema.partial().parse(req.body);
  const updated = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await Event.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  res.status(204).send();
}
