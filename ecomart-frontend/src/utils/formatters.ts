/**
 * Format standard currency into Vietnamese Dong (VND) format
 * Example: 15990000 -> 15.990.000 ₫
 */
export const formatCurrency = (amount?: number | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
