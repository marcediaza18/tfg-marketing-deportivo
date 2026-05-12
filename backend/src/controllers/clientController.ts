import { Request, Response } from 'express';
import { z } from 'zod';
import { Client } from '../models/Client';
import { Types } from 'mongoose';

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(['marca', 'club', 'medio', 'institucion', 'otro']).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await Client.find().sort({ name: 1 });
  res.json({ items, total: items.length });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Client.findById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Cliente no encontrado' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = schema.parse(req.body);
  const created = await Client.create(data);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = schema.partial().parse(req.body);
  const updated = await Client.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Cliente no encontrado' });
    return;
  }
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await Client.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Cliente no encontrado' });
    return;
  }
  res.status(204).send();
}
