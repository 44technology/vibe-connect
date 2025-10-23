import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ExternalLink, ShoppingCart, Heart, TrendingDown, Store } from 'lucide-react-native';
import { ReceiptData } from '@/lib/ocrService';
import { getTotalSavings, getBestPrice } from '@/lib/productSearchService';

interface SearchResult {
  store: string;
  price: number;
  url: string;
  inStock: boolean;
}

interface ProductWithResults {
  name: string;
  price: number;
  quantity?: number;
  searchResults: SearchResult[];
}

export default function SearchResults() {
  const { products, receiptData } = useLocalSearchParams();
  const [productData, setProductData] = useState<ProductWithResults[]>([]);
  const [receiptInfo, setReceiptInfo] = useState<ReceiptData | null>(null);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    if (products) {
      try {
        const parsedProducts = JSON.parse(products as string);
        setProductData(parsedProducts);
        
        // Calculate total savings using the service
        const totalSavings = getTotalSavings(parsedProducts);
        setSavings(totalSavings);
      } catch (error) {
        console.error('Error parsing products:', error);
      }
    }
    
    if (receiptData) {
      try {
        const parsedReceiptData = JSON.parse(receiptData as string);
        setReceiptInfo(parsedReceiptData);
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    }
  }, [products, receiptData]);

  const openStore = (url: string) => {
    Linking.openURL(url);
  };

  const addToFavorites = (product: ProductWithResults) => {
    Alert.alert('Added to Favorites', `${product.name} has been added to your favorites!`);
  };

  // Use the service function instead of local implementation

  const getSavingsPercentage = (originalPrice: number, bestPrice: number) => {
    return Math.round(((originalPrice - bestPrice) / originalPrice) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Price Comparison</Text>
        <Text style={styles.subtitle}>Found {productData.length} products</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {savings > 0 && (
          <View style={styles.savingsCard}>
            <TrendingDown size={24} color="#34C759" />
            <View style={styles.savingsInfo}>
              <Text style={styles.savingsTitle}>You could save</Text>
              <Text style={styles.savingsAmount}>${savings.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {productData.map((product, index) => {
          const bestPrice = getBestPrice(product.searchResults);
          const savings = product.price - bestPrice;
          const savingsPercentage = getSavingsPercentage(product.price, bestPrice);

          return (
            <View key={index} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() => addToFavorites(product)}
                >
                  <Heart size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.priceComparison}>
                <View style={styles.originalPrice}>
                  <Text style={styles.priceLabel}>Your Price</Text>
                  <Text style={styles.originalPriceText}>${product.price.toFixed(2)}</Text>
                </View>

                {savings > 0 && (
                  <View style={styles.savingsInfo}>
                    <Text style={styles.savingsLabel}>Best Price</Text>
                    <Text style={styles.bestPriceText}>${bestPrice.toFixed(2)}</Text>
                    <Text style={styles.savingsText}>Save ${savings.toFixed(2)} ({savingsPercentage}%)</Text>
                  </View>
                )}
              </View>

              <View style={styles.resultsList}>
                {product.searchResults
                  .sort((a, b) => a.price - b.price)
                  .map((result, resultIndex) => (
                    <TouchableOpacity
                      key={resultIndex}
                      style={[
                        styles.resultItem,
                        result.price === bestPrice && styles.bestResult
                      ]}
                      onPress={() => openStore(result.url)}
                    >
                      <View style={styles.resultInfo}>
                        <Store size={16} color="#007AFF" />
                        <Text style={styles.storeName}>{result.store}</Text>
                        <Text style={styles.resultPrice}>${result.price.toFixed(2)}</Text>
                        {result.inStock ? (
                          <Text style={styles.inStock}>In Stock</Text>
                        ) : (
                          <Text style={styles.outOfStock}>Out of Stock</Text>
                        )}
                      </View>
                      <ExternalLink size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • We scan your receipt and extract product information
          </Text>
          <Text style={styles.infoText}>
            • We search multiple online stores for the same products
          </Text>
          <Text style={styles.infoText}>
            • We show you where you can find better prices
          </Text>
          <Text style={styles.infoText}>
            • Click on any result to visit the store
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  savingsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savingsInfo: {
    flex: 1,
  },
  savingsTitle: {
    fontSize: 14,
    color: '#666',
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  productCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  priceComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  originalPrice: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  originalPriceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  savingsInfo: {
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bestPriceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  savingsText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  resultsList: {
    gap: 8,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestResult: {
    borderWidth: 2,
    borderColor: '#34C759',
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  inStock: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  outOfStock: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
