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
} from 'react-native';
import { Plus, X, Package, Calendar, Hash, FileText, ShoppingCart, Truck } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// Mock data - In real app, this would come from database
const mockProjects = [
  { id: '1', title: 'Luxury Villa - Miami Beach', status: 'active' },
  { id: '2', title: 'Office Complex - Downtown', status: 'active' },
  { id: '3', title: 'Shopping Center Renovation', status: 'active' },
];

const mockSubSteps = [
  { id: '1-1', name: 'Demolition permit', project_id: '1' },
  { id: '1-2', name: 'Flooring permit', project_id: '1' },
  { id: '1-3', name: 'Master permit', project_id: '1' },
  { id: '2-1', name: 'Foundation work', project_id: '2' },
  { id: '2-2', name: 'Framing', project_id: '2' },
  { id: '3-1', name: 'Interior demolition', project_id: '3' },
  { id: '3-2', name: 'Electrical upgrade', project_id: '3' },
];

interface MaterialRequest {
  id: string;
  project_id: string;
  project_name: string;
  substep_id: string;
  substep_name: string;
  quantity: string;
  description: string;
  delivery_date: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  requested_at: string;
  approved_at?: string;
  purchase_status?: 'pending' | 'ordered' | 'shipped' | 'delivered';
  purchase_date?: string;
  shipping_date?: string;
  delivery_date_actual?: string;
}

