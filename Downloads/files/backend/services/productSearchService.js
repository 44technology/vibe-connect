// Product search service - Find product links from internet
// Uses Google Custom Search API to find products on shopping sites

const axios = require('axios');

// Search products on internet (Google Shopping, Amazon, etc.)
const searchProductLinks = async (productName) => {
  try {
    // Google Custom Search API key and search engine ID
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.warn('⚠️ Google Custom Search API not configured');
      return getDummyProductLinks(productName);
    }

    // Search query - add shopping sites
    const query = `${productName} buy online site:amazon.com OR site:target.com OR site:walmart.com OR site:google.com/shopping`;

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: 10, // Number of results
      },
    });

    const items = response.data.items || [];
    
    // Format results
    const links = items.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: extractSource(item.link),
    }));

    return links.length > 0 ? links : getDummyProductLinks(productName);
  } catch (error) {
    console.error('Error searching product links:', error.response?.data || error.message);
    return getDummyProductLinks(productName);
  }
};

// Extract source from URL
const extractSource = (url) => {
  if (url.includes('amazon.com')) return 'Amazon';
  if (url.includes('target.com')) return 'Target';
  if (url.includes('walmart.com')) return 'Walmart';
  if (url.includes('google.com/shopping')) return 'Google Shopping';
  return 'Other';
};

// Dummy product links (fallback)
const getDummyProductLinks = (productName) => {
  const name = productName.toLowerCase();
  
  if (name.includes('avocado') || name.includes('avokado')) {
    return [
      {
        title: 'Avocado - Target',
        link: 'https://www.target.com/p/avocado/-/A-123456',
        snippet: 'Fresh avocado, each',
        source: 'Target',
      },
      {
        title: 'Avocado - Amazon Fresh',
        link: 'https://www.amazon.com/avocado/dp/B08XXXXXXX',
        snippet: 'Organic avocado, 1 each',
        source: 'Amazon',
      },
      {
        title: 'Avocado - Walmart',
        link: 'https://www.walmart.com/ip/Avocado/123456789',
        snippet: 'Fresh avocado',
        source: 'Walmart',
      },
    ];
  }

  if (name.includes('coca') || name.includes('cola') || name.includes('coke')) {
    return [
      {
        title: 'Coca-Cola Classic - Target',
        link: 'https://www.target.com/p/coca-cola-classic/-/A-123456',
        snippet: 'Coca-Cola Classic, 12 pack',
        source: 'Target',
      },
      {
        title: 'Coca-Cola - Amazon',
        link: 'https://www.amazon.com/coca-cola/dp/B08XXXXXXX',
        snippet: 'Coca-Cola Classic, 12 fl oz cans',
        source: 'Amazon',
      },
      {
        title: 'Coca-Cola - Walmart',
        link: 'https://www.walmart.com/ip/Coca-Cola/123456789',
        snippet: 'Coca-Cola Classic, 12 pack',
        source: 'Walmart',
      },
    ];
  }

  // Generic fallback
  return [
    {
      title: `${productName} - Google Shopping`,
      link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productName)}`,
      snippet: `Search results for ${productName}`,
      source: 'Google Shopping',
    },
  ];
};

module.exports = {
  searchProductLinks,
};

