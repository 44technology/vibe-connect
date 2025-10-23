import axios from 'axios';

// Google Vision API configuration
const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '';
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export interface ExtractedProduct {
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}

export interface ReceiptData {
  storeName: string;
  totalAmount: number;
  date: string;
  products: ExtractedProduct[];
  rawText: string;
}

// Mock OCR function for development
export const extractTextFromImageMock = async (imageUri: string): Promise<string> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock receipt text - in real app, this would come from Google Vision API
  return `
    WALMART STORE #1234
    123 Main Street, City, State
    Receipt #: 123456789
    Date: 12/15/2024
    Cashier: John Doe
    
    MILK 2% GAL          $3.49
    BREAD WHITE LOAF     $2.99
    EGGS DOZEN           $4.99
    BANANAS 2LB          $1.98
    CHICKEN BREAST 2LB   $8.99
    APPLES 3LB           $4.50
    ORANGE JUICE 64OZ    $3.25
    
    SUBTOTAL            $29.19
    TAX                  $2.34
    TOTAL               $31.53
    
    Thank you for shopping!
  `;
};

// Convert image to base64 for Google Vision API
const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Real OCR function using Google Vision API
export const extractTextFromImage = async (imageUri: string): Promise<string> => {
  try {
    // If no API key, use mock data
    if (!GOOGLE_VISION_API_KEY) {
      console.log('No Google Vision API key found, using mock data');
      return await extractTextFromImageMock(imageUri);
    }

    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);
    
    // Call Google Vision API
    const response = await axios.post(
      `${GOOGLE_VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      }
    );

    if (response.data.responses && response.data.responses[0].textAnnotations) {
      const textAnnotations = response.data.responses[0].textAnnotations;
      if (textAnnotations.length > 0) {
        return textAnnotations[0].description || '';
      }
    }
    
    return '';
  } catch (error) {
    console.error('OCR Error:', error);
    // Fallback to mock data in case of error
    return await extractTextFromImageMock(imageUri);
  }
};

// Extract products from receipt text
export const extractProducts = (text: string): ExtractedProduct[] => {
  const lines = text.split('\n');
  const products: ExtractedProduct[] = [];
  
  lines.forEach(line => {
    // Look for lines with product names and prices
    const priceMatch = line.match(/\$(\d+\.\d{2})$/);
    if (priceMatch && !line.includes('SUBTOTAL') && !line.includes('TAX') && !line.includes('TOTAL') && !line.includes('Thank you')) {
      const price = parseFloat(priceMatch[1]);
      const productName = line.replace(/\$\d+\.\d{2}$/, '').trim();
      
      if (productName && price > 0) {
        // Try to extract quantity if present
        const quantityMatch = productName.match(/(\d+)\s*(?:x|X)\s*(.+)/);
        let name = productName;
        let quantity = 1;
        
        if (quantityMatch) {
          quantity = parseInt(quantityMatch[1]);
          name = quantityMatch[2].trim();
        }
        
        products.push({
          name: name,
          price: price,
          quantity: quantity,
          category: categorizeProduct(name)
        });
      }
    }
  });
  
  return products;
};

// Categorize products based on name
const categorizeProduct = (productName: string): string => {
  const name = productName.toLowerCase();
  
  if (name.includes('milk') || name.includes('juice') || name.includes('water')) {
    return 'Beverages';
  }
  if (name.includes('bread') || name.includes('cake') || name.includes('cookie')) {
    return 'Bakery';
  }
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) {
    return 'Meat';
  }
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('fruit')) {
    return 'Produce';
  }
  if (name.includes('egg') || name.includes('cheese') || name.includes('yogurt')) {
    return 'Dairy';
  }
  
  return 'Other';
};

// Extract store information
export const extractStoreInfo = (text: string): { storeName: string; totalAmount: number; date: string } => {
  const lines = text.split('\n');
  let storeName = 'Unknown Store';
  let totalAmount = 0;
  let date = new Date().toLocaleDateString();
  
  // Extract store name (usually first line)
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine && !firstLine.includes('$')) {
      storeName = firstLine;
    }
  }
  
  // Extract total amount
  const totalMatch = text.match(/TOTAL\s*\$(\d+\.\d{2})/i);
  if (totalMatch) {
    totalAmount = parseFloat(totalMatch[1]);
  }
  
  // Extract date
  const dateMatch = text.match(/Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (dateMatch) {
    date = dateMatch[1];
  }
  
  return { storeName, totalAmount, date };
};

// Process complete receipt
export const processReceipt = async (imageUri: string): Promise<ReceiptData> => {
  const rawText = await extractTextFromImage(imageUri);
  const products = extractProducts(rawText);
  const storeInfo = extractStoreInfo(rawText);
  
  return {
    storeName: storeInfo.storeName,
    totalAmount: storeInfo.totalAmount,
    date: storeInfo.date,
    products: products,
    rawText: rawText
  };
};
