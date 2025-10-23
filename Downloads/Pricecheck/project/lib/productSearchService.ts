import axios from 'axios';

export interface SearchResult {
  store: string;
  price: number;
  url: string;
  inStock: boolean;
  imageUrl?: string;
  description?: string;
}

export interface ProductWithResults {
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  searchResults: SearchResult[];
}

// Mock product search - in real app, you'd use actual APIs
export const searchProductOnline = async (productName: string): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock search results for different stores
  const mockResults: SearchResult[] = [
    {
      store: 'Amazon',
      price: Math.random() * 20 + 5, // Random price between $5-$25
      url: `https://amazon.com/s?k=${encodeURIComponent(productName)}`,
      inStock: Math.random() > 0.1, // 90% chance in stock
      imageUrl: 'https://via.placeholder.com/150x150?text=Product',
      description: `${productName} - High quality product`
    },
    {
      store: 'Target',
      price: Math.random() * 20 + 5,
      url: `https://target.com/s?searchTerm=${encodeURIComponent(productName)}`,
      inStock: Math.random() > 0.15, // 85% chance in stock
      imageUrl: 'https://via.placeholder.com/150x150?text=Product',
      description: `${productName} - Available at Target`
    },
    {
      store: 'Walmart',
      price: Math.random() * 20 + 5,
      url: `https://walmart.com/search?q=${encodeURIComponent(productName)}`,
      inStock: Math.random() > 0.2, // 80% chance in stock
      imageUrl: 'https://via.placeholder.com/150x150?text=Product',
      description: `${productName} - Great value at Walmart`
    },
    {
      store: 'Best Buy',
      price: Math.random() * 20 + 5,
      url: `https://bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`,
      inStock: Math.random() > 0.25, // 75% chance in stock
      imageUrl: 'https://via.placeholder.com/150x150?text=Product',
      description: `${productName} - Electronics and more`
    }
  ];
  
  // Sort by price
  return mockResults.sort((a, b) => a.price - b.price);
};

// Search multiple products
export const searchProductsOnline = async (products: Array<{name: string; price: number; quantity?: number; category?: string}>): Promise<ProductWithResults[]> => {
  const results: ProductWithResults[] = [];
  
  for (const product of products) {
    const searchResults = await searchProductOnline(product.name);
    results.push({
      ...product,
      searchResults: searchResults
    });
  }
  
  return results;
};

// Real API implementation (for future use)
export const searchProductRealAPI = async (productName: string): Promise<SearchResult[]> => {
  try {
    // Example: Using a real product search API
    const response = await axios.get(`https://api.example.com/search`, {
      params: {
        query: productName,
        limit: 10
      }
    });
    
    return response.data.results.map((item: any) => ({
      store: item.store,
      price: item.price,
      url: item.url,
      inStock: item.inStock,
      imageUrl: item.imageUrl,
      description: item.description
    }));
  } catch (error) {
    console.error('Product search API error:', error);
    // Fallback to mock data
    return await searchProductOnline(productName);
  }
};

// Calculate savings
export const calculateSavings = (originalPrice: number, bestPrice: number): { amount: number; percentage: number } => {
  const amount = originalPrice - bestPrice;
  const percentage = Math.round((amount / originalPrice) * 100);
  
  return { amount, percentage };
};

// Get best price from search results
export const getBestPrice = (searchResults: SearchResult[]): number => {
  const inStockResults = searchResults.filter(result => result.inStock);
  if (inStockResults.length === 0) return 0;
  
  return Math.min(...inStockResults.map(result => result.price));
};

// Get total savings for multiple products
export const getTotalSavings = (products: ProductWithResults[]): number => {
  return products.reduce((total, product) => {
    const bestPrice = getBestPrice(product.searchResults);
    if (bestPrice > 0) {
      const savings = product.price - bestPrice;
      return total + savings;
    }
    return total;
  }, 0);
};
