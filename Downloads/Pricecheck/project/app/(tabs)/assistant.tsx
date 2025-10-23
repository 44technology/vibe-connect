import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Camera, Sparkles, Send } from 'lucide-react-native';

export default function Assistant() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      Alert.alert('Search', `Searching for: ${searchQuery}`);
      // Here you would implement the actual search functionality
    }
  };

  const handleCameraSearch = () => {
    Alert.alert('Camera Search', 'Camera search feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('assistant')}</Text>
        <Text style={styles.subtitle}>{t('aiRecommendation')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchProduct')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Send size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cameraButton} onPress={handleCameraSearch}>
            <Camera size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color="#FF9500" />
            <Text style={styles.cardTitle}>{t('recommendations')}</Text>
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiText}>
              {t('whereToShop')}
            </Text>
            <Text style={styles.comingSoon}>
              AI recommendations will appear here based on your shopping patterns.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('yourPatterns')}</Text>
          <View style={styles.patternsList}>
            <Text style={styles.comingSoon}>
              Upload receipts to see your shopping patterns and get personalized recommendations.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How AI Assistant works:</Text>
          <Text style={styles.infoText}>
            • Analyzes your shopping history
          </Text>
          <Text style={styles.infoText}>
            • Identifies your routine purchases
          </Text>
          <Text style={styles.infoText}>
            • Compares prices across stores
          </Text>
          <Text style={styles.infoText}>
            • Recommends where to shop for best savings
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
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  cameraButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  aiContent: {
    gap: 12,
  },
  aiText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  comingSoon: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  patternsList: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
