import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Bell, Trash2, TrendingDown } from 'lucide-react-native';

interface FavoriteProduct {
  id: string;
  name: string;
  currentPrice: number;
  lowestPrice: number;
  store: string;
  priceDrop: boolean;
  alertEnabled: boolean;
}

export default function Favorites() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would come from your database
    setFavorites([
      {
        id: '1',
        name: 'iPhone 15 Pro',
        currentPrice: 999,
        lowestPrice: 899,
        store: 'Apple Store',
        priceDrop: true,
        alertEnabled: true,
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24',
        currentPrice: 799,
        lowestPrice: 799,
        store: 'Best Buy',
        priceDrop: false,
        alertEnabled: true,
      },
    ]);
  }, []);

  const toggleAlert = (id: string) => {
    setFavorites(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, alertEnabled: !item.alertEnabled }
          : item
      )
    );
  };

  const removeFavorite = (id: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this product from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setFavorites(prev => prev.filter(item => item.id !== id))
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Track your favorite products</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {favorites.length > 0 ? (
          <View style={styles.favoritesList}>
            {favorites.map((product) => (
              <View key={product.id} style={styles.favoriteCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.storeName}>{product.store}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>${product.currentPrice}</Text>
                    {product.priceDrop && (
                      <View style={styles.priceDropBadge}>
                        <TrendingDown size={16} color="#34C759" />
                        <Text style={styles.priceDropText}>Lowest: ${product.lowestPrice}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.alertButton,
                      product.alertEnabled ? styles.alertEnabled : styles.alertDisabled
                    ]}
                    onPress={() => toggleAlert(product.id)}
                  >
                    <Bell size={20} color={product.alertEnabled ? "#007AFF" : "#8E8E93"} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFavorite(product.id)}
                  >
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Heart size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
              Add products to your favorites to track price changes and get alerts.
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Price Alerts</Text>
          <Text style={styles.infoText}>
            • Get notified when prices drop
          </Text>
          <Text style={styles.infoText}>
            • Track your favorite products
          </Text>
          <Text style={styles.infoText}>
            • Compare prices across stores
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
  favoritesList: {
    gap: 16,
    marginBottom: 20,
  },
  favoriteCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceDropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priceDropText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  alertButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  alertEnabled: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  alertDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
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
