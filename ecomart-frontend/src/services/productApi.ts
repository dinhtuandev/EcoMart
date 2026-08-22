import axiosClient from '../lib/axiosClient';
import {
  ApiResponse,
  PageResponse,
  Product,
  ProductPayload,
  ProductFilterParams,
  AdminProductFilterParams,
} from '../types';

/**
 * Service quản lý Sản phẩm sinh thái (Product API)
 * Kết nối các API Public cho khách hàng và API Quản trị cho Admin
 */
export const productApi = {
  /**
   * Lấy danh sách sản phẩm công khai kèm bộ lọc đa tiêu chí, sắp xếp và phân trang
   */
  getProducts: (
    params?: ProductFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<Product>>> =>
    axiosClient.get('/products', { params, signal }),

  /**
   * Lấy chi tiết thông tin sản phẩm công khai
   */
  getProductDetail: (
    productId: number | string,
    signal?: AbortSignal
  ): Promise<ApiResponse<Product>> =>
    axiosClient.get(`/products/${productId}`, { signal }),

  /**
   * [ADMIN] Lấy danh sách sản phẩm quản trị kèm bộ lọc và phân trang
   */
  adminGetProducts: (
    params?: AdminProductFilterParams,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<Product>>> =>
    axiosClient.get('/admin/products', { params, signal }),

  /**
   * [ADMIN] Lấy chi tiết sản phẩm cho Admin
   */
  adminGetProductDetail: (
    productId: number | string,
    signal?: AbortSignal
  ): Promise<ApiResponse<Product>> =>
    axiosClient.get(`/admin/products/${productId}`, { signal }),

  /**
   * [ADMIN] Tạo mới sản phẩm sinh thái
   */
  adminCreateProduct: (payload: ProductPayload): Promise<ApiResponse<Product>> =>
    axiosClient.post('/admin/products', payload),

  /**
   * [ADMIN] Cập nhật thông tin sản phẩm
   */
  adminUpdateProduct: (
    productId: number | string,
    payload: ProductPayload
  ): Promise<ApiResponse<Product>> =>
    axiosClient.patch(`/admin/products/${productId}`, payload),

  /**
   * [ADMIN] Cập nhật danh sách hình ảnh sản phẩm
   */
  adminUpdateProductImages: (
    productId: number | string,
    images: { url: string; isPrimary?: boolean; displayOrder?: number }[]
  ): Promise<ApiResponse<Product>> =>
    axiosClient.put(`/admin/products/${productId}/images`, images),
};

export default productApi;
