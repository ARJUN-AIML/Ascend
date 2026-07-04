import api from './api';

// ─────────────────────────────────────────────────────────────────────────────
// productService — thin API wrapper, no caching.
// Caching is owned by ProductContext (React state = in-memory cache).
// Pass an AbortController signal to cancel in-flight requests on unmount.
// ─────────────────────────────────────────────────────────────────────────────

const getProducts = async (signal) => {
  const res = await api.get('/api/products', { signal });
  return res.data;
};

const createProduct = async (productData) => {
  const res = await api.post('/api/products', productData);
  return res.data;
};

const updateProduct = async (id, productData) => {
  const res = await api.put(`/api/products/${id}`, productData);
  return res.data;
};

const deleteProduct = async (id) => {
  const res = await api.delete(`/api/products/${id}`);
  return res.data;
};

const productService = { getProducts, createProduct, updateProduct, deleteProduct };
export default productService;
