import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token to Client requests
api.interceptors.request.use(
  async (config) => {
    // getSession is client-safe
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Error / Session Expiration handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Auto logout if backend returns 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    }

    const message = error.response?.data?.message || 'Something went wrong';
    const errors = error.response?.data?.errors || [];
    
    const apiError = new Error(message) as any;
    apiError.status = error.response?.status;
    apiError.errors = errors;

    return Promise.reject(apiError);
  }
);