export default function MaterialRequestScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Initialize with some mock approved requests
  useEffect(() => {
    const initialRequests: MaterialRequest[] = [
      {
        id: '1',
        project_id: '1',
        project_name: 'Luxury Villa - Miami Beach',
        substep_id: '1-1',
        substep_name: 'Demolition permit',
        quantity: '50',
        description: 'Concrete blocks for foundation',
        delivery_date: '2024-02-15',
        status: 'pending',
        requested_by: 'John Smith',
        requested_at: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        project_id: '2',
        project_name: 'Office Complex - Downtown',
        substep_id: '2-1',
        substep_name: 'Foundation work',
        quantity: '25',
        description: 'Wooden cabinets',
        delivery_date: '2024-02-20',
        status: 'approved',
        requested_by: 'Sarah Johnson',
        requested_at: '2024-01-16T14:30:00Z',
        approved_at: '2024-01-17T09:00:00Z',
        purchase_status: 'ordered',
        purchase_date: '2024-01-18T11:00:00Z',
      },
      {
        id: '3',
        project_id: '1',
        project_name: 'Luxury Villa - Miami Beach',
        substep_id: '1-2',
        substep_name: 'Flooring permit',
        quantity: '100',
        description: 'Electrical cables and switches',
        delivery_date: '2024-02-10',
        status: 'approved',
        requested_by: 'Mike Wilson',
        requested_at: '2024-01-10T08:00:00Z',
        approved_at: '2024-01-11T10:00:00Z',
        purchase_status: 'shipped',
        purchase_date: '2024-01-12T14:00:00Z',
        shipping_date: '2024-01-20T16:00:00Z',
      },
    ];
    setRequests(initialRequests);
  }, []);
  const [newRequest, setNewRequest] = useState({
    project_id: '',
    substep_id: '',
    quantity: '',
    description: '',
    delivery_date: '',
  });

  const handleAddRequest = () => {
    if (!newRequest.project_id || !newRequest.substep_id || !newRequest.quantity || !newRequest.description || !newRequest.delivery_date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const selectedProject = mockProjects.find(p => p.id === newRequest.project_id);
    const selectedSubStep = mockSubSteps.find(s => s.id === newRequest.substep_id);
    
    if (!selectedProject || !selectedSubStep) {
      Alert.alert('Error', 'Please select valid project and sub-step');
      return;
    }

    const request: MaterialRequest = {
      id: Date.now().toString(),
      project_id: newRequest.project_id,
      project_name: selectedProject.title,
      substep_id: newRequest.substep_id,
      substep_name: selectedSubStep.name,
      quantity: newRequest.quantity,
      description: newRequest.description,
      delivery_date: newRequest.delivery_date,
      status: 'pending',
      requested_by: user?.name || 'Current User',
      requested_at: new Date().toISOString(),
    };

    setRequests(prev => [...prev, request]);
    setShowAddModal(false);
    setNewRequest({
      project_id: '',
      substep_id: '',
      quantity: '',
      description: '',
      delivery_date: '',
    });
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'approved',
        approved_at: new Date().toISOString(),
        purchase_status: 'pending'
      } : req
    ));
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };

  const handleUpdatePurchaseStatus = (requestId: string, newStatus: 'pending' | 'ordered' | 'shipped' | 'delivered') => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              purchase_status: newStatus,
              ...(newStatus === 'ordered' && { purchase_date: new Date().toISOString() }),
              ...(newStatus === 'shipped' && { shipping_date: new Date().toISOString() }),
              ...(newStatus === 'delivered' && { delivery_date_actual: new Date().toISOString() })
            }
          : req
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPurchaseStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'ordered': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getPurchaseStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Purchase';
      case 'ordered': return 'Ordered';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const filteredRequests = userRole === 'admin' 
    ? requests 
    : requests.filter(req => req.requested_by === user?.name);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Material Requests</Text>
          <Text style={styles.subtitle}>
            {filteredRequests.length} total requests
          </Text>
        </View>
        {(userRole === 'pm' || userRole === 'admin') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>New Request</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <Text style={styles.projectName}>{request.project_name}</Text>
                <Text style={styles.substepName}>{request.substep_name}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                  {getStatusText(request.status)}
                </Text>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <View style={styles.detailRow}>
                <Hash size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>{request.quantity}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <FileText size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{request.description}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Delivery:</Text>
                <Text style={styles.detailValue}>{new Date(request.delivery_date).toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Package size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Requested by:</Text>
                <Text style={styles.detailValue}>{request.requested_by}</Text>
              </View>
              
              {request.status === 'approved' && request.purchase_status && (
                <View style={styles.detailRow}>
                  <ShoppingCart size={16} color="#6b7280" />
                  <Text style={styles.detailLabel}>Purchase Status:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: getPurchaseStatusColor(request.purchase_status) }
                  ]}>
                    {getPurchaseStatusText(request.purchase_status)}
                  </Text>
                </View>
              )}
              
              {request.purchase_date && (
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.detailLabel}>Ordered:</Text>
                  <Text style={styles.detailValue}>{new Date(request.purchase_date).toLocaleDateString()}</Text>
                </View>
              )}
              
              {request.shipping_date && (
                <View style={styles.detailRow}>
                  <Truck size={16} color="#6b7280" />
                  <Text style={styles.detailLabel}>Shipped:</Text>
                  <Text style={styles.detailValue}>{new Date(request.shipping_date).toLocaleDateString()}</Text>
                </View>
              )}
            </View>

            {userRole === 'admin' && request.status === 'pending' && (
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApproveRequest(request.id)}>
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectRequest(request.id)}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {userRole === 'admin' && request.status === 'approved' && request.purchase_status && (
              <View style={styles.purchaseActions}>
                <Text style={styles.purchaseActionsTitle}>Update Purchase Status:</Text>
                <View style={styles.purchaseButtons}>
                  {request.purchase_status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.purchaseButton, styles.orderedButton]}
                      onPress={() => handleUpdatePurchaseStatus(request.id, 'ordered')}>
                      <Text style={styles.purchaseButtonText}>Mark as Ordered</Text>
                    </TouchableOpacity>
                  )}
                  {request.purchase_status === 'ordered' && (
                    <TouchableOpacity
                      style={[styles.purchaseButton, styles.shippedButton]}
                      onPress={() => handleUpdatePurchaseStatus(request.id, 'shipped')}>
                      <Text style={styles.purchaseButtonText}>Mark as Shipped</Text>
                    </TouchableOpacity>
                  )}
                  {request.purchase_status === 'shipped' && (
                    <TouchableOpacity
                      style={[styles.purchaseButton, styles.deliveredButton]}
                      onPress={() => handleUpdatePurchaseStatus(request.id, 'delivered')}>
                      <Text style={styles.purchaseButtonText}>Mark as Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
        
        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#6b7280" />
            <Text style={styles.emptyText}>No material requests yet</Text>
            <Text style={styles.emptySubtext}>
              {userRole === 'pm' ? 'Create your first material request' : 'No requests to review'}
            </Text>
          </View>
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

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project Name *</Text>
              <View style={styles.projectList}>
                {mockProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectOption,
                      newRequest.project_id === project.id && styles.selectedProjectOption,
                    ]}
                    onPress={() => {
                      setNewRequest(prev => ({ ...prev, project_id: project.id, substep_id: '' }));
                    }}>
                    <Text style={styles.projectName}>{project.title}</Text>
                    {newRequest.project_id === project.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sub-Step *</Text>
              <View style={styles.substepList}>
                {mockSubSteps
                  .filter(step => step.project_id === newRequest.project_id)
                  .map((step) => (
                    <TouchableOpacity
                      key={step.id}
                      style={[
                        styles.substepOption,
                        newRequest.substep_id === step.id && styles.selectedSubstepOption,
                      ]}
                      onPress={() => setNewRequest(prev => ({ ...prev, substep_id: step.id }))}>
                      <Text style={styles.substepName}>{step.name}</Text>
                      {newRequest.substep_id === step.id && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                value={newRequest.quantity}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, quantity: text }))}
                placeholder="e.g. 50 units, 100 kg, 25 pieces"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRequest.description}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
                placeholder="Describe the material needed..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Delivery (Deadline) *</Text>
              <TextInput
                style={styles.input}
                value={newRequest.delivery_date}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, delivery_date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddRequest}>
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4a6',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#236ecf20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 4,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#236ecf',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#236ecf',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 4,
  },
  substepName: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b98120',
  },
  approveButtonText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#ef444420',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  purchaseActions: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  purchaseActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  purchaseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  purchaseButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  orderedButton: {
    backgroundColor: '#3b82f6',
  },
  shippedButton: {
    backgroundColor: '#8b5cf6',
  },
  deliveredButton: {
    backgroundColor: '#10b981',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#236ecf',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  projectList: {
    gap: 6,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedProjectOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  substepList: {
    gap: 6,
  },
  substepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedSubstepOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  substepName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#236ecf',
  },
  submitButton: {
    backgroundColor: '#236ecf',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
