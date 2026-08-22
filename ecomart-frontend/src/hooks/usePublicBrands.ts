import { useState, useEffect, useCallback } from 'react';
import { brandApi } from '../services/brandApi';
import { Brand } from '../types';

// In-memory module-level cache để chống gọi API lặp
let cachedBrands: Brand[] | null = null;
let activePromise: Promise<Brand[]> | null = null;

/**
 * Custom Hook usePublicBrands
 * Lấy danh sách thương hiệu đối tác đang hoạt động với bộ nhớ đệm (In-Memory Cache)
 * Đảm bảo chỉ gọi API 1 lần duy nhất trên toàn ứng dụng.
 */
export const usePublicBrands = () => {
  const [brands, setBrands] = useState<Brand[]>(cachedBrands || []);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedBrands);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && cachedBrands) {
      setBrands(cachedBrands);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!activePromise || forceRefresh) {
        activePromise = brandApi.getBrands().then((res) => {
          cachedBrands = res.data || [];
          activePromise = null;
          return cachedBrands;
        });
      }

      const data = await activePromise;
      setBrands(data);
    } catch {
      setError('Không thể tải danh sách thương hiệu đối tác.');
      activePromise = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    refetch: () => fetchBrands(true),
  };
};

export default usePublicBrands;
