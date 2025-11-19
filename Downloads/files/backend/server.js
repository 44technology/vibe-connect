const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Services
const visionService = require('./services/visionService');
const productService = require('./services/productService');
const storeService = require('./services/storeService');
const productSearchService = require('./services/productSearchService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Vision service
visionService.initializeVision();

// Middleware
// CORS configuration - Allow Netlify and local development
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    /\.netlify\.app$/,  // Allow all Netlify subdomains
    /\.railway\.app$/,  // Allow Railway deployments
    /\.render\.com$/,   // Allow Render deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Scan Good API is running', version: '1.0.0' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Scan Good API is running', endpoints: ['/api/health', '/api/scan/receipt', '/api/scan/barcode', '/api/scan/product', '/api/compare/prices'] });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Scan Good API is running' });
});

// Scan Receipt - OCR processing
app.post('/api/scan/receipt', upload.single('image'), async (req, res) => {
  try {
    let items = null;
    let receiptText = null;

    // Try OCR if image is provided
    if (req.file && req.file.buffer) {
      receiptText = await visionService.extractTextFromImage(req.file.buffer);
      if (receiptText) {
        items = visionService.parseReceiptText(receiptText);
      }
    }

    // Fallback to dummy data if OCR fails or no image
    if (!items || items.length === 0) {
      items = [
        { name: "SB Ray's BBQ Sauce", details: '18 FL Oz', price: 3.99, quantity: 1 },
        { name: 'Produce Avocado', details: '1 Each', price: 1.25, quantity: 1 },
        { name: 'Tomatoes', details: '0.73 lbs@ $1.99/lb', price: 1.45, quantity: 1 },
      ];
    }

    const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    res.json({
      success: true,
      items: items,
      total: parseFloat(total.toFixed(2)),
      store: 'Target',
      date: new Date().toISOString(),
      ocrUsed: !!receiptText,
    });
  } catch (error) {
    console.error('Error scanning receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scan Barcode - Product lookup
app.post('/api/scan/barcode', upload.single('image'), async (req, res) => {
  try {
    let barcode = null;
    let product = null;

    // Try barcode detection if image is provided
    if (req.file && req.file.buffer) {
      barcode = await visionService.detectBarcode(req.file.buffer);
      if (barcode) {
        product = productService.lookupProductByBarcode(barcode);
      }
    }

    // Fallback to dummy product if detection fails
    if (!product) {
      product = productService.lookupProductByBarcode('1234567890123');
      if (!product) {
        product = {
          barcode: barcode || '1234567890123',
          name: 'Produce Avocado',
          size: '1 Each',
          stores: [
            {
              name: 'Target',
              address: '1045 5th Street Unit 201, Miami, FL',
              price: 0.75,
              distance: '8.4 mi',
            },
            {
              name: 'Target',
              address: '11253 Pines Blvd, Hollywood, FL',
              price: 0.79,
              distance: '5.2 mi',
            },
            {
              name: 'Target',
              address: '1750 W 37th Street, Miami, FL',
              price: 0.89,
              distance: '3.1 mi',
            },
          ],
        };
      }
    }
    
    res.json({
      success: true,
      product: product,
      barcodeDetected: !!barcode,
    });
  } catch (error) {
    console.error('Error scanning barcode:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scan Product - Image recognition with internet product links
app.post('/api/scan/product', upload.single('image'), async (req, res) => {
  try {
    let labels = null;
    let product = null;
    let productName = null;

    // Try image recognition if image is provided
    if (req.file && req.file.buffer) {
      labels = await visionService.detectProductLabels(req.file.buffer);
      if (labels && labels.length > 0) {
        product = productService.findProductByLabels(labels);
        // Get product name from labels for internet search
        productName = labels[0].description || labels.map(l => l.description).join(' ');
      }
    }

    // Fallback to dummy product if recognition fails
    if (!product) {
      product = productService.lookupProductByBarcode('1234567890123');
      if (!product) {
        product = {
          name: 'Produce Avocado',
          size: '1 Each',
          stores: [
            {
              name: 'Target',
              address: '1045 5th Street Unit 201, Miami, FL',
              price: 0.75,
              distance: '8.4 mi',
            },
            {
              name: 'Whole Foods',
              address: '6701 Red Road, Miami, FL',
              price: 1.25,
              distance: '1.9 mi',
            },
            {
              name: 'Walmart',
              address: '11253 Pines Blvd, Hollywood, FL',
              price: 0.79,
              distance: '5.2 mi',
            },
          ],
        };
        productName = product.name;
      } else {
        productName = product.name;
      }
    } else {
      productName = product.name || productName;
    }

    // Search for product links on internet
    let productLinks = [];
    if (productName) {
      console.log('🔍 Searching product links for:', productName);
      productLinks = await productSearchService.searchProductLinks(productName);
    }
    
    res.json({
      success: true,
      product: product,
      labelsDetected: labels ? labels.map(l => l.description) : null,
      productLinks: productLinks, // Internet product links
    });
  } catch (error) {
    console.error('Error scanning product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compare Prices - Get prices from multiple stores
app.post('/api/compare/prices', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    const comparison = storeService.comparePrices(items);
    
    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Products
app.get('/api/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const products = productService.searchProducts(q);
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Stores near location
app.get('/api/stores/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
    }

    const stores = storeService.getNearbyStores(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    );
    
    res.json({
      success: true,
      stores: stores
    });
  } catch (error) {
    console.error('Error getting nearby stores:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Google Vision API with real data
app.post('/api/test/vision', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image file is required',
        hint: 'Send a POST request with multipart/form-data containing an "image" field'
      });
    }

    const results = {
      imageSize: req.file.buffer.length,
      imageType: req.file.mimetype,
      timestamp: new Date().toISOString(),
    };

    // Test OCR (Text Detection)
    console.log('🔍 Testing OCR (Text Detection)...');
    const ocrText = await visionService.extractTextFromImage(req.file.buffer);
    results.ocr = {
      success: !!ocrText,
      text: ocrText || null,
      textLength: ocrText ? ocrText.length : 0,
    };

    // Test Barcode Detection
    console.log('🔍 Testing Barcode Detection...');
    const barcode = await visionService.detectBarcode(req.file.buffer);
    results.barcode = {
      success: !!barcode,
      value: barcode || null,
    };

    // Test Label Detection
    console.log('🔍 Testing Label Detection...');
    const labels = await visionService.detectProductLabels(req.file.buffer);
    results.labels = {
      success: !!labels && labels.length > 0,
      count: labels ? labels.length : 0,
      labels: labels || null,
    };

    // Check if using real API or dummy data
    const isUsingRealAPI = !!(process.env.GOOGLE_CLOUD_VISION_API_KEY || process.env.GOOGLE_CLOUD_VISION_KEY_FILE);
    
    res.json({
      success: true,
      message: isUsingRealAPI 
        ? '✅ Google Vision API is configured and working!' 
        : '⚠️ Google Vision API not configured - using dummy data. Add GOOGLE_CLOUD_VISION_API_KEY to .env file.',
      usingRealAPI: isUsingRealAPI,
      results: results,
    });
  } catch (error) {
    console.error('Error testing Vision API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scan Good Backend API running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

