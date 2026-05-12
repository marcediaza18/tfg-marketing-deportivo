import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

const schema = z.object({
  name: z.string().min(2),
  category: z
    .enum([
      'representacion',
      'patrocinio',
      'organizacion_eventos',
      'comunicacion',
      'marketing_digital',
      'consultoria',
      'otro',
    ])
    .optional(),
  description: z.string().optional(),
  basePriceEUR: z.number().nonnegative(),
  isActive: z.boolean().optional(),
  unitsSold: z.number().int().nonnegative().optional(),
  revenueEUR: z.number().nonnegative().optional(),
});

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await Product.find().sort({ name: 1 });
  res.json({ items, total: items.length });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await Product.findById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = schema.parse(req.body);
  const created = await Product.create(data);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = schema.partial().parse(req.body);
  const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return;
  }
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await Product.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return;
  }
  res.status(204).send();
}
