import axiosClient from '../lib/axiosClient';
import { ApiResponse, StoreSetting, UpdateStoreSettingPayload } from '../types';

/**
 * Service quản lý Cấu hình cửa hàng (Store Settings API)
 */
export const storeSettingApi = {
  /**
   * Lấy thông tin cấu hình cửa hàng (Public)
   */
  getSettings: (signal?: AbortSignal): Promise<ApiResponse<StoreSetting>> =>
    axiosClient.get('/settings', { signal }),

  /**
   * Cập nhật thông tin cấu hình cửa hàng (Admin)
   */
  updateSettings: (payload: UpdateStoreSettingPayload): Promise<ApiResponse<StoreSetting>> =>
    axiosClient.patch('/admin/settings', payload),
};

export default storeSettingApi;
