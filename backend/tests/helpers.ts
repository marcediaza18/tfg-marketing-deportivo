import { User } from '../src/models/User';
import { UserRole } from '../src/types';

/** Crea un usuario con el rol indicado y devuelve sus credenciales. */
export async function createUser(role: UserRole, suffix = '') {
  const email = `${role}${suffix}@test.local`;
  const password = 'password12345';
  const user = new User({ email, fullName: `Test ${role}`, role, passwordHash: 'tmp' });
  await user.setPassword(password);
  await user.save();
  return { user, email, password };
}
