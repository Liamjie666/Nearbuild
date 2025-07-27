// API 服务配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API 响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 硬件搜索参数
export interface HardwareSearchParams {
  query?: string;
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  platform?: 'taobao' | 'jd' | 'all';
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'sales' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API 服务类
class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 获取硬件分类
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.request<{ success: boolean; data: string[] }>('/hardware/categories');
      return response.data;
    } catch (error) {
      console.error('获取硬件分类失败:', error);
      return [];
    }
  }

  // 根据分类获取硬件列表
  async getHardwareByCategory(
    category: string,
    page: number = 1,
    limit: number = 20,
    sort: string = 'price',
    order: 'asc' | 'desc' = 'asc'
  ) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
      });

      const response = await this.request<{
        success: boolean;
        data: {
          hardware: any[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
      }>(`/hardware/category/${category}?${params}`);

      return response.data;
    } catch (error) {
      console.error('获取硬件列表失败:', error);
      return { hardware: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  }

  // 搜索硬件
  async searchHardware(params: {
    q?: string;
    category?: string;
    platform?: 'all' | 'taobao' | 'jd';
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    liveSearch?: boolean;
  }) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.q) searchParams.append('q', params.q);
      if (params.category) searchParams.append('category', params.category);
      if (params.platform) searchParams.append('platform', params.platform);
      if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.liveSearch) searchParams.append('liveSearch', params.liveSearch.toString());

      const response = await this.request<{
        success: boolean;
        data: {
          hardware: any[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
          source?: string;
        };
      }>(`/hardware/search?${searchParams}`);

      return response.data;
    } catch (error) {
      console.error('搜索硬件失败:', error);
      return { hardware: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }
  }

  // 获取硬件详情
  async getHardwareDetail(id: string) {
    try {
      const response = await this.request<{ success: boolean; data: any }>(`/hardware/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取硬件详情失败:', error);
      return null;
    }
  }

  // 获取推荐硬件
  async getRecommendations(category: string, budget: number = 99999) {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(
        `/hardware/recommendations/${category}?budget=${budget}`
      );
      return response.data;
    } catch (error) {
      console.error('获取推荐硬件失败:', error);
      return [];
    }
  }

  // 获取价格趋势
  async getPriceTrend(id: string) {
    try {
      const response = await this.request<{ success: boolean; data: any[] }>(`/hardware/price-trend/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取价格趋势失败:', error);
      return [];
    }
  }

  // 一键下单到淘宝
  async orderToTaobao(config: any[]) {
    try {
      const response = await this.request<{
        success: boolean;
        message: string;
        cartUrl?: string;
        items?: any[];
      }>('/orders/taobao', {
        method: 'POST',
        body: JSON.stringify({ config })
      });

      return response;
    } catch (error) {
      console.error('淘宝下单失败:', error);
      return { success: false, message: '淘宝下单失败' };
    }
  }

  // 一键下单到京东
  async orderToJD(config: any[]) {
    try {
      const response = await this.request<{
        success: boolean;
        message: string;
        cartUrl?: string;
        items?: any[];
      }>('/orders/jd', {
        method: 'POST',
        body: JSON.stringify({ config })
      });

      return response;
    } catch (error) {
      console.error('京东下单失败:', error);
      return { success: false, message: '京东下单失败' };
    }
  }

  // 一键下单到所有平台
  async orderToAllPlatforms(config: any[]) {
    try {
      const response = await this.request<{
        success: boolean;
        message: string;
        cartUrl?: string;
        items?: any[];
      }>('/orders/all', {
        method: 'POST',
        body: JSON.stringify({ config })
      });

      return response;
    } catch (error) {
      console.error('全平台下单失败:', error);
      return { success: false, message: '全平台下单失败' };
    }
  }

  // 保存配置
  async saveConfiguration(config: {
    name: string;
    description: string;
    items: any[];
    isPublic?: boolean;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        message: string;
        data?: any;
      }>('/configurations', {
        method: 'POST',
        body: JSON.stringify(config)
      });

      return response;
    } catch (error) {
      console.error('保存配置失败:', error);
      return { success: false, message: '保存配置失败' };
    }
  }

  // 获取配置详情
  async getConfiguration(id: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any;
        message?: string;
      }>(`/configurations/${id}`);

      return response;
    } catch (error) {
      console.error('获取配置失败:', error);
      return { success: false, message: '获取配置失败' };
    }
  }

  // 通过分享ID获取配置
  async getConfigurationByShareId(shareId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any;
        message?: string;
      }>(`/configurations/share/${shareId}`);

      return response;
    } catch (error) {
      console.error('获取分享配置失败:', error);
      return { success: false, message: '获取分享配置失败' };
    }
  }
}

export const apiService = new ApiService(); 