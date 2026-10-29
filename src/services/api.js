import { create } from 'axios';

const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://cacautrip-api.onrender.com/',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


