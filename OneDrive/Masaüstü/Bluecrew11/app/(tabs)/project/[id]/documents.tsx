import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Camera, FileText, Folder, X, Image as ImageIcon, File } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';
import { DocumentService, Document as DocumentType } from '@/services/documentService';
import { ProjectService } from '@/services/projectService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

type DocumentCategory = 'Plans' | 'Permits' | 'Designs' | 'Inspection' | 'Insurance' | 'Licence' | 'Other';

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams();
  const { user, userRole } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('Plans');
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // All categories - Insurance and Licence only visible to admin and office
  const allCategories: DocumentCategory[] = ['Plans', 'Permits', 'Designs', 'Inspection', 'Insurance', 'Licence', 'Other'];
  const categories: DocumentCategory[] = (userRole === 'admin' || userRole === 'office') 
    ? allCategories 
    : allCategories.filter(cat => cat !== 'Insurance' && cat !== 'Licence');

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project?.id) {
      loadDocuments();
    }
  }, [id, selectedCategory, project?.id]);

  const loadProject = async () => {
    try {
      if (!id) return;
      const projectData = await ProjectService.getProjectById(id as string);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadDocuments = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const projectDocuments = await DocumentService.getDocumentsByProjectAndCategory(
        id as string,
        selectedCategory
      );
      setDocuments(projectDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web: Use file input
        setShowUploadModal(false);
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadImageFile(file);
          }
        };
        input.click();
        return;
      } else {
        // Mobile: Use ImagePicker
        setShowUploadModal(false);
        setUploading(true);
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          const fileName = asset.uri.split('/').pop() || `photo_${Date.now()}.jpg`;
          
          // Convert URI to blob/file
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          await uploadImageFile(blob, fileName);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDocument = async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web: Use file input
        setShowUploadModal(false);
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf';
        
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadDocumentFile(file);
          }
        };
        input.click();
        return;
      } else {
        // Mobile: Use DocumentPicker
        setShowUploadModal(false);
        setUploading(true);
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/rtf'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          const fileName = asset.name;
          
          // Convert URI to blob/file
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          await uploadDocumentFile(blob, fileName);
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const uploadImageFile = async (file: Blob | File, fileName?: string) => {
    if (!id || !user) return;

    try {
      setUploading(true);
      const fileExtension = fileName?.split('.').pop() || 'jpg';
      const finalFileName = fileName || `photo_${Date.now()}.${fileExtension}`;

      await DocumentService.uploadDocument(
        id as string,
        selectedCategory,
        file,
        finalFileName,
        'image',
        user.name || user.email || 'Unknown',
        user.id
      );

      Alert.alert('Success', 'Photo uploaded successfully');
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const uploadDocumentFile = async (file: Blob | File, fileName: string) => {
    if (!id || !user) return;

    try {
      setUploading(true);

      await DocumentService.uploadDocument(
        id as string,
        selectedCategory,
        file,
        fileName,
        'document',
        user.name || user.email || 'Unknown',
        user.id
      );

      Alert.alert('Success', 'Document uploaded successfully');
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DocumentService.deleteDocument(docId);
              setDocuments(prev => prev.filter(doc => doc.id !== docId));
              Alert.alert('Success', 'Document deleted');
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/project/${id}`)} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffcc00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity onPress={() => setShowUploadModal(true)} style={styles.addButton}>
          <Plus size={24} color="#ffcc00" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Documents List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffcc00" />
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Folder size={48} color="#ffffff" />
            <Text style={styles.emptyText}>No documents in {selectedCategory}</Text>
            <Text style={styles.emptySubtext}>Add a document to get started</Text>
          </View>
        ) : (
          <View style={styles.documentsGrid}>
            {documents.map((document) => (
              <View key={document.id} style={styles.documentCard}>
                {document.file_type === 'image' ? (
                  <Image
                    source={{ uri: document.file_url }}
                    style={styles.documentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.documentIconContainer}>
                    <FileText size={40} color="#236ecf" />
                  </View>
                )}
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={2}>
                    {document.name}
                  </Text>
                  <Text style={styles.documentMeta}>
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.documentMeta}>by {document.uploaded_by}</Text>
                </View>
                {userRole === 'admin' && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDocument(document.id)}>
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Document</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#236ecf" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={[styles.uploadOption, uploading && styles.uploadOptionDisabled]}
                onPress={handleTakePhoto}
                disabled={uploading}>
                <Camera size={32} color={uploading ? "#9ca3af" : "#236ecf"} />
                <Text style={[styles.uploadOptionText, uploading && styles.uploadOptionTextDisabled]}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadOption, uploading && styles.uploadOptionDisabled]}
                onPress={handleUploadDocument}
                disabled={uploading}>
                <FileText size={32} color={uploading ? "#9ca3af" : "#236ecf"} />
                <Text style={[styles.uploadOptionText, uploading && styles.uploadOptionTextDisabled]}>Upload Document</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categorySelector}>
              <Text style={styles.selectorLabel}>Category:</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category && styles.categoryButtonTextActive,
                      ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like teams
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#236ecf',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#1e40af', // Darker blue like team tabs
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#236ecf',
  },
  categoryTabActive: {
    backgroundColor: '#ffcc00', // Yellow active tab
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff', // White text on blue
  },
  categoryTabTextActive: {
    color: '#236ecf', // Blue text on yellow
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#236ecf',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 4,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  documentCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  documentImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
  },
  documentIconContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    padding: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e0f2fe',
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
  },
  uploadOptionDisabled: {
    opacity: 0.5,
  },
  uploadOptionTextDisabled: {
    color: '#9ca3af',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#236ecf',
  },
  categorySelector: {
    marginTop: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
});



