import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../services/categoryApi';
import { Category } from '../types';

// In-memory module-level cache để chống gọi API lặp
let cachedCategories: Category[] | null = null;
let activePromise: Promise<Category[]> | null = null;

/**
 * Custom Hook usePublicCategories
 * Lấy danh sách danh mục sản phẩm đang hoạt động với bộ nhớ đệm (In-Memory Cache)
 * Đảm bảo chỉ gọi API 1 lần duy nhất trên toàn ứng dụng.
 */
export const usePublicCategories = () => {
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [isLoading, setIsLoading] = useState<boolean>(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && cachedCategories) {
      setCategories(cachedCategories);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!activePromise || forceRefresh) {
        activePromise = categoryApi.getCategories().then((res) => {
          cachedCategories = res.data || [];
          activePromise = null;
          return cachedCategories;
        });
      }

      const data = await activePromise;
      setCategories(data);
    } catch (err: unknown) {
      setError('Không thể tải danh mục sản phẩm.');
      activePromise = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: () => fetchCategories(true),
  };
};

export default usePublicCategories;
