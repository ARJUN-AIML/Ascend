import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import productService from '../services/productService';

// ─── Context ─────────────────────────────────────────────────────────────────
export const ProductContext = createContext({
  products: [],
  loading: false,
  error: null,
  addProduct: () => {},
  updateProduct: () => {},
  removeProduct: () => {},
  refreshProducts: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ProductProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // Track the in-flight controller so refreshProducts can abort any prior fetch
  const controllerRef = useRef(null);

  const fetchProducts = useCallback(async (signal) => {
    console.count('PRODUCTS_CALL');
    console.log("PRODUCT FETCH START");
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts(signal);
      // Guard: don't update state if this fetch was aborted (component unmounted
      // or a newer fetch started).
      if (!signal.aborted) {
        console.log("PRODUCT FETCH SUCCESS", data);
        setProducts(data);
      }
    } catch (err) {
      if (!signal.aborted && !axios.isCancel(err)) {
        console.log("PRODUCT FETCH ERROR", err);
        setError('Failed to load applications. Check your connection and retry.');
      }
    } finally {
      if (!signal.aborted) {
        console.log("PRODUCT FETCH END");
        setLoading(false);
      }
    }
  }, []);

  // ── Fetch when user authenticates; clear when user logs out ──────────────
  useEffect(() => {
    if (!user) {
      // Abort any in-flight fetch and reset state on logout
      controllerRef.current?.abort();
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Abort any previous in-flight request before starting a new one
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetchProducts(controller.signal);

    return () => {
      // Cleanup on unmount or user change
      controller.abort();
    };
  // user?._id — only re-run when the logged-in user identity changes,
  // NOT when the user object reference changes (e.g. after updateProfile).
  }, [user, user?._id, fetchProducts]);

  // ── Mutators — keep local state in sync without a round-trip fetch ────────
  const addProduct = useCallback(
    (p) => setProducts((prev) => [p, ...prev]),
    [],
  );

  const updateProduct = useCallback(
    (updated) =>
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p)),
      ),
    [],
  );

  const removeProduct = useCallback(
    (id) => setProducts((prev) => prev.filter((p) => p._id !== id)),
    [],
  );

  // ── Explicit refresh — aborts prior fetch, starts fresh ──────────────────
  const refreshProducts = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    fetchProducts(controller.signal);
  }, [fetchProducts]);

  console.log('--- PRODUCT CONTEXT RENDER ---');
  console.log('loading:', loading);
  console.log('error:', error);
  console.log('products.length:', products?.length);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    removeProduct,
    refreshProducts,
  }), [products, loading, error, addProduct, updateProduct, removeProduct, refreshProducts]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}
