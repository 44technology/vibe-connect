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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, X, FileText, Calendar, Hash, User, CheckCircle, ChevronDown, ChevronRight, ArrowLeft, Eye, Edit, Send } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectStep, ChangeOrderRequest, Comment } from '@/types';
import { ProjectService } from '@/services/projectService';
import { ChangeOrderService } from '@/services/changeOrderService';
import { CommentService } from '@/services/commentService';
import { MessageSquare } from 'lucide-react-native';

export default function ChangeOrderScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { projectId } = useLocalSearchParams();
  const [requests, setRequests] = useState<ChangeOrderRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedRequest, setSelectedRequest] = useState<ChangeOrderRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editRequest, setEditRequest] = useState<ChangeOrderRequest | null>(null);
  const [editSteps, setEditSteps] = useState<ProjectStep[]>([]);
  
  const [newRequest, setNewRequest] = useState({
    project_id: '',
    title: '',
    description: '',
    days_to_finish: '',
  });

  // Load projects from Firebase or single project when projectId is provided
  const loadData = async () => {
    try {
      setLoading(true);
      if (typeof projectId === 'string' && projectId) {
        const [project, changeOrderRequests] = await Promise.all([
          ProjectService.getProjectById(projectId),
          ChangeOrderService.getChangeOrderRequests()
        ]);
        setProjects(project ? [project] : []);
        setRequests(changeOrderRequests.filter(r => r.project_id === projectId));
        // Preselect project for new request
        setNewRequest(prev => ({ ...prev, project_id: projectId }));
      } else {
        const [firebaseProjects, changeOrderRequests] = await Promise.all([
          ProjectService.getProjects(),
          ChangeOrderService.getChangeOrderRequests()
        ]);
        setProjects(firebaseProjects);
        setRequests(changeOrderRequests);
      }
    } catch (error) {
      console.error('Error loading data for change order:', error);
      setProjects([]);
      setRequests([]);
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

  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    step_type: 'parent' as 'parent' | 'child',
    parent_step_id: '',
    order_index: 0,
    price: '',
    sub_contractor_price: '',
  });

  const [newSubStep, setNewSubStep] = useState({
    name: '',
    description: '',
    parent_step_id: '',
  });

  const [steps, setSteps] = useState<ProjectStep[]>([]);


  // Calculate new project deadline based on days to finish
  const calculateNewDeadline = (projectDeadline: string, daysToAdd: number): string => {
    if (!projectDeadline) return '';
    const deadlineDate = new Date(projectDeadline);
    deadlineDate.setDate(deadlineDate.getDate() + daysToAdd);
    return deadlineDate.toISOString().split('T')[0];
  };

  const handleAddStep = () => {
    if (!newStep.name) {
      Alert.alert('Error', 'Please enter step name');
      return;
    }

    if (newStep.step_type === 'parent' && !newStep.price) {
      Alert.alert('Error', 'Please enter step price');
      return;
    }

    const step: ProjectStep = {
      id: `temp-${Date.now()}`,
      project_id: newRequest.project_id,
      name: newStep.name,
      description: newStep.description,
      status: 'pending',
      order_index: steps.length + 1,
      created_at: new Date().toISOString(),
      step_type: newStep.step_type,
      ...(newStep.parent_step_id && { parent_step_id: newStep.parent_step_id }),
      ...(newStep.step_type === 'parent' && newStep.price && { price: parseFloat(newStep.price) }),
      ...(newStep.step_type === 'parent' && newStep.sub_contractor_price && { sub_contractor_price: parseFloat(newStep.sub_contractor_price) }),
    };

    setSteps(prev => [...prev, step]);
    setNewStep({
      name: '',
      description: '',
      step_type: 'parent',
      parent_step_id: '',
      order_index: 0,
      price: '',
      sub_contractor_price: '',
    });
  };

  const handleAddSubStep = () => {
    if (!newSubStep.name || !newSubStep.parent_step_id) {
      Alert.alert('Error', 'Please enter work description and select work title');
      return;
    }

    const subStep: ProjectStep = {
      id: `temp-sub-${Date.now()}`,
      project_id: newRequest.project_id,
      name: newSubStep.name,
      description: newSubStep.description,
      status: 'pending',
      order_index: 1,
      created_at: new Date().toISOString(),
      step_type: 'child',
      parent_step_id: newSubStep.parent_step_id,
    };

    // Add work description to the parent work title
    setSteps(prev => prev.map(step => 
      step.id === newSubStep.parent_step_id 
        ? {
            ...step,
            child_steps: [...(step.child_steps || []), subStep]
          }
        : step
    ));

    setNewSubStep({
      name: '',
      description: '',
      parent_step_id: '',
    });
  };

  const handleAddRequest = async () => {
    if (!newRequest.project_id || !newRequest.title || !newRequest.description || !newRequest.days_to_finish) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (steps.length === 0) {
      Alert.alert('Error', 'Please add at least one step');
      return;
    }

    const selectedProject = projects.find(p => p.id === newRequest.project_id);
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a valid project');
      return;
    }

    const daysToFinish = parseInt(newRequest.days_to_finish);
    if (isNaN(daysToFinish) || daysToFinish <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }

    // Calculate new deadline based on project deadline + days to finish
    const projectDeadline = selectedProject.deadline || selectedProject.start_date;
    if (!projectDeadline) {
      Alert.alert('Error', 'Project deadline not found');
      return;
    }

    const newDeadline = calculateNewDeadline(projectDeadline, daysToFinish);
    const requestedDate = new Date().toISOString().split('T')[0]; // Current date as requested date

    try {
      const requestData = {
        project_id: newRequest.project_id,
        project_name: selectedProject.title,
        title: newRequest.title,
        description: newRequest.description,
        requested_date: requestedDate,
        days_to_finish: daysToFinish,
        new_deadline: newDeadline,
        requested_by: user?.name || 'Current User',
        status: 'pending' as const,
        steps: steps.filter(step => step && step.name && step.name.trim() !== '').map(step => {
          const cleanStep = {
            ...step,
            description: step.description || '',
          };
          // Only include parent_step_id if it exists and is not empty
          if (step.parent_step_id && step.parent_step_id.trim() !== '') {
            cleanStep.parent_step_id = step.parent_step_id;
          }
          return cleanStep;
        }),
      };

      await ChangeOrderService.createChangeOrderRequest(requestData);
      
      // Reload data
      const updatedRequests = await ChangeOrderService.getChangeOrderRequests();
      setRequests(updatedRequests);
      
      setShowAddModal(false);
      setNewRequest({
        project_id: '',
        title: '',
        description: '',
        days_to_finish: '',
      });
      setSteps([]);
      
      Alert.alert('Success', 'Change order request created successfully');
    } catch (error) {
      console.error('Error creating change order request:', error);
      Alert.alert('Error', 'Failed to create change order request');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await ChangeOrderService.updateChangeOrderRequest(requestId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.name || 'Admin'
      });
      
      const updatedRequests = await ChangeOrderService.getChangeOrderRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Change order request approved');
    } catch (error) {
      console.error('Error approving change order request:', error);
      Alert.alert('Error', 'Failed to approve change order request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await ChangeOrderService.updateChangeOrderRequest(requestId, {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user?.name || 'Admin'
      });
      
      const updatedRequests = await ChangeOrderService.getChangeOrderRequests();
      setRequests(updatedRequests);
      Alert.alert('Success', 'Change order request rejected');
    } catch (error) {
      console.error('Error rejecting change order request:', error);
      Alert.alert('Error', 'Failed to reject change order request');
    }
  };

  const handleSendForApproval = async (requestId: string) => {
    try {
      // Status is already pending, just show confirmation
      Alert.alert('Success', 'Change order request is ready for admin approval');
    } catch (error) {
      console.error('Error sending for approval:', error);
      Alert.alert('Error', 'Failed to send for approval');
    }
  };

  const handleUpdateRequest = async () => {
    if (!editRequest) return;
    
    try {
      await ChangeOrderService.updateChangeOrderRequest(editRequest.id, {
        title: editRequest.title,
        description: editRequest.description,
        steps: editSteps.filter(step => step && step.name && step.name.trim() !== ''),
      });
      
      const updatedRequests = await ChangeOrderService.getChangeOrderRequests();
      if (typeof projectId === 'string' && projectId) {
        setRequests(updatedRequests.filter(r => r.project_id === projectId));
      } else {
        setRequests(updatedRequests);
      }
      
      setShowEditModal(false);
      setEditRequest(null);
      setEditSteps([]);
      Alert.alert('Success', 'Change order request updated successfully');
    } catch (error) {
      console.error('Error updating change order request:', error);
      Alert.alert('Error', 'Failed to update change order request');
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
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

  const projectScoped = typeof projectId === 'string' && projectId
    ? requests.filter(r => r.project_id === projectId)
    : requests;
  const filteredRequests = userRole === 'admin' 
    ? projectScoped 
    : projectScoped.filter(req => req.requested_by === user?.name);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {projectId && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push(`/(tabs)/project/${projectId}`)}>
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.title}>Change Order Requests</Text>
          <Text style={styles.subtitle}>
            {filteredRequests.length} total requests
          </Text>
        </View>
        {(userRole === 'pm' || userRole === 'admin') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#236ecf" />
            <Text style={styles.addButtonText}>New Request</Text>
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
        {filteredRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <Text style={styles.projectName}>{request.project_name}</Text>
                <Text style={styles.requestTitle}>{request.title}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    setSelectedRequest(request);
                    setShowDetailModal(true);
                  }}>
                  <Eye size={18} color="#236ecf" />
                </TouchableOpacity>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <View style={styles.detailRow}>
                <FileText size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{request.description}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Requested:</Text>
                <Text style={styles.detailValue}>{new Date(request.requested_date).toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <User size={16} color="#6b7280" />
                <Text style={styles.detailLabel}>Requested by:</Text>
                <Text style={styles.detailValue}>{request.requested_by}</Text>
              </View>

              {request.approved_at && (
                <View style={styles.detailRow}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.detailLabel}>Approved:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(request.approved_at).toLocaleString()} by {request.approved_by}
                  </Text>
                </View>
              )}

              {request.rejected_at && (
                <View style={styles.detailRow}>
                  <X size={16} color="#ef4444" />
                  <Text style={styles.detailLabel}>Rejected:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(request.rejected_at).toLocaleString()} by {request.rejected_by}
                  </Text>
                </View>
              )}

              <View style={styles.stepsSection}>
                <Text style={styles.stepsTitle}>Steps ({request.steps.length})</Text>
                {request.steps.map((step) => (
                  <View key={step.id} style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepInfo}>
                        <Text style={styles.stepName}>{step.name}</Text>
                        {step.description && (
                          <Text style={styles.stepDescription}>{step.description}</Text>
                        )}
                        {step.step_type === 'parent' && step.price && (userRole === 'admin' || userRole === 'pm') && (
                          <View style={styles.priceInfo}>
                            <Text style={styles.stepPrice}>Price: ${step.price.toLocaleString()}</Text>
                            {step.sub_contractor_price && (
                              <Text style={styles.stepPrice}>Sub Contractor Fee: ${step.sub_contractor_price.toLocaleString()}</Text>
                            )}
                            {step.price && step.sub_contractor_price && (
                              <Text style={[styles.stepPrice, styles.profitPrice]}>
                                Budget Profit: ${(step.price - step.sub_contractor_price).toLocaleString()}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                      {step.child_steps && step.child_steps.length > 0 && (
                        <TouchableOpacity
                          style={styles.expandButton}
                          onPress={() => toggleStepExpansion(step.id)}>
                          {expandedSteps.has(step.id) ? (
                            <ChevronDown size={20} color="#6b7280" />
                          ) : (
                            <ChevronRight size={20} color="#6b7280" />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {expandedSteps.has(step.id) && step.child_steps && (
                      <View style={styles.childStepsContainer}>
                        {step.child_steps.map((childStep) => (
                          <View key={childStep.id} style={styles.childStepCard}>
                            <View style={styles.childStepInfo}>
                              <Text style={styles.childStepName}>{childStep.name}</Text>
                              {childStep.description && (
                                <Text style={styles.childStepDescription}>{childStep.description}</Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.cardActions}>
              {(userRole === 'sales' || userRole === 'pm') && request.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      setEditRequest(request);
                      setEditSteps([...request.steps]);
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
              {userRole === 'admin' && request.status === 'pending' && (
                <>
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
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Request Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Change Order Request</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {!(typeof projectId === 'string' && projectId) && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Project *</Text>
                <View style={styles.projectList}>
                  {projects.map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={[
                        styles.projectOption,
                        newRequest.project_id === project.id && styles.selectedProject
                      ]}
                      onPress={() => setNewRequest(prev => ({ ...prev, project_id: project.id }))}>
                      <Text style={[
                        styles.projectOptionText,
                        newRequest.project_id === project.id && styles.selectedProjectText
                      ]}>
                        {project.title}
                      </Text>
                      {newRequest.project_id === project.id && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newRequest.title}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, title: text }))}
                placeholder="Enter change order title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newRequest.description}
                onChangeText={(text) => setNewRequest(prev => ({ ...prev, description: text }))}
                placeholder="Describe the change order request..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>How Many Days to Finish *</Text>
              <Text style={styles.helperText}>
                {newRequest.project_id && projects.find(p => p.id === newRequest.project_id)?.deadline
                  ? `Project deadline: ${new Date(projects.find(p => p.id === newRequest.project_id)!.deadline).toLocaleDateString()}. New deadline will be calculated automatically.`
                  : 'Select a project first to see the current deadline.'}
              </Text>
              <TextInput
                style={styles.input}
                value={newRequest.days_to_finish}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setNewRequest(prev => ({ ...prev, days_to_finish: numericValue }));
                }}
                placeholder="Enter number of days (e.g., 20)"
                keyboardType="numeric"
              />
              {newRequest.days_to_finish && newRequest.project_id && projects.find(p => p.id === newRequest.project_id)?.deadline && (
                <View style={styles.deadlinePreview}>
                  <Text style={styles.deadlinePreviewText}>
                    New project deadline: {calculateNewDeadline(
                      projects.find(p => p.id === newRequest.project_id)!.deadline,
                      parseInt(newRequest.days_to_finish) || 0
                    ) ? new Date(calculateNewDeadline(
                      projects.find(p => p.id === newRequest.project_id)!.deadline,
                      parseInt(newRequest.days_to_finish) || 0
                    )).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.stepsSection}>
              <Text style={styles.stepsTitle}>Steps ({steps.length})</Text>
              
              <View style={styles.addStepForm}>
                <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={newStep.name}
                    onChangeText={(text) => setNewStep(prev => ({ ...prev, name: text }))}
                placeholder="Enter work title"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price *</Text>
                  <TextInput
                    style={styles.input}
                    value={newStep.price}
                    onChangeText={(text) => setNewStep(prev => ({ ...prev, price: text }))}
                    placeholder="Enter step price"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sub Contractor Fee</Text>
                  <TextInput
                    style={styles.input}
                    value={newStep.sub_contractor_price}
                    onChangeText={(text) => setNewStep(prev => ({ ...prev, sub_contractor_price: text }))}
                    placeholder="Enter sub contractor fee"
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity style={styles.addStepButton} onPress={handleAddStep}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.addStepButtonText}>Add work title</Text>
                </TouchableOpacity>
              </View>

              {/* Add Work Description Form */}
              <View style={styles.addSubStepForm}>
              <Text style={styles.stepsTitle}>Add Work Description</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Work Title *</Text>
                  <View style={styles.parentStepList}>
                    {steps.filter(step => step.step_type === 'parent').map((step) => (
                      <TouchableOpacity
                        key={step.id}
                        style={[
                          styles.parentStepOption,
                          newSubStep.parent_step_id === step.id && styles.selectedParentStep
                        ]}
                        onPress={() => setNewSubStep(prev => ({ ...prev, parent_step_id: step.id }))}>
                        <Text style={[
                          styles.parentStepOptionText,
                          newSubStep.parent_step_id === step.id && styles.selectedParentStepText
                        ]}>
                          {step.name}
                        </Text>
                        {newSubStep.parent_step_id === step.id && (
                          <View style={styles.selectedIndicator} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Work Description *</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubStep.name}
                    onChangeText={(text) => setNewSubStep(prev => ({ ...prev, name: text }))}
                    placeholder="Enter work description"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Work Details</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={newSubStep.description}
                    onChangeText={(text) => setNewSubStep(prev => ({ ...prev, description: text }))}
                    placeholder="Enter additional details"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <TouchableOpacity style={styles.addSubStepButton} onPress={handleAddSubStep}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.addSubStepButtonText}>Add Work Description</Text>
                </TouchableOpacity>
              </View>

              {steps.map((step, index) => (
                <View key={step.id} style={styles.stepCard}>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepName}>{index + 1}. {step.name}</Text>
                    {step.description && (
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    )}
                  </View>
                  
                  {step.child_steps && step.child_steps.length > 0 && (
                    <View style={styles.childStepsContainer}>
                      {step.child_steps.map((childStep, childIndex) => (
                        <View key={childStep.id} style={styles.childStepCard}>
                          <View style={styles.childStepInfo}>
                            <Text style={styles.childStepName}>
                              {index + 1}.{childIndex + 1} {childStep.name}
                            </Text>
                            {childStep.description && (
                              <Text style={styles.childStepDescription}>{childStep.description}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddRequest}>
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Order Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {selectedRequest && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Project: {selectedRequest.project_name}</Text>
                <Text style={styles.detailTitle}>{selectedRequest.title}</Text>
                <Text style={styles.detailDescription}>{selectedRequest.description}</Text>
                
                <View style={styles.detailInfo}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.detailLabel}>Requested:</Text>
                    <Text style={styles.detailValue}>{new Date(selectedRequest.requested_date).toLocaleDateString()}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <User size={16} color="#6b7280" />
                    <Text style={styles.detailLabel}>Requested by:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.requested_by}</Text>
                  </View>

                  {selectedRequest.approved_at && (
                    <View style={styles.detailRow}>
                      <CheckCircle size={16} color="#10b981" />
                      <Text style={styles.detailLabel}>Approved:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedRequest.approved_at).toLocaleString()} by {selectedRequest.approved_by}
                      </Text>
                    </View>
                  )}

                  {selectedRequest.rejected_at && (
                    <View style={styles.detailRow}>
                      <X size={16} color="#ef4444" />
                      <Text style={styles.detailLabel}>Rejected:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedRequest.rejected_at).toLocaleString()} by {selectedRequest.rejected_by}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.stepsSection}>
                  <Text style={styles.stepsTitle}>Steps ({selectedRequest.steps.length})</Text>
                  {selectedRequest.steps.map((step) => (
                    <View key={step.id} style={styles.stepCard}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepInfo}>
                          <Text style={styles.stepName}>{step.name}</Text>
                          {step.description && (
                            <Text style={styles.stepDescription}>{step.description}</Text>
                          )}
                          {step.step_type === 'parent' && step.price && (userRole === 'admin' || userRole === 'pm') && (
                            <View style={styles.priceInfo}>
                              <Text style={styles.stepPrice}>Price: ${step.price.toLocaleString()}</Text>
                              {step.sub_contractor_price && (
                                <Text style={styles.stepPrice}>Sub Contractor Fee: ${step.sub_contractor_price.toLocaleString()}</Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                      
                      {step.child_steps && step.child_steps.length > 0 && (
                        <View style={styles.childStepsContainer}>
                          {step.child_steps.map((childStep) => (
                            <View key={childStep.id} style={styles.childStepCard}>
                              <View style={styles.childStepInfo}>
                                <Text style={styles.childStepName}>{childStep.name}</Text>
                                {childStep.description && (
                                  <Text style={styles.childStepDescription}>{childStep.description}</Text>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Change Order Request</Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEditRequest(null);
              setEditSteps([]);
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {editRequest && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={editRequest.title}
                  onChangeText={(text) => setEditRequest({ ...editRequest, title: text })}
                  placeholder="Enter title"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editRequest.description}
                  onChangeText={(text) => setEditRequest({ ...editRequest, description: text })}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.stepsSection}>
                <Text style={styles.stepsTitle}>Steps</Text>
                {editSteps.map((step, index) => (
                  <View key={step.id} style={styles.stepCard}>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepName}>{index + 1}. {step.name}</Text>
                      {step.description && (
                        <Text style={styles.stepDescription}>{step.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleUpdateRequest}>
                <Text style={styles.submitButtonText}>Update Request</Text>
              </TouchableOpacity>
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
    backgroundColor: '#1e40af', // Darker blue header like teams
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00', // Yellow button
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#236ecf', // Blue text on yellow button
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 12,
    paddingBottom: 100,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
  requestInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  stepsSection: {
    marginTop: 8,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  expandButton: {
    padding: 4,
  },
  childStepsContainer: {
    marginTop: 8,
    marginLeft: 16,
  },
  childStepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  childStepInfo: {
    flex: 1,
  },
  childStepName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  childStepDescription: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
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
    padding: 20,
    paddingBottom: 50,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  projectList: {
    gap: 8,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedProject: {
    backgroundColor: '#f0f9ff',
    borderColor: '#236ecf',
  },
  projectOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedProjectText: {
    color: '#236ecf',
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffcc00', // Yellow button
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  addStepForm: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00', // Yellow button
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  addStepButtonText: {
    color: '#236ecf', // Blue text on yellow button
    fontSize: 14,
    fontWeight: '600',
  },
  addSubStepForm: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  parentStepList: {
    gap: 8,
  },
  parentStepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedParentStep: {
    backgroundColor: '#f0f9ff',
    borderColor: '#236ecf',
  },
  parentStepOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedParentStepText: {
    color: '#236ecf',
  },
  addSubStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
  },
  addSubStepButtonText: {
    color: '#236ecf', // Blue text on yellow button
    fontSize: 14,
    fontWeight: '600',
  },
  stepPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
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
  editButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#236ecf',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  sendApprovalButton: {
    backgroundColor: '#236ecf',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
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
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailInfo: {
    gap: 8,
    marginBottom: 16,
  },
  priceInfo: {
    marginTop: 8,
    gap: 4,
  },
  profitPrice: {
    color: '#059669',
  },
});
