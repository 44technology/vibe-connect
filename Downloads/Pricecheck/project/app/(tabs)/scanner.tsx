import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Image as ImageIcon, CameraIcon, Loader } from 'lucide-react-native';
import { router } from 'expo-router';
import { processReceipt, ReceiptData } from '@/lib/ocrService';
import { searchProductsOnline, ProductWithResults } from '@/lib/productSearchService';

// Remove duplicate interface since it's now imported

export default function Scanner() {
  const { t } = useLanguage();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{t('loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#007AFF" />
          <Text style={styles.message}>{t('cameraPermission')}</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>{t('grantPermission')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleUploadReceipt = () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('info'), 'Gallery access is not available on web. Please use the camera.');
    } else {
      Alert.alert(t('info'), 'Gallery picker coming soon!');
    }
  };

  // Process receipt and search for products
  const processReceiptAndSearch = async (imageUri: string) => {
    try {
      // Process the receipt image
      const receiptData: ReceiptData = await processReceipt(imageUri);
      
      if (receiptData.products.length === 0) {
        Alert.alert('No Products Found', 'Could not extract products from receipt. Please try again with a clearer photo.');
        return;
      }
      
      // Search for products online
      const searchResults: ProductWithResults[] = await searchProductsOnline(receiptData.products);
      
      // Navigate to results page with data
      router.push({
        pathname: '/search-results',
        params: {
          products: JSON.stringify(searchResults),
          receiptData: JSON.stringify(receiptData)
        }
      });
      
    } catch (error) {
      console.error('Receipt processing error:', error);
      Alert.alert('Processing Error', 'Failed to process receipt. Please try again.');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Process receipt and search for products
        await processReceiptAndSearch(photo.uri);
        
        setShowCamera(false);
        setIsProcessing(false);
        
      } catch (error) {
        Alert.alert(t('error'), 'Failed to process receipt');
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('scanner')}</Text>
        <Text style={styles.subtitle}>{t('scanReceipt')}</Text>
      </View>

      <View style={styles.content}>
        {showCamera ? (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame} />
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowCamera(false)}
                  >
                    <Text style={styles.closeButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
                    onPress={takePicture}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="large" color="#fff" />
                    ) : (
                      <CameraIcon size={32} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.flipButton}
                    onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                  >
                    <Text style={styles.flipButtonText}>Flip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        ) : (
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowCamera(true)}
            >
              <Camera size={48} color="#007AFF" />
              <Text style={styles.optionTitle}>{t('takePhoto')}</Text>
              <Text style={styles.optionText}>{t('scanReceipt')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleUploadReceipt}
            >
              <ImageIcon size={48} color="#34C759" />
              <Text style={styles.optionTitle}>{t('gallery')}</Text>
              <Text style={styles.optionText}>{t('uploadReceipt')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>1. Take a clear photo of your receipt</Text>
          <Text style={styles.infoText}>2. AI will extract product prices</Text>
          <Text style={styles.infoText}>3. Prices are saved for comparison</Text>
        </View>
      </View>
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
  options: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  scanFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    marginVertical: 40,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
