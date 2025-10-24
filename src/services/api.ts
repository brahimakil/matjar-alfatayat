import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  getAdmin: async (id: string) => {
    const response = await api.get(`/auth/admin/${id}`);
    return response.data;
  },
};

export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const productsAPI = {
  getAll: async (params?: { categoryId?: string; featured?: boolean; limit?: number }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export const uploadAPI = {
  single: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  multiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const settingsAPI = {
  // Hero Images
  getAllHeroImages: async () => {
    const response = await api.get('/settings/hero-images');
    return response.data;
  },

  createHeroImage: async (data: any) => {
    const response = await api.post('/settings/hero-images', data);
    return response.data;
  },

  updateHeroImage: async (id: string, data: any) => {
    const response = await api.patch(`/settings/hero-images/${id}`, data);
    return response.data;
  },

  deleteHeroImage: async (id: string) => {
    const response = await api.delete(`/settings/hero-images/${id}`);
    return response.data;
  },

  // WhatsApp
  getWhatsApp: async () => {
    const response = await api.get('/settings/whatsapp');
    return response.data;
  },

  updateWhatsApp: async (data: any) => {
    const response = await api.post('/settings/whatsapp', data);
    return response.data;
  },
};

export const adminsAPI = {
  getAll: async () => {
    const response = await api.get('/admins');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentProducts: async () => {
    const response = await api.get('/dashboard/recent-products');
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/dashboard/featured-products');
    return response.data;
  },
};

// Public APIs (no authentication required)
export const publicAPI = {
  // Get active hero images
  getHeroImages: async () => {
    const response = await api.get('/public/hero-images');
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit?: number) => {
    const response = await api.get('/public/featured-products', {
      params: { limit },
    });
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await api.get('/public/categories');
    return response.data;
  },

  // Get products with filters
  getProducts: async (params?: { categoryId?: string; search?: string; limit?: number }) => {
    const response = await api.get('/public/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id: string) => {
    const response = await api.get(`/public/products/${id}`);
    return response.data;
  },

  // Get WhatsApp settings
  getWhatsApp: async () => {
    const response = await api.get('/public/whatsapp');
    return response.data;
  },
};

export default api;

