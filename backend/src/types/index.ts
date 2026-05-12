export type UserRole = 'ojeador' | 'gestor_productos' | 'direccion';

export const ALL_ROLES: UserRole[] = ['ojeador', 'gestor_productos', 'direccion'];

export interface JwtPayload {
  sub: string;        // user id
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
