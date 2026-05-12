import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../api/auth';

export function useHasRole(...roles: UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return roles.includes(user.role);
}
