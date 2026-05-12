import { Request, Response } from 'express';
import { Athlete } from '../models/Athlete';
import { Client } from '../models/Client';
import { Event } from '../models/Event';
import { Sponsorship } from '../models/Sponsorship';
import { Product } from '../models/Product';
import { ScoutingRoute } from '../models/ScoutingRoute';

export async function summary(_req: Request, res: Response): Promise<void> {
  const [athletes, clients, events, sponsorships, products, scoutingRoutes] = await Promise.all([
    Athlete.countDocuments(),
    Client.countDocuments({ isActive: true }),
    Event.countDocuments(),
    Sponsorship.countDocuments(),
    Product.countDocuments({ isActive: true }),
    ScoutingRoute.countDocuments(),
  ]);

  const revenueAgg = await Sponsorship.aggregate([
    { $match: { status: { $in: ['activo', 'finalizado'] } } },
    { $group: { _id: null, total: { $sum: '$amountEUR' } } },
  ]);

  const productRevenue = await Product.aggregate([
    { $group: { _id: null, total: { $sum: '$revenueEUR' } } },
  ]);

  res.json({
    counts: { athletes, clients, events, sponsorships, products, scoutingRoutes },
    revenue: {
      sponsorshipsEUR: revenueAgg[0]?.total ?? 0,
      productsEUR: productRevenue[0]?.total ?? 0,
    },
  });
}

export async function athletesByStatus(_req: Request, res: Response): Promise<void> {
  const data = await Athlete.aggregate([
    { $group: { _id: '$status', value: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
    { $sort: { value: -1 } },
  ]);
  res.json(data);
}

export async function athletesByPosition(_req: Request, res: Response): Promise<void> {
  const data = await Athlete.aggregate([
    { $match: { position: { $ne: null } } },
    { $group: { _id: '$position', value: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
    { $sort: { value: -1 } },
  ]);
  res.json(data);
}

export async function sponsorshipsByMonth(_req: Request, res: Response): Promise<void> {
  const data = await Sponsorship.aggregate([
    {
      $group: {
        _id: { year: { $year: '$startDate' }, month: { $month: '$startDate' } },
        total: { $sum: '$amountEUR' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        label: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] },
            { $toString: '$_id.month' },
          ],
        },
        total: 1,
        count: 1,
      },
    },
  ]);
  res.json(data);
}

export async function productsByCategory(_req: Request, res: Response): Promise<void> {
  const data = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        revenue: { $sum: '$revenueEUR' },
        units: { $sum: '$unitsSold' },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, name: '$_id', revenue: 1, units: 1, count: 1 } },
    { $sort: { revenue: -1 } },
  ]);
  res.json(data);
}

export async function scoutingFunnel(_req: Request, res: Response): Promise<void> {
  const data = await ScoutingRoute.aggregate([
    { $group: { _id: '$outcome', value: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
  ]);
  res.json(data);
}
