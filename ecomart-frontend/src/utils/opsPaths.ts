/**
 * Base path khu vực vận hành theo vai trò.
 * ADMIN dùng /admin/users; MANAGER dùng /manager.
 */
export const getOpsBasePath = (role?: string): string =>
  role === 'ADMIN' ? '/admin/users' : '/manager';

export const getOpsProfilePath = (role?: string): string =>
  role === 'ADMIN' ? '/admin/profile' : '/manager/profile';
