import { useState, useEffect, useCallback } from 'react';
import { certificationApi } from '../services/certificationApi';
import { Certification } from '../types';

// In-memory module-level cache để chống gọi API lặp
let cachedCertifications: Certification[] | null = null;
let activePromise: Promise<Certification[]> | null = null;

/**
 * Custom Hook usePublicCertifications
 * Lấy danh sách chứng nhận sinh thái đang hoạt động với bộ nhớ đệm (In-Memory Cache)
 * Đảm bảo chỉ gọi API 1 lần duy nhất trên toàn ứng dụng.
 */
export const usePublicCertifications = () => {
  const [certifications, setCertifications] = useState<Certification[]>(
    cachedCertifications || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!cachedCertifications);
  const [error, setError] = useState<string | null>(null);

  const fetchCertifications = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && cachedCertifications) {
      setCertifications(cachedCertifications);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!activePromise || forceRefresh) {
        activePromise = certificationApi.getCertifications().then((res) => {
          cachedCertifications = res.data || [];
          activePromise = null;
          return cachedCertifications;
        });
      }

      const data = await activePromise;
      setCertifications(data);
    } catch {
      setError('Không thể tải danh sách chứng nhận sinh thái.');
      activePromise = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  return {
    certifications,
    isLoading,
    error,
    refetch: () => fetchCertifications(true),
  };
};

export default usePublicCertifications;
