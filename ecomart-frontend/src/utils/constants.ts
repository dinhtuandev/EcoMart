import { OrderStatus } from '../types';

export const ORDER_STATUS: Record<OrderStatus, OrderStatus> = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const ORDER_STATUS_BADGES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border border-rose-200',
};

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const;
