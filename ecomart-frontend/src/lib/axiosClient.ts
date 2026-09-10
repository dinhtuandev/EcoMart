import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { ApiResponse, AuthResponse, CustomAxiosError } from '../types';

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: CustomAxiosError) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

/**
 * Xử lý giải phóng hoặc từ chối các request đang chờ trong hàng đợi khi refresh token
 */
const processQueue = (
  error: CustomAxiosError | null,
  token: string | null = null
): void => {
  failedQueue.forEach((promise: QueueItem) => {
    if (error) {
      promise.reject(error);
      return;
    }
    if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Instance Axios được cấu hình Type-safe cho toàn bộ ứng dụng EcoMart
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Tự động gán Authorization Bearer token từ localStorage
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error as CustomAxiosError)
);

/**
 * Response Interceptor: Xử lý dữ liệu trả về và hàng đợi Silent Refresh Token khi nhận lỗi 401
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: unknown) => {
    const customError = error as CustomAxiosError;
    const originalRequest = customError.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(customError);
    }

    // Nếu gặp lỗi 401 Unauthorized và request chưa từng được retry
    if (customError.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // Nếu không có refresh token -> Phát sự kiện force_logout để AuthProvider xử lý
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('force_logout'));
        return Promise.reject(customError);
      }

      // Nếu đang trong quá trình refresh -> Đưa request vào hàng đợi
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err: CustomAxiosError) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          `${axiosClient.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        } = refreshResponse.data.data;

        // Cập nhật localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Cập nhật header mặc định và header của request hiện tại
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return axiosClient(originalRequest);
      } catch (refreshError: unknown) {
        const typedRefreshError = refreshError as CustomAxiosError;
        processQueue(typedRefreshError, null);

        // Xóa sạch session và thông báo logout qua custom event (KHÔNG dùng window.location.href)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('force_logout'));

        return Promise.reject(typedRefreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(customError);
  }
);

export default axiosClient;
