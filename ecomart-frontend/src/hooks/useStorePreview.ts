import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import {
  enterStorePreview,
  exitStorePreview,
  isStorePreviewActive,
} from '../utils/storePreview';

export interface UseStorePreviewResult {
  isPreview: boolean;
  dashboardPath: string;
  enterPreview: () => void;
  exitPreview: () => void;
}

export const useStorePreview = (): UseStorePreviewResult => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState<boolean>(() => isStorePreviewActive());

  const isStaff = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : '/manager';
  const hasPreviewQuery = searchParams.get('preview') === '1';

  useEffect(() => {
    if (isStaff && hasPreviewQuery) {
      enterStorePreview();
      setSessionActive(true);
    }
  }, [isStaff, hasPreviewQuery]);

  const isPreview = Boolean(isStaff && (sessionActive || hasPreviewQuery));

  const enterPreview = useCallback((): void => {
    enterStorePreview();
    setSessionActive(true);
    navigate('/?preview=1');
  }, [navigate]);

  const exitPreview = useCallback((): void => {
    exitStorePreview();
    setSessionActive(false);
    navigate(dashboardPath);
  }, [dashboardPath, navigate]);

  return useMemo(
    () => ({ isPreview, dashboardPath, enterPreview, exitPreview }),
    [isPreview, dashboardPath, enterPreview, exitPreview]
  );
};

export default useStorePreview;
