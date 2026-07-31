export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.COMPLETED]: 'Đã hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

export const ORDER_STATUS_BADGES = {
  [ORDER_STATUS.PENDING]: 'bg-amber-100 text-amber-800 border border-amber-200',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800 border border-blue-200',
  [ORDER_STATUS.COMPLETED]: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  [ORDER_STATUS.CANCELLED]: 'bg-rose-100 text-rose-800 border border-rose-200',
};

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
};
