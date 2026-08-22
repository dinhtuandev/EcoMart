import axios from 'axios';

const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api';

export interface ProvinceItem {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
}

export interface DistrictItem {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: number;
}

export interface WardItem {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  district_code: number;
}

export interface DistrictWithWards extends DistrictItem {
  wards?: WardItem[];
}

export interface ProvinceWithSubdivisionsResponse extends ProvinceItem {
  districts: DistrictWithWards[];
}

/**
 * Service tích hợp Vietnam Provinces Open API
 * - Lấy danh sách 63 Tỉnh/Thành: GET /p/
 * - Khi chọn 1 Tỉnh: Gọi GET /p/{code}?depth=3 để lấy toàn bộ Quận/Huyện kèm Phường/Xã của riêng tỉnh đó (Rất nhẹ ~15KB, giúp chuyển Quận load Phường tức thì 0ms latency)
 */
export const locationApi = {
  /**
   * Lấy toàn bộ 63 Tỉnh / Thành phố tại Việt Nam
   */
  getProvinces: async (signal?: AbortSignal): Promise<ProvinceItem[]> => {
    const response = await axios.get<ProvinceItem[]>(`${PROVINCES_API_BASE}/p/`, { signal });
    return response.data;
  },

  /**
   * Lấy toàn bộ Quận/Huyện kèm Phường/Xã của 1 Tỉnh cụ thể (depth=3 cho 1 tỉnh)
   */
  getProvinceWithSubdivisions: async (
    provinceCode: number,
    signal?: AbortSignal
  ): Promise<ProvinceWithSubdivisionsResponse> => {
    const response = await axios.get<ProvinceWithSubdivisionsResponse>(
      `${PROVINCES_API_BASE}/p/${provinceCode}?depth=3`,
      { signal }
    );
    return response.data;
  },
};

export default locationApi;
