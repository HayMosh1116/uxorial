// LUXORAL storefront API client - talks to Vercel serverless functions backed by Neon
const API_BASE = '/api';

export const StoreAPI = {
  async getProducts(filters = {}) {
    let url = `${API_BASE}/products`;
    const params = new URLSearchParams();
    if (filters.slug) params.append('slug', filters.slug);
    if (filters.collection) params.append('collection', filters.collection);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async checkout(orderData) {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout failed');
    return data;
  },

  async getAdminData() {
    const res = await fetch(`${API_BASE}/admin`);
    if (!res.ok) throw new Error('Failed to load admin data');
    return res.json();
  },

  async updateProduct(productId, fields) {
    const res = await fetch(`${API_BASE}/admin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, ...fields })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    return data;
  },

  async initDatabase() {
    const res = await fetch(`${API_BASE}/init-db`);
    return res.json();
  }
};
