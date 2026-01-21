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
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, X, Calendar, User, Package, Hash, FileText, ShoppingCart, Truck, MapPin, CheckCircle, ArrowLeft, Eye, Edit, Send } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialRequest, Project, Vendor } from '@/types';
import { MaterialRequestService } from '@/services/materialRequestService';
import { ProjectService } from '@/services/projectService';
import { VendorService } from '@/services/vendorService';

export default function MaterialRequestScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaterialRequest | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const [newRequest, setNewRequest] = useState({
    project_id: projectId as string || '',
    substep_id: '',
    quantity: '',
    description: '',
    delivery_date: '',
    vendor_id: '',
  });

  // Load data from Firebase
  const loadData = async () => {
    try {
      setLoading(true);
      const [materialRequests, firebaseProjects, vendorsData] = await Promise.all([
        MaterialRequestService.getMaterialRequests(),
        ProjectService.getProjects(),
        VendorService.getVendors()
      ]);
      
      console.log('Firebase projects loaded:', firebaseProjects);
      setRequests(materialRequests);
      setProjects(firebaseProjects);
      setVendors(vendorsData);
      
      // Set selected project if projectId is provided
      if (projectId) {
        const project = firebaseProjects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          // Filter requests for this project
          setRequests(materialRequests.filter(r => r.project_id === projectId));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadData();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setNewRequest(prev => ({ ...prev, delivery_date: formattedDate }));
    }
  };

  const handleAddRequest = async () => {
    if (!newRequest.project_id || !newRequest.quantity || !newRequest.description || !newRequest.delivery_date || !newRequest.vendor_id) {
      Alert.alert('Error', 'Please fill in all required fields including vendor selection');
      return;
    }

    console.log('Creating material request with data:', newRequest);

    try {
      const selectedProject = projects.find(p => p.id === newRequest.project_id);
      if (!selectedProject) {
        Alert.alert('Error', 'Selected project not found');
      return;
    }

      const requestData = {
      project_id: newRequest.project_id,
      project_name: selectedProject.title,
        substep_id: 'general',
        substep_name: 'General Request',
      quantity: newRequest.quantity,
      description: newRequest.description,
      delivery_date: newRequest.delivery_date,
        status: 'pending' as const,
        requested_by: user?.name || 'Unknown User',
        ...(newRequest.vendor_id && { vendor_id: newRequest.vendor_id }),
      };

      await MaterialRequestService.createMaterialRequest(requestData);
      
      // Reload data
      const updatedRequests = await MaterialRequestService.getMaterialRequests();
      setRequests(updatedRequests);
      
    setShowAddModal(false);
    setNewRequest({
      project_id: '',
      substep_id: '',
      quantity: '',
      description: '',
      delivery_date: '',
        vendor_id: '',
      });
      
      Alert.alert('Success', 'Material request created successfully');
    } catch (error) {
      console.error('Error creating material request:', error);
      Alert.alert('Error', 'Failed to create material request');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await MaterialRequestService.updateMaterialRequest(requestId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.name || 'Admin',
        purchase_status: 'pending',
      });
      
      const updatedRequests = await MaterialRequestService.getMaterialRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Request approved');
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const handleSendForApproval = async (requestId: string) => {
    try {
      // Status is already pending, just show confirmation
      Alert.alert('Success', 'Material request is ready for admin approval');
    } catch (error) {
      console.error('Error sending for approval:', error);
      Alert.alert('Error', 'Failed to send for approval');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await MaterialRequestService.updateMaterialRequest(requestId, {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user?.name || 'Admin',
      });
      
      const updatedRequests = await MaterialRequestService.getMaterialRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request');
    }
  };


  const handleMarkAsOrdered = async (requestId: string) => {
    try {
      await MaterialRequestService.updateMaterialRequest(requestId, {
        purchase_status: 'ordered',
        purchase_date: new Date().toISOString(),
      });
      
      const updatedRequests = await MaterialRequestService.getMaterialRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Request marked as ordered');
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update request');
    }
  };

  const handleMarkAsShipped = async (requestId: string) => {
    try {
      await MaterialRequestService.updateMaterialRequest(requestId, {
        purchase_status: 'shipped',
        shipping_date: new Date().toISOString(),
      });
      
      const updatedRequests = await MaterialRequestService.getMaterialRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Request marked as shipped');
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update request');
    }
  };

  const handleMarkAsDelivered = async (requestId: string) => {
    try {
      await MaterialRequestService.updateMaterialRequest(requestId, {
        purchase_status: 'delivered',
        delivery_date_actual: new Date().toISOString(),
      });
      
      const updatedRequests = await MaterialRequestService.getMaterialRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Request marked as delivered');
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Failed to update request');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading material requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Material Requests</Text>
            {selectedProject && (
              <Text style={styles.projectName}>{selectedProject.title}</Text>
            )}
            <Text style={styles.subtitle}>
              {requests.length} total requests
            </Text>
          </View>
        </View>
        {(userRole === 'pm' || userRole === 'admin') && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#236ecf" />
            <Text style={styles.addButtonText}>Add Request</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#236ecf"
            />
          ) : undefined
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No material requests yet</Text>
            <Text style={styles.emptySubtext}>
              {userRole === 'pm' ? 'Create your first material request' : 'No requests to review'}
            </Text>
          </View>
        ) : (
          requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <Text style={styles.requestTitle}>{request.description}</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                      setSelectedRequest(request);
                      setShowDetailModal(true);
                    }}>
                    <Eye size={18} color="#236ecf" />
                  </TouchableOpacity>
                  <View style={[styles.statusBadge, styles[`${request.status}Badge`]]}>
                    <Text style={[styles.statusText, styles[`${request.status}Text`]]}>
                      {request.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
            </View>

            <View style={styles.requestDetails}>
              <View style={styles.detailRow}>
                  <Package size={16} color="#6b7280" />
                  <Text style={styles.detailText}>Quantity: {request.quantity}</Text>
              </View>
              
              <View style={styles.detailRow}>
                  <Hash size={16} color="#6b7280" />
                  <Text style={styles.detailText}>Project: {request.project_name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Calendar size={16} color="#6b7280" />
                  <Text style={styles.detailText}>Delivery: {request.delivery_date}</Text>
              </View>
              
                {request.sub_contractor && (
              <View style={styles.detailRow}>
                    <User size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Vendor: {request.sub_contractor}
                    </Text>
              </View>
                )}
              
                {request.purchase_status && (
                <View style={styles.detailRow}>
                  <ShoppingCart size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Status: {request.purchase_status.charAt(0).toUpperCase() + request.purchase_status.slice(1)}
                  </Text>
                </View>
              )}
              
              {request.purchase_date && (
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#6b7280" />
                    <Text style={styles.detailText}>Ordered: {new Date(request.purchase_date).toLocaleDateString()}</Text>
                </View>
              )}
              
              {request.shipping_date && (
                <View style={styles.detailRow}>
                  <Truck size={16} color="#6b7280" />
                    <Text style={styles.detailText}>Shipped: {new Date(request.shipping_date).toLocaleDateString()}</Text>
                  </View>
                )}
                
                {request.delivery_date_actual && (
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#6b7280" />
                    <Text style={styles.detailText}>Delivered: {new Date(request.delivery_date_actual).toLocaleDateString()}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardActions}>
              {(userRole === 'sales' || userRole === 'pm') && request.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      setEditingRequest(request);
                      setShowEditModal(true);
                    }}>
                    <Edit size={16} color="#236ecf" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.sendApprovalButton]}
                    onPress={() => handleSendForApproval(request.id)}>
                    <Send size={16} color="#ffffff" />
                    <Text style={styles.sendApprovalButtonText}>Send for Approval</Text>
                  </TouchableOpacity>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  {request.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApproveRequest(request.id)}
                      >
                        <CheckCircle size={16} color="#236ecf" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleRejectRequest(request.id)}
                      >
                        <X size={16} color="#236ecf" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  
                  {/* Purchase Status Buttons */}
                  {request.status === 'approved' && (
                    <View style={styles.purchaseStatusActions}>
                      {(request.purchase_status === 'pending' || !request.purchase_status) && (
                    <TouchableOpacity
                          style={styles.orderedButton}
                          onPress={() => handleMarkAsOrdered(request.id)}
                        >
                          <ShoppingCart size={16} color="#236ecf" />
                          <Text style={styles.orderedButtonText}>Ordered</Text>
                    </TouchableOpacity>
                  )}
                      
                  {request.purchase_status === 'ordered' && (
                    <TouchableOpacity
                          style={styles.shippedButton}
                          onPress={() => handleMarkAsShipped(request.id)}
                        >
                          <Truck size={16} color="#236ecf" />
                          <Text style={styles.shippedButtonText}>Shipped</Text>
                    </TouchableOpacity>
                  )}
                      
                  {request.purchase_status === 'shipped' && (
                    <TouchableOpacity
                          style={styles.deliveredButton}
                          onPress={() => handleMarkAsDelivered(request.id)}
                        >
                          <MapPin size={16} color="#236ecf" />
                          <Text style={styles.deliveredButtonText}>Delivered</Text>
                    </TouchableOpacity>
                  )}
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
          ))
        )}
      </ScrollView>

      {/* Add Request Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Material Request</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Project Name *</Text>
              <View style={styles.projectList}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectOption,
                      newRequest.project_id === project.id && styles.selectedProject
                    ]}
                    onPress={() => setNewRequest(prev => ({ ...prev, project_id: project.id }))}
                  >
                    <Text style={[
                      styles.projectText,
                      newRequest.project_id === project.id && styles.selectedProjectText
                    ]}>
                      {project.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                value={newRequest.quantity}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, quantity: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                value={newRequest.description}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Delivery *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={newRequest.delivery_date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, delivery_date: e.target.value }))}
                  style={styles.webDateInput}
                />
              ) : (
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#6b7280" />
                  <Text style={styles.datePickerText}>
                    {newRequest.delivery_date || 'Select date'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vendor *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowVendorDropdown(true)}>
                <Text style={[styles.dropdownText, !newRequest.vendor_id && styles.placeholderText]}>
                  {newRequest.vendor_id 
                    ? vendors.find(v => v.id === newRequest.vendor_id)?.companyName || 'Select vendor'
                    : 'Select vendor'
                  }
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddRequest}>
              <Text style={styles.submitButtonText}>Create Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Vendor Dropdown Modal */}
      <Modal
        visible={showVendorDropdown}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Vendor</Text>
              <TouchableOpacity onPress={() => setShowVendorDropdown(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownList}>
              {vendors.map((vendor) => (
                <TouchableOpacity
                  key={vendor.id}
                  style={styles.vendorOption}
                  onPress={() => {
                    setNewRequest(prev => ({ ...prev, vendor_id: vendor.id }));
                    setShowVendorDropdown(false);
                  }}>
                  <Text style={styles.vendorCompanyName}>{vendor.companyName}</Text>
                  <Text style={styles.vendorRepName}>{vendor.repName}</Text>
                  <Text style={styles.vendorEmail}>{vendor.email}</Text>
                </TouchableOpacity>
              ))}
              {vendors.length === 0 && (
                <Text style={styles.noVendorsText}>No vendors available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Material Request Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedRequest && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Project: {selectedRequest.project_name}</Text>
                <Text style={styles.detailTitle}>{selectedRequest.description}</Text>
                
                <View style={styles.detailInfo}>
                  <View style={styles.detailRow}>
                    <Package size={16} color="#6b7280" />
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.quantity}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.detailLabel}>Delivery Date:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.delivery_date}</Text>
                  </View>

                  {selectedRequest.sub_contractor && (
                    <View style={styles.detailRow}>
                      <User size={16} color="#6b7280" />
                      <Text style={styles.detailLabel}>Vendor:</Text>
                      <Text style={styles.detailValue}>
                        {selectedRequest.sub_contractor}
                      </Text>
                    </View>
                  )}

                  {selectedRequest.purchase_status && (
                    <View style={styles.detailRow}>
                      <ShoppingCart size={16} color="#6b7280" />
                      <Text style={styles.detailLabel}>Purchase Status:</Text>
                      <Text style={styles.detailValue}>
                        {selectedRequest.purchase_status.charAt(0).toUpperCase() + selectedRequest.purchase_status.slice(1)}
                      </Text>
                    </View>
                  )}

                  {selectedRequest.purchase_date && (
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.detailLabel}>Ordered:</Text>
                      <Text style={styles.detailValue}>{new Date(selectedRequest.purchase_date).toLocaleDateString()}</Text>
                    </View>
                  )}

                  {selectedRequest.shipping_date && (
                    <View style={styles.detailRow}>
                      <Truck size={16} color="#6b7280" />
                      <Text style={styles.detailLabel}>Shipped:</Text>
                      <Text style={styles.detailValue}>{new Date(selectedRequest.shipping_date).toLocaleDateString()}</Text>
                    </View>
                  )}

                  {selectedRequest.delivery_date_actual && (
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#6b7280" />
                      <Text style={styles.detailLabel}>Delivered:</Text>
                      <Text style={styles.detailValue}>{new Date(selectedRequest.delivery_date_actual).toLocaleDateString()}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header like teams
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00', // Yellow button
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#236ecf', // Blue text on yellow button
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  approvedBadge: {
    backgroundColor: '#d1fae5',
  },
  rejectedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: '#d97706',
  },
  approvedText: {
    color: '#059669',
  },
  rejectedText: {
    color: '#dc2626',
  },
  requestDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  formGroup: {
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
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  projectList: {
    gap: 8,
  },
  projectOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedProject: {
    backgroundColor: '#dbeafe',
    borderColor: '#236ecf',
  },
  projectText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedProjectText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#236ecf', // Blue button
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff', // White text on yellow button
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    width: '90%',
    maxHeight: '70%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  dropdownList: {
    maxHeight: 300,
  },
  vendorOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  vendorCompanyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  vendorRepName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  vendorEmail: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noVendorsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf', // Blue background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
    fontWeight: '500',
  },
  purchaseStatusActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  orderedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  orderedButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  shippedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  shippedButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deliveredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  deliveredButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f0f9ff',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#236ecf',
  },
  editButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  sendApprovalButton: {
    backgroundColor: '#236ecf',
  },
  sendApprovalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailInfo: {
    gap: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginLeft: 8,
  },
});