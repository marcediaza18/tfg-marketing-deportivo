import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { env } from '../config/env';
import { ALL_ROLES, JwtPayload } from '../types';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  fullName: z.string().min(2),
  role: z.enum(ALL_ROLES as [string, ...string[]]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user: { id: string; email: string; role: string }): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role as JwtPayload['role'],
  };
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export async function register(req: Request, res: Response): Promise<void> {
  const data = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: data.email });
  if (exists) {
    res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    return;
  }
  const user = new User({
    email: data.email,
    fullName: data.fullName,
    role: data.role ?? 'ojeador',
    passwordHash: 'placeholder',
  });
  await user.setPassword(data.password);
  await user.save();
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email });
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  const ok = await user.verifyPassword(data.password);
  if (!ok) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({ user, token });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  const user = await User.findById(req.user.sub);
  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  res.json({ user });
}
