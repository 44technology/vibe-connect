import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Plus, Package, ArrowLeft, X, CheckCircle } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';
import { ProjectService } from '@/services/projectService';
import { MaterialRequestService } from '@/services/materialRequestService';
import { VendorService } from '@/services/vendorService';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';
import { Platform } from 'react-native';

export default function ProjectMaterialsScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    project_id: id as string,
    item_name: '',
    quantity: '',
    unit: '',
    description: '',
    vendor_id: '',
    priority: 'medium',
    requested_by: user?.name || '',
  });

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, requests, vendorsData] = await Promise.all([
        ProjectService.getProjectById(id as string),
        MaterialRequestService.getMaterialRequests(),
        VendorService.getVendors()
      ]);
      
      setProject(projectData);
      
      // Filter requests for this project
      const projectRequests = requests.filter(r => r.project_id === id);
      setMaterialRequests(projectRequests);
      
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequest = async () => {
    if (!newRequest.item_name || !newRequest.quantity || !newRequest.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const requestData = {
        ...newRequest,
        quantity: parseInt(newRequest.quantity),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const requestId = await MaterialRequestService.createMaterialRequest(requestData);
      
      const newRequestWithId = {
        id: requestId,
        ...requestData,
      };

      setMaterialRequests(prev => [newRequestWithId, ...prev]);
      setNewRequest({
        project_id: id as string,
        item_name: '',
        quantity: '',
        unit: '',
        description: '',
        vendor_id: '',
        priority: 'medium',
        requested_by: user?.name || '',
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Material request added successfully');
    } catch (error) {
      console.error('Error adding material request:', error);
      Alert.alert('Error', 'Failed to add material request');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#059669';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push(`/(tabs)/project/${id}`)}>
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Materials</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      {Platform.OS === 'web' && <TopNavigationBar />}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push(`/(tabs)/project/${id}`)}>
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Materials</Text>
          <Text style={styles.headerSubtitle}>{project.title}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {materialRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No material requests found</Text>
            <Text style={styles.emptySubtext}>Add a new material request to get started</Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {materialRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>{request.item_name}</Text>
                  <View style={styles.badges}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(request.priority) }]}>
                      <Text style={styles.badgeText}>{request.priority.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                      <Text style={styles.badgeText}>{request.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.requestDescription}>{request.description}</Text>
                
                <View style={styles.requestDetails}>
                  <Text style={styles.detailText}>
                    Quantity: {request.quantity} {request.unit}
                  </Text>
                  {request.vendor_name && (
                    <Text style={styles.detailText}>
                      Vendor: {request.vendor_name}
                    </Text>
                  )}
                  <Text style={styles.detailText}>
                    Requested by: {request.requested_by}
                  </Text>
                  <Text style={styles.detailText}>
                    Date: {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Add Material Request Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Material Request</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                value={newRequest.item_name}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, item_name: text }))}
                placeholder="Enter item name"
              />
            </View>

            <View style={styles.quantityRow}>
              <View style={styles.quantityInput}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={newRequest.quantity}
                  onChangeText={(text) => setNewRequest(prev => ({ ...prev, quantity: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.unitInput}>
                <Text style={styles.label}>Unit (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={newRequest.unit}
                  onChangeText={(text) => setNewRequest(prev => ({ ...prev, unit: text }))}
                  placeholder="pcs, kg, etc."
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRequest.description}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vendor</Text>
              <View style={styles.vendorList}>
                {vendors.map((vendor) => (
                  <TouchableOpacity
                    key={vendor.id}
                    style={[
                      styles.vendorOption,
                      newRequest.vendor_id === vendor.id && styles.selectedVendorOption,
                    ]}
                    onPress={() => setNewRequest(prev => ({ ...prev, vendor_id: vendor.id }))}>
                    <View style={styles.vendorInfo}>
                      <Text style={styles.vendorName}>{vendor.companyName}</Text>
                      <Text style={styles.vendorRep}>{vendor.repName}</Text>
                    </View>
                    {newRequest.vendor_id === vendor.id && (
                      <CheckCircle size={20} color="#236ecf" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      newRequest.priority === priority && styles.selectedPriorityOption,
                    ]}
                    onPress={() => setNewRequest(prev => ({ ...prev, priority }))}>
                    <Text style={[
                      styles.priorityText,
                      newRequest.priority === priority && styles.selectedPriorityText,
                    ]}>
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddRequest}>
              <Text style={styles.submitButtonText}>Add Material Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? 16 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  requestsList: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  requestDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  requestDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    color: '#236ecf',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  vendorList: {
    gap: 8,
  },
  vendorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedVendorOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  vendorRep: {
    fontSize: 14,
    color: '#6b7280',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  selectedPriorityOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedPriorityText: {
    color: '#236ecf',
  },
  submitButton: {
    backgroundColor: '#236ecf',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});



