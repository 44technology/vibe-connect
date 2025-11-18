import axios from 'axios';
import { Platform } from 'react-native';

// API Base URL Configuration
// Development: ngrok or localhost
// Production: Netlify Functions proxy or direct backend URL

const getApiBaseUrl = () => {
  // Development mode
  if (__DEV__) {
    return 'https://diagenetic-berry-pompously.ngrok-free.dev/api';
  }
  
  // Production mode
  // Check if we're on Netlify (using Netlify Functions proxy)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If on Netlify, use relative path for Functions proxy
    if (hostname.includes('netlify.app') || hostname.includes('localhost')) {
      return '/api'; // Netlify Functions proxy
    }
  }
  
  // Fallback: Direct backend URL (set via environment variable or hardcode)
  // You can set this in Netlify environment variables as REACT_APP_API_URL
  return process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scan Receipt
export const scanReceipt = async (imageUri) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    formData.append('image', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: type,
      name: filename || 'receipt.jpg',
    });

    const response = await api.post('/scan/receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error scanning receipt:', error);
    // Return dummy data if API fails
    return {
      success: true,
      items: [
        { name: "SB Ray's BBQ Sauce", details: '18 FL Oz', price: 3.99, quantity: 1 },
        { name: 'Produce Avocado', details: '1 Each', price: 1.25, quantity: 1 },
      ],
      total: 5.24,
    };
  }
};

// Scan Barcode
export const scanBarcode = async (imageUri) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    formData.append('image', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: type,
      name: filename || 'barcode.jpg',
    });

    const response = await api.post('/scan/barcode', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error scanning barcode:', error);
    // Return dummy data if API fails
    return {
      success: true,
      product: {
        barcode: '1234567890123',
        name: 'Produce Avocado',
        size: '1 Each',
        stores: [
          { name: 'Target', address: '1045 5th Street', price: 0.75, distance: '8.4 mi' },
        ],
      },
    };
  }
};

// Scan Product
export const scanProduct = async (imageUri) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    formData.append('image', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: type,
      name: filename || 'product.jpg',
    });

    const response = await api.post('/scan/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error scanning product:', error);
    // Return dummy data if API fails
    return {
      success: true,
      product: {
        name: 'Produce Avocado',
        size: '1 Each',
        stores: [
          { name: 'Target', address: '1045 5th Street', price: 0.75, distance: '8.4 mi' },
        ],
      },
    };
  }
};

// Compare Prices
export const comparePrices = async (items) => {
  try {
    const response = await api.post('/compare/prices', { items });
    return response.data;
  } catch (error) {
    console.error('Error comparing prices:', error);
    throw error;
  }
};

// Search Products
export const searchProducts = async (query) => {
  try {
    const response = await api.get('/products/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Get Nearby Stores
export const getNearbyStores = async (latitude, longitude, radius = 10) => {
  try {
    const response = await api.get('/stores/nearby', {
      params: { lat: latitude, lng: longitude, radius },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting nearby stores:', error);
    throw error;
  }
};

export default api;

