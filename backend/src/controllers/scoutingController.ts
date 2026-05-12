import { Request, Response } from 'express';
import { z } from 'zod';
import { ScoutingRoute } from '../models/ScoutingRoute';
import { Types } from 'mongoose';

const stageSchema = z.object({
  date: z.coerce.date(),
  location: z.string().min(2),
  observations: z.string().optional(),
  ratingOverall: z.number().min(1).max(10).optional(),
  ratingTechnical: z.number().min(1).max(10).optional(),
  ratingPhysical: z.number().min(1).max(10).optional(),
  ratingTactical: z.number().min(1).max(10).optional(),
  ratingMental: z.number().min(1).max(10).optional(),
  status: z.enum(['planificado', 'en_curso', 'completado', 'descartado']).optional(),
});

const createSchema = z.object({
  athlete: z.string(),
  startedAt: z.coerce.date().optional(),
  outcome: z.enum(['abierta', 'firmado', 'descartado']).optional(),
});

const updateSchema = z.object({
  closedAt: z.coerce.date().optional(),
  outcome: z.enum(['abierta', 'firmado', 'descartado']).optional(),
});

export async function list(req: Request, res: Response): Promise<void> {
  const { outcome, scout, athlete } = req.query;
  const filter: Record<string, unknown> = {};
  if (outcome) filter.outcome = outcome;
  if (scout && Types.ObjectId.isValid(String(scout))) filter.scout = scout;
  if (athlete && Types.ObjectId.isValid(String(athlete))) filter.athlete = athlete;
  const items = await ScoutingRoute.find(filter)
    .populate('athlete', 'fullName position currentClub')
    .populate('scout', 'fullName email')
    .sort({ startedAt: -1 });
  res.json({ items, total: items.length });
}

export async function get(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const item = await ScoutingRoute.findById(req.params.id)
    .populate('athlete')
    .populate('scout', 'fullName email');
  if (!item) {
    res.status(404).json({ error: 'Ruta de captación no encontrada' });
    return;
  }
  res.json(item);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = createSchema.parse(req.body);
  const created = await ScoutingRoute.create({
    ...data,
    scout: req.user!.sub,
    startedAt: data.startedAt ?? new Date(),
  });
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = updateSchema.parse(req.body);
  const updated = await ScoutingRoute.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updated) {
    res.status(404).json({ error: 'Ruta no encontrada' });
    return;
  }
  res.json(updated);
}

export async function addStage(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const data = stageSchema.parse(req.body);
  const route = await ScoutingRoute.findByIdAndUpdate(
    req.params.id,
    { $push: { stages: data } },
    { new: true }
  );
  if (!route) {
    res.status(404).json({ error: 'Ruta no encontrada' });
    return;
  }
  res.status(201).json(route);
}

export async function remove(req: Request, res: Response): Promise<void> {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }
  const removed = await ScoutingRoute.findByIdAndDelete(req.params.id);
  if (!removed) {
    res.status(404).json({ error: 'Ruta no encontrada' });
    return;
  }
  res.status(204).send();
}
