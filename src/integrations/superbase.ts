
const BASE_URL = '/api-backend'; // Mapping through Nginx for stability

// This is the main store API key (belonging to admin@preciousnails.com)
// All products and orders are stored in this schema to keep the store unified.
const STORE_API_KEY = 'db_O5-MqWO_USRwGc_f3RQVycl_47DFmnCvA4KfOuo1Ypw';

// Helper to get the logged-in user's API Key
const getUserApiKey = () => localStorage.getItem('superbase_api_key');

async function request(path: string, options: RequestInit = {}, useStoreKey: boolean = false) {
  const url = path.startsWith('http') ? path : `/api-backend${path}`;
  
  const headers = new Headers(options.headers || {});
  
  // Use the Store API key for public data, otherwise use the user's key if needed
  const token = useStoreKey ? STORE_API_KEY : getUserApiKey();
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  auth: {
    signup: (data: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data: any) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  data: {
    // ALWAYS use the store key for data operations so products/orders go to the main store schema
    getAll: (table: string) => request(`/v1/data/${table}`, {}, true),
    getOne: (table: string, id: string) => request(`/v1/data/${table}?id=${id}`, {}, true),
    create: (table: string, data: any) => request(`/v1/data/${table}`, { method: 'POST', body: JSON.stringify(data) }, true),
    update: (table: string, id: string, data: any) => request(`/v1/data/${table}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, true),
    delete: (table: string, id: string) => request(`/v1/data/${table}/${id}`, { method: 'DELETE' }, true),
  },
  admin: {
    getSettings: () => request('/api/admin/settings', { headers: { 'Authorization': `Bearer Titobilove123@` } }),
    updateSettings: (data: any) => request('/api/admin/settings', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Authorization': `Bearer Titobilove123@` } 
    }),
    getUsers: () => request('/api/admin/users', { headers: { 'Authorization': `Bearer Titobilove123@` } }),
    sendMail: (data: any) => request('/api/admin/send-mail', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Authorization': `Bearer Titobilove123@` } 
    }),
  }
};
