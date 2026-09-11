const STORE_PREVIEW_KEY = 'ecomart_store_preview';

export const isStorePreviewActive = (): boolean => {
  try {
    return sessionStorage.getItem(STORE_PREVIEW_KEY) === '1';
  } catch {
    return false;
  }
};

export const enterStorePreview = (): void => {
  try {
    sessionStorage.setItem(STORE_PREVIEW_KEY, '1');
  } catch {
    // sessionStorage có thể bị chặn
  }
};

export const exitStorePreview = (): void => {
  try {
    sessionStorage.removeItem(STORE_PREVIEW_KEY);
  } catch {
    // sessionStorage có thể bị chặn
  }
};

export const isStaffStorePreviewPathBlocked = (pathname: string): boolean => {
  return (
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/profile' ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/')
  );
};
