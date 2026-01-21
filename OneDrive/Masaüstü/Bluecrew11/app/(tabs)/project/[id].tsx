import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ArrowLeft, Pencil, Trash2, Calendar, Clock, User, Plus, X, ChevronDown, ChevronRight, ChevronUp, Check, Package, FileText, Settings, ArrowRight, Folder, Database, CheckCircle2, MessageSquare } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ProjectTimeline } from '@/components/ProjectTimeline';
import { TodoList } from '@/components/TodoList';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectStep, ChangeOrderRequest, Comment } from '@/types';
import { ChangeOrderService } from '@/services/changeOrderService';
import { ProjectService } from '@/services/projectService';
import { CommentService } from '@/services/commentService';
import { UserService } from '@/services/userService';
import HamburgerMenu from '@/components/HamburgerMenu';

// Project will be loaded from Firebase

export default function ProjectDetailScreen() {
  const { id, showWorkTitlesModal } = useLocalSearchParams();
  const navigation = useNavigation();
  
  // Hide tab bar when on project details page
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' },
    });
    return () => {
      navigation.setOptions({
        tabBarStyle: { display: 'flex' },
      });
    };
  }, [navigation]);
  
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key: string) => key);
  
  const authContext = useAuth();
  const userRole = authContext?.userRole || 'admin';
  const user = authContext?.user || null;
  const [project, setProject] = useState<Project | null>(null);
  const [originalProject, setOriginalProject] = useState<Project | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    description: '',
    category: '',
    client_id: '',
    client_name: '',
    start_date: '',
    deadline: '',
    project_street: '',
    project_city: '',
    project_state: '',
    project_zip: '',
    discount: '',
    project_description: '',
    general_conditions_percentage: '18.5',
    supervision_type: 'part-time' as 'full-time' | 'part-time' | 'none',
    supervision_weeks: '',
  });
  const [showEditStartDatePicker, setShowEditStartDatePicker] = useState(false);
  const [showEditDeadlinePicker, setShowEditDeadlinePicker] = useState(false);
  const [editWorkTitles, setEditWorkTitles] = useState<Array<{ name: string; description: string; quantity: string; unit_price: string; price: string }>>([]);
  const [newEditWorkTitle, setNewEditWorkTitle] = useState({ name: '', description: '', quantity: '', unit_price: '', price: '' });
  const [editingWorkTitleIndex, setEditingWorkTitleIndex] = useState<number | null>(null);
  const [showEditWorkTitleModal, setShowEditWorkTitleModal] = useState(false);
  const [selectedEditWorkTitleFromList, setSelectedEditWorkTitleFromList] = useState<string>('');
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showMoveStepModal, setShowMoveStepModal] = useState(false);
  const [stepToMove, setStepToMove] = useState<string | null>(null);
  const [showAddChildStepModal, setShowAddChildStepModal] = useState(false);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [showEditChildStepModal, setShowEditChildStepModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<any>(null);
  const [selectedParentStepId, setSelectedParentStepId] = useState<string | null>(null);
  const [selectedStepForNotes, setSelectedStepForNotes] = useState<ProjectStep | null>(null);
  const [selectedStepForEdit, setSelectedStepForEdit] = useState<ProjectStep | null>(null);
  const [selectedChildStepForEdit, setSelectedChildStepForEdit] = useState<{step: ProjectStep, parentId: string} | null>(null);
  const [newStep, setNewStep] = useState({ name: '', description: '', price: '' });
  const [newChildStep, setNewChildStep] = useState({ name: '', description: '' });
  const [editStep, setEditStep] = useState({ name: '', description: '', price: '' });
  const [editChildStep, setEditChildStep] = useState({ name: '', description: '' });
  const [stepNotes, setStepNotes] = useState('');
  const [showWorkTitleSelectModal, setShowWorkTitleSelectModal] = useState(false);
  const [workTitleSearchQuery, setWorkTitleSearchQuery] = useState('');
  const [selectedWorkTitleFromList, setSelectedWorkTitleFromList] = useState<string>('');
  
  // Predefined work titles list (same as create project form)
  const predefinedWorkTitles = [
    'New',
    'Architectural Plans',
    'Permit Process',
    'Design Fee',
    'Full-Time Supervision',
    'Part-Time Supervision',
    'General Conditions and Fees',
    'Equipment Rental',
    'Vehicle Gas Fee',
    'Commission',
    'Dumpsters Fee',
    'Inspection Fee',
    'Cleaning Fee',
    'Indoor Delivery',
    'Receiving Area Delivery',
    'Trash Removal',
  ];
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<{ id: string; name: string; role: string }[]>([]);
  const [showPMAssignmentModal, setShowPMAssignmentModal] = useState(false);
  const [showClientAssignmentModal, setShowClientAssignmentModal] = useState(false);
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [showDeleteProjectSuccessModal, setShowDeleteProjectSuccessModal] = useState(false);
  const [showWorkTitlesListModal, setShowWorkTitlesListModal] = useState(false);
  const [selectedPM, setSelectedPM] = useState('');
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]); // Multiple PM selection
  const [selectedClient, setSelectedClient] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showClientSelectModal, setShowClientSelectModal] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedEditClients, setSelectedEditClients] = useState<Array<{ id: string; name: string }>>([]);

  const [changeOrders, setChangeOrders] = useState<ChangeOrderRequest[]>([]);
  
  const handleUpdateChangeOrderStatus = async (changeOrderId: string, newStatus: 'pending' | 'in_progress' | 'finished') => {
    try {
      await ChangeOrderService.updateChangeOrderRequest(changeOrderId, {
        completion_status: newStatus,
      });
      
      // Update local state
      setChangeOrders(prev => prev.map(co => 
        co.id === changeOrderId ? { ...co, completion_status: newStatus } : co
      ));
      
      Alert.alert('Success', 'Change order status updated successfully');
    } catch (error) {
      console.error('Error updating change order status:', error);
      Alert.alert('Error', 'Failed to update change order status');
    }
  };
  
  const getCompletionStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return '#6b7280'; // Gray
      case 'in_progress': return '#f59e0b'; // Orange
      case 'finished': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };
  
  const getCompletionStatusText = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'finished': return 'Finished';
      default: return 'Pending';
    }
  };
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const handleApproveChangeRequest = async (requestId: string) => {
    try {
      await ChangeOrderService.updateChangeOrderRequest(requestId, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.name || '',
      });
      setChangeOrders(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved', approved_at: new Date().toISOString(), approved_by: user?.name || '' }
          : req
      ));
      Alert.alert('Success', 'Change request approved');
    } catch (error) {
      console.error('Error approving change request:', error);
      Alert.alert('Error', 'Failed to approve change request');
    }
  };
  const handleRejectChangeRequest = async (requestId: string) => {
    try {
      await ChangeOrderService.updateChangeOrderRequest(requestId, {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user?.name || '',
      });
      setChangeOrders(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected', rejected_at: new Date().toISOString(), rejected_by: user?.name || '' }
          : req
      ));
      Alert.alert('Success', 'Change request rejected');
    } catch (error) {
      console.error('Error rejecting change request:', error);
      Alert.alert('Error', 'Failed to reject change request');
    }
  };

  // Load project data from Firebase
  const loadProject = async () => {
    try {
      setLoading(true);
      if (!id) {
        setLoading(false);
        return;
      }
      
const projectData = await ProjectService.getProjectById(id as string);
        if (projectData) {
          // Calculate and update progress based on work titles
          const calculatedProgress = calculateProjectProgress(projectData);
          projectData.progress_percentage = calculatedProgress;
          setProject(projectData);
          setOriginalProject(JSON.parse(JSON.stringify(projectData))); // Deep copy for comparison
          setHasUnsavedChanges(false);
        } else {
        // Project not found, navigate to projects page
        router.replace('/(tabs)/projects');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Load change orders for this project
  const reloadChangeOrders = async () => {
    if (!project?.id) return;
    try {
      const projectChangeOrders = await ChangeOrderService.getChangeOrderRequestsByProjectId(project.id);
      setChangeOrders(projectChangeOrders);
    } catch (error) {
      console.error('Error loading change orders:', error);
      setChangeOrders([]);
    }
  };

  useEffect(() => {
    reloadChangeOrders();
  }, [project?.id]);

  useFocusEffect(
    React.useCallback(() => {
      reloadChangeOrders();
    }, [project?.id])
  );

  // Load comments for this project with user roles
  useEffect(() => {
    const loadComments = async () => {
      if (!project?.id) return;
      
      try {
        setCommentsLoading(true);
        const projectComments = await CommentService.getCommentsByProjectId(project.id);
        
        // Load user roles for each comment
        const allUsersData = await UserService.getAllUsers();
        const commentsWithRoles = projectComments.map(comment => {
          const commentUser = allUsersData.find(u => u.id === comment.user_id);
          return {
            ...comment,
            user_role: commentUser?.role || 'unknown',
          };
        });
        
        setComments(commentsWithRoles as any);
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [project?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate project progress based on work titles (each work title gets equal share)
  const calculateProjectProgress = (projectData: Project | null): number => {
    if (!projectData || !projectData.steps || projectData.steps.length === 0) {
      return 0;
    }

    const parentSteps = projectData.steps;
    const totalSteps = parentSteps.length;
    const stepPercentage = 100 / totalSteps;
    let totalProgress = 0;

    parentSteps.forEach(step => {
      if (step.child_steps && step.child_steps.length > 0) {
        // Parent step with child steps
        const totalChildSteps = step.child_steps.length;
        const completedChildSteps = step.child_steps.filter(childStep => 
          childStep.status === 'finished' || childStep.manual_checkmark
        ).length;
        const inProgressChildSteps = step.child_steps.filter(childStep => 
          childStep.status === 'in_progress'
        ).length;
        
        // Each child step contributes equally to parent step
        const stepProgress = (completedChildSteps + (inProgressChildSteps * 0.5)) / totalChildSteps;
        // Multiply by stepPercentage to get the actual contribution
        totalProgress += stepProgress * stepPercentage;
      } else {
        // Parent step without child steps
        // Each step contributes stepPercentage based on status
        if (step.status === 'finished') {
          totalProgress += stepPercentage; // Full percentage (e.g., 20% if 5 steps)
        } else if (step.status === 'in_progress') {
          totalProgress += stepPercentage * 0.5; // Half percentage (e.g., 10% if 5 steps)
        }
        // pending = 0, no contribution
      }
    });

    return Math.round(totalProgress);
  };

  const getDaysUntilDeadline = () => {
    if (!project || !project.deadline) return 0;
    const today = new Date();
    const deadline = new Date(project.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  const handleAddStep = async () => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    if (!newStep.name || !newStep.price) {
      Alert.alert('Error', 'Please fill in step name and price');
      return;
    }

    if (!project?.id) {
      Alert.alert('Error', 'Project ID is missing');
      return;
    }

    try {
      const step: ProjectStep = {
        id: Date.now().toString(),
        project_id: project.id,
        name: newStep.name,
        description: newStep.description || '',
        status: 'pending',
        order_index: (project?.steps?.length || 0) + 1,
        created_at: new Date().toISOString(),
        step_type: 'parent',
        child_steps: [],
        price: parseFloat(newStep.price),
      };

      // Save step to Firebase (exclude id and project_id from step object)
      const { id: stepId, project_id: _, ...stepData } = step;
      const firebaseStepId = await ProjectService.addStep(project.id, stepData);
      
      // Update step with Firebase ID
      step.id = firebaseStepId;

      // Update local state
      setProject(prev => ({
        ...prev,
        steps: [...(prev?.steps || []), step],
      }));

      setShowAddStepModal(false);
      setNewStep({ name: '', description: '', price: '' });
      setSelectedWorkTitleFromList('');
      
      Alert.alert('Success', 'Work title added successfully');
    } catch (error) {
      console.error('Error adding step:', error);
      Alert.alert('Error', 'Failed to add work title. Please try again.');
    }
  };

  const handleAddChildStep = async (parentStepId: string) => {
    console.log('handleAddChildStep called with:', { parentStepId, newChildStep, projectId: project?.id, userRole });
    
    // Only admin and PM can edit projects
    if (userRole !== 'admin' && userRole !== 'pm') {
      Alert.alert('Access Denied', 'Only administrators and project managers can edit projects.');
      return;
    }

    if (!newChildStep.name || !project?.id) {
      Alert.alert('Error', 'Please enter work description name');
      return;
    }

    if (!parentStepId) {
      Alert.alert('Error', 'Parent step ID is missing');
      return;
    }

    try {
      // Check if project steps are loaded
      if (!project.steps || project.steps.length === 0) {
        console.error('Project steps not loaded yet');
        Alert.alert('Error', 'Project steps are not loaded yet. Please wait and try again.');
        return;
      }

      // Find parent step to get child_steps count for order_index
      const parentStep = project.steps.find(s => s.id === parentStepId);
      if (!parentStep) {
        console.error('Parent step not found:', { parentStepId, availableSteps: project.steps.map(s => s.id) });
        Alert.alert('Error', `Parent step not found. Available steps: ${project.steps.length}`);
        return;
      }
      
      const childStepsCount = parentStep?.child_steps?.length || 0;
      console.log('Parent step found:', { parentStepId, childStepsCount });

      // Create child step data
      const childStepData: Omit<ProjectStep, 'id' | 'project_id'> = {
        name: newChildStep.name.trim(),
        description: newChildStep.description?.trim() || '',
        status: 'pending',
        order_index: childStepsCount + 1,
        parent_step_id: parentStepId,
        created_at: new Date().toISOString(),
        step_type: 'child',
      };

      console.log('Adding child step to Firebase:', childStepData);
      // Save child step to Firebase
      const childStepId = await ProjectService.addStep(project.id, childStepData);
      console.log('Child step added with ID:', childStepId);

      // Create child step object with Firebase ID
      const childStep: ProjectStep = {
        ...childStepData,
        id: childStepId,
        project_id: project.id,
      };

      // Update local state
      setProject(prev => ({
        ...prev,
        steps: prev.steps?.map(step => 
          step.id === parentStepId 
            ? { 
                ...step, 
                child_steps: [...(step.child_steps || []), childStep] 
              }
            : step
        ) || [],
      }));

      setShowAddChildStepModal(false);
      setNewChildStep({ name: '', description: '' });
      setSelectedParentStepId(null);
      
      Alert.alert('Success', 'Work description added successfully');
    } catch (error) {
      console.error('Error adding child step:', error);
      Alert.alert('Error', 'Failed to add work description. Please try again.');
    }
  };

  const handleUpdateStepNotes = (stepId: string, notes: string) => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    setProject(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, notes } : step
      ) || [],
    }));
    setShowEditNotesModal(false);
    setSelectedStepForNotes(null);
    setStepNotes('');
  };

  const handleDeleteStep = (stepId: string, isChildStep: boolean = false, parentStepId?: string) => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }
    setStepToDelete({ stepId, isChildStep, parentStepId });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (stepToDelete) {
      const { stepId, isChildStep, parentStepId } = stepToDelete;
      if (isChildStep && parentStepId) {
        // Delete child step
        setProject(prev => {
          const newProject = {
            ...prev,
            steps: prev.steps?.map(step => 
              step.id === parentStepId 
                ? {
                    ...step,
                    child_steps: step.child_steps?.filter(childStep => childStep.id !== stepId) || []
                  }
                : step
            ) || [],
          };
          return newProject;
        });
      } else {
        // Delete parent step
        setProject(prev => {
          const newProject = {
            ...prev,
            steps: prev.steps?.filter(step => step.id !== stepId) || [],
          };
          return newProject;
        });
      }
      setShowDeleteModal(false);
      setStepToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStepToDelete(null);
  };

  const handleEditStep = (step: ProjectStep) => {
    setSelectedStepForEdit(step);
    setEditStep({
      name: step.name,
      description: step.description || '',
      price: step.price?.toString() || '',
    });
    setShowEditStepModal(true);
  };

  const handleEditChildStep = (step: ProjectStep, parentId: string) => {
    setSelectedChildStepForEdit({ step, parentId });
    setEditChildStep({
      name: step.name,
      description: step.description || '',
    });
    setShowEditChildStepModal(true);
  };

  const handleUpdateStep = () => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    if (!selectedStepForEdit || !editStep.name || !editStep.price) {
      Alert.alert('Error', 'Please fill in step name and price');
      return;
    }

    setProject(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === selectedStepForEdit.id 
          ? { 
              ...step, 
              name: editStep.name,
              description: editStep.description,
              price: parseFloat(editStep.price),
            }
          : step
      ) || [],
    }));

    setShowEditStepModal(false);
    setSelectedStepForEdit(null);
    setEditStep({ name: '', description: '', price: '' });
  };

  const handleUpdateChildStep = () => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    if (!selectedChildStepForEdit || !editChildStep.name) return;

    setProject(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === selectedChildStepForEdit.parentId 
          ? {
              ...step,
              child_steps: step.child_steps?.map(childStep =>
                childStep.id === selectedChildStepForEdit.step.id 
                  ? { 
                      ...childStep, 
                      name: editChildStep.name,
                      description: editChildStep.description,
                    }
                  : childStep
              ) || []
            }
          : step
      ) || [],
    }));

    setShowEditChildStepModal(false);
    setSelectedChildStepForEdit(null);
    setEditChildStep({ name: '', description: '' });
  };

  const getTotalBudgetPercentage = () => {
    return project?.steps?.reduce((total, step) => total + (step.budget_percentage || 0), 0) || 0;
  };

  const handleCommentChange = (text: string) => {
    setNewComment(text);
    
    // Check for @ mentions
    const words = text.split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      const searchTerm = lastWord.substring(1).toLowerCase();
      const filtered = allUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm)
      );
      setMentionSuggestions(filtered);
      setShowMentionSuggestions(filtered.length > 0);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleMentionSelect = (userName: string) => {
    const words = newComment.split(' ');
    words[words.length - 1] = `@${userName}`;
    setNewComment(words.join(' ') + ' ');
    setShowMentionSuggestions(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626'; // Red
      case 'pm': return '#2563eb'; // Blue
      case 'client': return '#16a34a'; // Green
      case 'sales': return '#d97706'; // Orange
      case 'office': return '#7c3aed'; // Purple
      default: return '#6b7280'; // Gray
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !project?.id) return;

    try {
      const commentData = {
        project_id: project?.id || '',
        user_id: user?.id || 'current-user',
        user_name: user?.name || 'Current User',
        comment: newComment.trim(),
      };

      const commentId = await CommentService.addComment(commentData);
      
      // Add to local state with user role
      const newCommentObj: any = {
        id: commentId,
        ...commentData,
        created_at: new Date().toISOString(),
        user_role: userRole,
      };

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      setShowCommentModal(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const [pms, setPMs] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [officeUsers, setOfficeUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);

  // Load PMs, Clients, and Office users for mentions
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsersData = await UserService.getAllUsers();
        
        const pmUsers = allUsersData.filter(u => u.role === 'pm');
        setPMs(pmUsers.map(pm => ({ id: pm.id, name: pm.name, email: pm.email, role: 'pm' })));
        
        const clientUsers = allUsersData.filter(u => u.role === 'client');
        setClients(clientUsers.map(client => ({ id: client.id, name: client.name, email: client.email, role: 'client' })));
        
        const officeUsers = allUsersData.filter(u => u.role === 'office');
        setOfficeUsers(officeUsers.map(office => ({ id: office.id, name: office.name, email: office.email, role: 'office' })));
        
        // Combine all users for mention suggestions
        const allUsersList = [
          ...pmUsers.map(pm => ({ id: pm.id, name: pm.name, email: pm.email, role: 'pm' })),
          ...clientUsers.map(client => ({ id: client.id, name: client.name, email: client.email, role: 'client' })),
          ...officeUsers.map(office => ({ id: office.id, name: office.name, email: office.email, role: 'office' })),
        ];
        setAllUsers(allUsersList);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  // Load selected PMs when modal opens
  useEffect(() => {
    if (showPMAssignmentModal && project?.assigned_pms) {
      setSelectedPMs(project.assigned_pms);
    } else if (showPMAssignmentModal) {
      setSelectedPMs([]);
    }
  }, [showPMAssignmentModal, project?.assigned_pms]);

  const handleTogglePM = (pmId: string) => {
    setSelectedPMs(prev => {
      if (prev.includes(pmId)) {
        // Remove PM
        return prev.filter(id => id !== pmId);
      } else {
        // Add PM
        return [...prev, pmId];
      }
    });
  };

  const handleSavePMAssignment = async () => {
    if (!project?.id) return;

    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    try {
      // Update project with assigned PMs
      await ProjectService.updateProject(project.id, {
        assigned_pms: selectedPMs,
      });

      // Update local state
      setProject(prev => ({
        ...prev,
        assigned_pms: selectedPMs,
      }));

      Alert.alert('Success', 'Project managers updated successfully');
      setShowPMAssignmentModal(false);
      setSelectedPMs([]);
    } catch (error) {
      console.error('Error updating PM assignment:', error);
      Alert.alert('Error', 'Failed to update project managers. Please try again.');
    }
  };

  const handleAssignClient = () => {
    if (!selectedClient) return;

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    setProject(prev => ({
      ...prev,
      client_id: selectedClient,
      client_name: client.name,
      assigned_clients: [...(prev.assigned_clients || []), selectedClient],
      client_info: {
        id: selectedClient,
        name: client.name,
        email: client.email,
        assigned_date: new Date().toISOString(),
      }
    }));

    setSelectedClient('');
    setShowClientAssignmentModal(false);
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

  const moveStepUp = async (stepId: string) => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }
    if (!project?.id) return;

    const steps = project.steps || [];
    const currentIndex = steps.findIndex(step => step.id === stepId);
    
    if (currentIndex > 0) {
      const newSteps = [...steps];
      [newSteps[currentIndex], newSteps[currentIndex - 1]] = [newSteps[currentIndex - 1], newSteps[currentIndex]];
      
      // Update order_index
      newSteps.forEach((step, index) => {
        step.order_index = index;
      });
      
      // Update local state
      setProject(prev => ({
        ...prev,
        steps: newSteps,
      }));

      // Save to Firebase - Update each step's order_index
      try {
        for (const step of newSteps) {
          await ProjectService.updateStep(step.id, { order_index: step.order_index });
        }
        Alert.alert('Success', 'Step order updated successfully');
      } catch (error) {
        console.error('Error updating step order:', error);
        Alert.alert('Error', 'Failed to update step order');
        // Reload project to get latest data
        loadProject();
      }
    }
  };

  const moveStepDown = async (stepId: string) => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }
    if (!project?.id) return;

    const steps = project.steps || [];
    const currentIndex = steps.findIndex(step => step.id === stepId);
    
    if (currentIndex < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[currentIndex], newSteps[currentIndex + 1]] = [newSteps[currentIndex + 1], newSteps[currentIndex]];
      
      // Update order_index
      newSteps.forEach((step, index) => {
        step.order_index = index;
      });
      
      // Update local state
      setProject(prev => ({
        ...prev,
        steps: newSteps,
      }));

      // Save to Firebase - Update each step's order_index
      try {
        for (const step of newSteps) {
          await ProjectService.updateStep(step.id, { order_index: step.order_index });
        }
        Alert.alert('Success', 'Step order updated successfully');
      } catch (error) {
        console.error('Error updating step order:', error);
        Alert.alert('Error', 'Failed to update step order');
        // Reload project to get latest data
        loadProject();
      }
    }
  };

  const moveStepToPosition = async (stepId: string, targetPosition: number) => {
    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }
    if (!project?.id) return;

    // Only move parent steps (work titles)
    const parentSteps = (project.steps || []).filter(step => step.step_type === 'parent' || !step.parent_step_id);
    const currentIndex = parentSteps.findIndex(step => step.id === stepId);
    
    if (currentIndex === -1 || targetPosition < 0 || targetPosition >= parentSteps.length) {
      return;
    }

    if (currentIndex === targetPosition) {
      return; // Already at target position
    }

    const newParentSteps = [...parentSteps];
    const [movedStep] = newParentSteps.splice(currentIndex, 1);
    newParentSteps.splice(targetPosition, 0, movedStep);
    
    // Get all child steps to preserve them
    const allChildSteps = (project.steps || []).filter(step => step.step_type === 'child' && step.parent_step_id);
    
    // Combine parent and child steps
    const newSteps = [...newParentSteps, ...allChildSteps];
    
    // Update order_index
    newSteps.forEach((step, index) => {
      step.order_index = index;
    });
    
    // Update local state
    setProject(prev => ({
      ...prev,
      steps: newSteps,
    }));

    // Save to Firebase - Update each parent step's order_index
    try {
      for (const step of newParentSteps) {
        await ProjectService.updateStep(step.id, { order_index: step.order_index });
      }
      Alert.alert('Success', 'Work title moved successfully');
    } catch (error) {
      console.error('Error updating step order:', error);
      Alert.alert('Error', 'Failed to update step order');
      // Reload project to get latest data
      loadProject();
    }
  };

  const handleUpdateStepStatus = (stepId: string, newStatus: ProjectStep['status'], isChildStep: boolean = false, parentStepId?: string) => {
    if (!project?.id) return;

    // Admin and PM can update step status
    if (userRole !== 'admin' && userRole !== 'pm') {
      Alert.alert('Access Denied', 'Only administrators and project managers can update step status.');
      return;
    }

    if (isChildStep && parentStepId) {
      // Update child step
      const updatedProject = {
        ...project,
        steps: project.steps?.map(step => 
          step.id === parentStepId 
            ? {
                ...step,
                child_steps: step.child_steps?.map(childStep =>
                  childStep.id === stepId ? { ...childStep, status: newStatus } : childStep
                ) || []
              }
            : step
        ) || [],
      };

      // Tüm parent step'lerin status'unu otomatik güncelle
      const finalProject = updateAllParentStepStatuses(updatedProject);

      // Update project progress based on work titles
      const newProgress = calculateProjectProgress(finalProject);
      finalProject.progress_percentage = newProgress;

      // Update local state only - no Firebase save yet
      setProject(finalProject);
      setHasUnsavedChanges(true);
    } else {
      // Update parent step
      const updatedProject = {
        ...project,
        steps: project.steps?.map(step => 
          step.id === stepId ? { ...step, status: newStatus } : step
        ) || [],
      };

      // Update project progress based on work titles
      const newProgress = calculateProjectProgress(updatedProject);
      updatedProject.progress_percentage = newProgress;

      // Update local state only - no Firebase save yet
      setProject(updatedProject);
      setHasUnsavedChanges(true);
    }
  };

  // Save all changes to Firebase
  const handleSaveChanges = async () => {
    if (!project?.id || !hasUnsavedChanges) return;

    // Admin and PM can save changes
    if (userRole !== 'admin' && userRole !== 'pm') {
      Alert.alert('Access Denied', 'Only administrators and project managers can save changes.');
      return;
    }

    setSaving(true);
    try {
      // Update each step individually in the steps collection
      const updatePromises: Promise<void>[] = [];
      
      for (const step of project.steps || []) {
        // Build update object, only including defined values (Firebase doesn't allow undefined)
        const stepUpdate: { status: string; manual_checkmark?: boolean } = {
          status: step.status || 'pending',
        };
        if (step.manual_checkmark !== undefined) {
          stepUpdate.manual_checkmark = step.manual_checkmark;
        }
        
        // Update parent step
        updatePromises.push(
          ProjectService.updateStep(step.id, stepUpdate)
        );
        
        // Update child steps
        if (step.child_steps && step.child_steps.length > 0) {
          for (const childStep of step.child_steps) {
            const childUpdate: { status: string; manual_checkmark?: boolean } = {
              status: childStep.status || 'pending',
            };
            if (childStep.manual_checkmark !== undefined) {
              childUpdate.manual_checkmark = childStep.manual_checkmark;
            }
            
            updatePromises.push(
              ProjectService.updateStep(childStep.id, childUpdate)
            );
          }
        }
      }
      
      // Wait for all step updates to complete
      await Promise.all(updatePromises);
      
      // Also update the project progress percentage
      await ProjectService.updateProject(project.id, {
        progress_percentage: project.progress_percentage,
      });
      
      setOriginalProject(JSON.parse(JSON.stringify(project)));
      setHasUnsavedChanges(false);
      
      if (Platform.OS === 'web') {
        alert('Changes saved successfully!');
      } else {
        Alert.alert('Success', 'Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save changes. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateParentStepStatus = (parentStepId: string, childSteps: ProjectStep[], currentProject: Project) => {
    const parentStep = currentProject.steps?.find(step => step.id === parentStepId);
    if (!parentStep || !childSteps || childSteps.length === 0) return parentStep?.status || 'pending';

    const allChildStepsFinished = childSteps.every(childStep => 
      childStep.status === 'finished' || childStep.manual_checkmark
    );
    
    const anyChildStepInProgress = childSteps.some(childStep => 
      childStep.status === 'in_progress'
    );
    
    const anyChildStepStarted = childSteps.some(childStep => 
      childStep.status === 'in_progress' || childStep.status === 'finished' || childStep.manual_checkmark
    );

    if (allChildStepsFinished) {
      return 'finished';
    } else if (anyChildStepInProgress || anyChildStepStarted) {
      return 'in_progress';
    } else {
      return 'pending';
    }
  };

  // Parent step'lerin status'unu otomatik güncelle
  const updateAllParentStepStatuses = (currentProject: Project) => {
    const updatedProject = { ...currentProject };
    
    updatedProject.steps = updatedProject.steps?.map(step => {
      if (step.step_type === 'parent' && step.child_steps && step.child_steps.length > 0) {
        const newStatus = updateParentStepStatus(step.id, step.child_steps, updatedProject);
        // Eğer tüm child step'ler tamamlandıysa, parent step'i de tamamlandı olarak işaretle
        const allChildStepsFinished = step.child_steps.every(cs => 
          cs.status === 'finished' || cs.manual_checkmark
        );
        if (newStatus !== step.status || (allChildStepsFinished && !step.manual_checkmark && newStatus === 'finished')) {
          return { 
            ...step, 
            status: newStatus,
            manual_checkmark: allChildStepsFinished ? true : step.manual_checkmark
          };
        }
      }
      return step;
    }) || [];
    
    return updatedProject;
  };

  const handleToggleManualCheckmark = async (stepId: string, parentStepId: string) => {
    if (!project?.id) return;

    const childStep = project.steps?.find(s => s.id === parentStepId)?.child_steps?.find(cs => cs.id === stepId);
    if (!childStep) return;

    const newManualCheckmark = !childStep.manual_checkmark;
    const newStatus = newManualCheckmark ? 'finished' : 'pending';

    try {
      // Update child step in Firebase
      await ProjectService.updateStep(stepId, {
        manual_checkmark: newManualCheckmark,
        status: newStatus,
      });

      // Update local state
      setProject(prev => {
        const updatedProject = {
          ...prev,
          steps: prev.steps?.map(step => 
            step.id === parentStepId 
              ? {
                  ...step,
                  child_steps: step.child_steps?.map(cs =>
                    cs.id === stepId 
                      ? { 
                          ...cs, 
                          manual_checkmark: newManualCheckmark,
                          status: newStatus
                        } 
                      : cs
                  ) || []
                }
              : step
          ) || [],
        };

        // Tüm parent step'lerin status'unu otomatik güncelle
        const finalProject = updateAllParentStepStatuses(updatedProject);

        // Update parent step status in Firebase if it changed
        const parentStep = finalProject.steps?.find(s => s.id === parentStepId);
        const oldParentStep = updatedProject.steps?.find(s => s.id === parentStepId);
        if (parentStep && parentStep.status !== oldParentStep?.status) {
          // Eğer tüm child step'ler tamamlandıysa, parent step'in de manual_checkmark'ını true yap
          const allChildStepsFinished = parentStep.child_steps?.every(cs => 
            cs.status === 'finished' || cs.manual_checkmark
          );
          const updateData: any = { status: parentStep.status };
          if (allChildStepsFinished && parentStep.status === 'finished') {
            updateData.manual_checkmark = true;
          }
          ProjectService.updateStep(parentStepId, updateData).catch(console.error);
        }

        // Check if all steps are finished
        const allStepsFinished = finalProject.steps?.every(step => 
          step.status === 'finished' && 
          (!step.child_steps || step.child_steps.length === 0 || 
           step.child_steps.every(cs => cs.status === 'finished' || cs.manual_checkmark))
        );
        
        // Do NOT auto-complete the project here. We only enable the "Complete Project" button
        // once everything is finished, and let the user explicitly mark the project completed.

        // Update project progress based on work titles
        const newProgress = calculateProjectProgress(finalProject);
        finalProject.progress_percentage = newProgress;
        
        // Update project progress in Firebase
        if (newProgress !== project.progress_percentage) {
          ProjectService.updateProject(project.id, { progress_percentage: newProgress }).catch(console.error);
        }

        return finalProject;
      });
    } catch (error) {
      console.error('Error updating manual checkmark:', error);
      Alert.alert('Error', 'Failed to update work description status');
    }
  };

  const daysLeft = project?.deadline ? getDaysUntilDeadline() : 0;
  const approvedChangeOrdersTotal = changeOrders
    .filter(order => order.status === 'approved')
    .reduce((sum, order) => {
      const orderTotal = (order.steps || [])
        .filter(step => step.step_type === 'parent' && step.price)
        .reduce((s, step) => s + (step.price || 0), 0);
      return sum + orderTotal;
    }, 0);
  const totalWithChanges = (project?.total_budget || 0) + approvedChangeOrdersTotal;
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft <= 7 && daysLeft >= 0;

  // Check if all work titles and work descriptions are finished
  const areAllStepsFinished = () => {
    if (!project?.steps || project.steps.length === 0) {
      return false;
    }

    return project.steps.every(step => {
      // Check if parent step (work title) is finished
      if (step.status !== 'finished') {
        return false;
      }

      // Check if all child steps (work descriptions) are finished
      if (step.child_steps && step.child_steps.length > 0) {
        return step.child_steps.every(childStep => 
          childStep.status === 'finished' || childStep.manual_checkmark
        );
      }

      // If no child steps, parent step being finished is enough
      return true;
    });
  };

  const canCompleteProject = areAllStepsFinished() && userRole === 'admin' && project?.status !== 'completed';

  const handleUpdateProject = async () => {
    if (!project?.id || !editingProject) return;

    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    // Validate required fields
    if (!editProjectForm.title || !editProjectForm.category || selectedEditClients.length === 0 || !editProjectForm.start_date || !editProjectForm.deadline) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Build full address string for backward compatibility
      const fullAddress = `${editProjectForm.project_street}, ${editProjectForm.project_city}, ${editProjectForm.project_state} ${editProjectForm.project_zip}`;
      
      // Calculate total budget from work titles, general conditions, and supervision fee
      const workTitlesTotal = editWorkTitles.reduce((sum, wt) => {
        const quantity = parseFloat(wt.quantity) || 0;
        const unitPrice = parseFloat(wt.unit_price) || 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Calculate supervision fee
      const supervisionWeeks = parseFloat(editProjectForm.supervision_weeks) || 0;
      const supervisionRate = editProjectForm.supervision_type === 'full-time' ? 1450 : editProjectForm.supervision_type === 'part-time' ? 725 : 0;
      const supervisionFee = (supervisionWeeks > 0 && editProjectForm.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
      
      // Calculate general conditions
      const generalConditionsPercentageInput = editProjectForm.general_conditions_percentage.trim();
      const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
      const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
      
      const discount = parseFloat(editProjectForm.discount) || 0;
      const totalBudget = workTitlesTotal + generalConditions + supervisionFee - discount;

      // Build project update data
      const updateData: Partial<Project> = {
        title: editProjectForm.title,
        description: editProjectForm.description || '',
        category: editProjectForm.category,
        client_id: selectedEditClients[0]?.id || editProjectForm.client_id, // First client for backward compatibility
        client_name: selectedEditClients[0]?.name || editProjectForm.client_name, // First client name for backward compatibility
        client_ids: selectedEditClients.map(c => c.id), // Array of client IDs
        client_names: selectedEditClients.map(c => c.name), // Array of client names
        start_date: editProjectForm.start_date,
        deadline: editProjectForm.deadline,
        project_address: fullAddress,
        project_street: editProjectForm.project_street,
        project_city: editProjectForm.project_city,
        project_state: editProjectForm.project_state,
        project_zip: editProjectForm.project_zip,
        total_budget: totalBudget,
        project_description: editProjectForm.project_description || '',
      };

      if (discount > 0) {
        updateData.discount = discount;
      }

      // Update project
      await ProjectService.updateProject(project.id, updateData);

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        ...updateData,
      } : null);

      Alert.alert('Success', 'Project updated successfully');
      setShowEditModal(false);
      setEditingProject(null);
      setEditProjectForm({
        title: '',
        description: '',
        category: '',
        client_id: '',
        client_name: '',
        start_date: '',
        deadline: '',
        project_street: '',
        project_city: '',
        project_state: '',
        project_zip: '',
        discount: '',
        project_description: '',
        general_conditions_percentage: '18.5',
        supervision_type: 'part-time',
        supervision_weeks: '',
      });
      setEditWorkTitles([]);
      setSelectedEditClients([]);
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    }
  };

  const handleCompleteProject = async () => {
    if (!project?.id) return;

    // Only admin can edit projects
    if (userRole !== 'admin') {
      Alert.alert('Access Denied', 'Only administrators can edit projects.');
      return;
    }

    const doComplete = async () => {
      try {
        await ProjectService.updateProject(project.id, {
          status: 'completed',
          progress_percentage: 100,
        });

        setProject(prev => prev ? {
          ...prev,
          status: 'completed',
          progress_percentage: 100,
        } : null);

        if (Platform.OS === 'web') {
          alert('Project marked as completed');
          router.replace('/projects?tab=completed');
        } else {
          Alert.alert('Success', 'Project marked as completed', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/projects?tab=completed');
              }
            }
          ]);
        }
      } catch (error) {
        console.error('Error completing project:', error);
        if (Platform.OS === 'web') alert('Failed to complete project');
        else Alert.alert('Error', 'Failed to complete project');
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to mark this project as completed?');
      if (ok) await doComplete();
      return;
    }

    Alert.alert('Complete Project', 'Are you sure you want to mark this project as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', style: 'default', onPress: () => { void doComplete(); } },
    ]);
  };

  const StepCard = ({ step, isChild = false, parentStepId }: { step: ProjectStep; isChild?: boolean; parentStepId?: string }) => {
    const isExpanded = expandedSteps.has(step.id);
    const hasChildSteps = step.child_steps && step.child_steps.length > 0;
    
    // Dynamic border color based on status
    const getBorderColor = (status: string) => {
      switch (status) {
        case 'pending':
          return '#9ca3af'; // Grey for pending
        case 'in_progress':
          return '#f97316'; // Orange for in progress
        case 'finished':
          return '#22c55e'; // Green for finished
        default:
          return '#9ca3af'; // Default grey
      }
    };
    
    return (
      <View style={[
        styles.stepCard, 
        isChild && styles.childStepCard,
        { borderLeftColor: getBorderColor(step.status) }
      ]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepTitleContainer}>
            {/* Checkbox for both parent and child steps */}
            <TouchableOpacity
              style={[
                styles.stepCheckbox,
                (step.status === 'finished' || step.manual_checkmark) && styles.stepCheckboxChecked,
                userRole === 'client' && styles.stepCheckboxDisabled
              ]}
              onPress={() => {
                if (userRole !== 'client') {
                  if (isChild) {
                    handleToggleManualCheckmark(step.id, parentStepId!);
                  } else {
                    // Toggle parent step status between finished and pending
                    const newStatus = (step.status === 'finished' || step.manual_checkmark) ? 'pending' : 'finished';
                    handleUpdateStepStatus(step.id, newStatus as ProjectStep['status'], false);
                  }
                }
              }}
              disabled={userRole === 'client'}
            >
              {(step.status === 'finished' || step.manual_checkmark) ? (
                <Check size={16} color="#ffffff" />
              ) : null}
            </TouchableOpacity>
            <View style={styles.stepTitleAndBudget}>
              <Text style={[styles.stepName, isChild && styles.childStepName]}>{step.name}</Text>
              <View style={styles.stepBudgetInfo}>
                {/* Show price to PMs, Admins, and Clients */}
                {!isChild && (userRole === 'pm' || userRole === 'admin' || userRole === 'client') && step.price && (
                  <Text style={styles.stepPrice}>${step.price.toLocaleString()}</Text>
                )}
              </View>
            </View>
            {!isChild && hasChildSteps && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => toggleStepExpansion(step.id)}>
                {isExpanded ? (
                  <ChevronDown size={20} color="#6b7280" />
                ) : (
                  <ChevronRight size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.stepActions}>
          <View style={styles.statusButtons}>
            {['pending', 'in_progress', 'finished'].map((status) => {
              const getStatusStyle = () => {
                if (userRole === 'client') return styles.clientStatusButton;
                if (step.status === status) {
                  switch (status) {
                    case 'pending': return styles.pendingButton;
                    case 'in_progress': return styles.inProgressButton;
                    case 'finished': return styles.finishedButton;
                    default: return styles.activeStatusButton;
                  }
                }
                return styles.statusButton;
              };

              const getStatusTextStyle = () => {
                if (userRole === 'client') return styles.clientStatusButtonText;
                if (step.status === status) {
                  switch (status) {
                    case 'pending': return styles.pendingButtonText;
                    case 'in_progress': return styles.inProgressButtonText;
                    case 'finished': return styles.finishedButtonText;
                    default: return styles.activeStatusButtonText;
                  }
                }
                return styles.statusButtonText;
              };

              return (
                <TouchableOpacity
                  key={status}
                  style={getStatusStyle()}
                  onPress={() => {
                    if (userRole === 'admin' || userRole === 'pm') {
                      handleUpdateStepStatus(step.id, status as ProjectStep['status'], isChild, parentStepId);
                    }
                  }}
                  disabled={userRole === 'client'}
                  activeOpacity={0.7}>
                  <Text style={getStatusTextStyle()}>
                    {t(status)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {userRole === 'admin' && (
            <View style={styles.editDeleteButtons}>
              {!isChild && (
                <View style={styles.reorderButtons}>
                  <TouchableOpacity
                    style={styles.reorderButton}
                    onPress={() => moveStepUp(step.id)}>
                    <ChevronUp size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reorderButton}
                    onPress={() => moveStepDown(step.id)}>
                    <ChevronDown size={16} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.reorderButton, styles.moveToPositionButton]}
                    onPress={() => {
                      setStepToMove(step.id);
                      setShowMoveStepModal(true);
                    }}>
                    <Text style={styles.moveToPositionText}>Move</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => isChild ? handleEditChildStep(step, parentStepId!) : handleEditStep(step)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              {/* PM can only delete work descriptions, not parent steps */}
              {((userRole === 'admin' || userRole === 'pm') && isChild) && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteStep(step.id, isChild, parentStepId)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      {step.description && (
        <Text style={[styles.stepDescription, isChild && styles.childStepDescription]}>{step.description}</Text>
      )}
      
      {/* Notes Section for Parent Steps */}
      {step.step_type === 'parent' && step.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{step.notes}</Text>
        </View>
      )}
      
      {/* Action Buttons for Parent Steps */}
      {step.step_type === 'parent' && (userRole === 'admin' || userRole === 'pm') && (
        <View style={styles.parentStepActions}>
          <TouchableOpacity
            style={styles.addChildStepButton}
            onPress={() => {
              setSelectedParentStepId(step.id);
              setShowAddChildStepModal(true);
            }}>
            <Plus size={16} color="#236ecf" />
            <Text style={styles.addChildStepText}>Add Work Description</Text>
          </TouchableOpacity>
          
          {userRole === 'admin' && (
            <TouchableOpacity
              style={styles.editNotesButton}
              onPress={() => {
                setSelectedStepForNotes(step);
                setStepNotes(step.notes || '');
                setShowEditNotesModal(true);
              }}>
              <Text style={styles.editNotesText}>Edit Notes</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Child Steps - Only show when expanded */}
      {!isChild && hasChildSteps && isExpanded && (
        <View style={styles.childStepsContainer}>
          {step.child_steps?.map((childStep) => (
            <StepCard
              key={childStep.id}
              step={childStep}
              isChild={true}
              parentStepId={step.id}
            />
          ))}
        </View>
      )}
    </View>
  );
};


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <HamburgerMenu />
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{project?.title || 'Project Details'}</Text>
          {project?.title && (
            <Text style={styles.headerSubtitle}>Project Details</Text>
          )}
        </View>
        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.headerEditButton}
            onPress={() => {
              if (!project) return;
              // Load project data into edit form
              setEditingProject(project);
              // Calculate general conditions percentage from project data if available
              // If not available, calculate from total_budget and work titles
              let generalConditionsPercentage = '18.5';
              if (project.steps && project.steps.length > 0) {
                const workTitlesTotal = project.steps
                  .filter(step => step.step_type === 'parent' && step.price)
                  .reduce((sum, step) => sum + (step.price || 0), 0);
                if (workTitlesTotal > 0 && project.total_budget) {
                  // Try to reverse calculate the percentage
                  // This is approximate, but better than nothing
                  const estimatedGC = (project.total_budget - workTitlesTotal) / workTitlesTotal * 100;
                  if (estimatedGC > 0 && estimatedGC < 100) {
                    generalConditionsPercentage = estimatedGC.toFixed(1);
                  }
                }
              }

              // Load clients from project
              const projectClients: Array<{ id: string; name: string }> = [];
              if (project.client_ids && project.client_names && project.client_ids.length > 0) {
                // Multiple clients
                project.client_ids.forEach((id, index) => {
                  projectClients.push({
                    id,
                    name: project.client_names?.[index] || ''
                  });
                });
              } else if (project.client_id && project.client_name) {
                // Single client (backward compatibility)
                projectClients.push({
                  id: project.client_id,
                  name: project.client_name
                });
              }
              setSelectedEditClients(projectClients);

              setEditProjectForm({
                title: project.title || '',
                description: project.description || '',
                category: project.category || '',
                client_id: project.client_id || '',
                client_name: project.client_name || '',
                start_date: project.start_date || '',
                deadline: project.deadline || '',
                project_street: project.project_street || '',
                project_city: project.project_city || '',
                project_state: project.project_state || '',
                project_zip: project.project_zip || '',
                discount: project.discount?.toString() || '',
                project_description: project.project_description || '',
                general_conditions_percentage: generalConditionsPercentage,
                supervision_type: 'part-time' as 'full-time' | 'part-time' | 'none',
                supervision_weeks: '',
              });
              // Load work titles from steps
              if (project.steps && project.steps.length > 0) {
                const workTitlesFromSteps = project.steps
                  .filter(step => step.step_type === 'parent')
                  .map(step => ({
                    name: step.name,
                    description: step.description || '',
                    quantity: '1', // Default since steps don't have quantity
                    unit_price: step.price?.toString() || '0',
                    price: step.price?.toString() || '0',
                  }));
                setEditWorkTitles(workTitlesFromSteps);
              } else {
                setEditWorkTitles([]);
              }
              setShowEditModal(true);
            }}
          >
            <Pencil size={20} color="#236ecf" />
          </TouchableOpacity>
        )}
      </View>

      {/* Save Changes Bar - Shows when there are unsaved changes */}
      {hasUnsavedChanges && (userRole === 'admin' || userRole === 'pm') && (
        <View style={styles.saveChangesBar}>
          <Text style={styles.saveChangesText}>You have unsaved changes</Text>
          <TouchableOpacity
            style={[styles.saveChangesButton, saving && styles.saveChangesButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveChangesButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        scrollEventThrottle={16}
      >
        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Text style={styles.title}>{project?.title || 'Loading...'}</Text>
            <Text style={styles.category}>{t(project?.category || '')}</Text>
            <Text style={styles.description}>{project?.description || ''}</Text>
            
            {/* Client and PM Information */}
            <View style={styles.projectInfoSection}>
              <View style={styles.infoRow}>
                <User size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Client:</Text>
                <Text style={styles.infoValue}>{project?.client_name || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <User size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Project Manager:</Text>
                <Text style={styles.infoValue}>
                  {project?.assigned_pms && project.assigned_pms.length > 0 
                    ? (() => {
                        // Get PM names from IDs
                        const pmNames = project.assigned_pms
                          .map((pmId: string) => {
                            const pm = pms.find(p => p.id === pmId);
                            return pm ? pm.name : pmId;
                          })
                          .filter(Boolean);
                        
                        if (pmNames.length === 0) {
                          return project.assigned_pms.length > 1 
                      ? `${project.assigned_pms.length} PMs assigned`
                            : project.assigned_pms[0];
                        }
                        
                        return pmNames.length > 1 
                          ? `${pmNames.length} PMs: ${pmNames.join(', ')}`
                          : pmNames[0];
                      })()
                    : project?.manager_id || 'N/A'
                  }
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Timeline:</Text>
                <Text style={styles.infoValue}>
                  {project?.start_date ? formatDate(project.start_date) : 'N/A'} - {project?.deadline ? formatDate(project.deadline) : 'N/A'}
                </Text>
              </View>
            </View>
            
            {/* Budget Summary - Show to PM, Admin, Office, and Client */}
            {(userRole === 'pm' || userRole === 'admin' || userRole === 'office' || userRole === 'client') && (
              <View style={styles.budgetSection}>
                {userRole === 'client' ? (
                  // Client sees client-facing budget (from proposal) - shown as "Total Price"
                  <>
                    <Text style={styles.budgetLabel}>Total Price:</Text>
                    <Text style={styles.budgetAmount}>
                      ${(project?.client_budget || project?.total_budget || 0).toLocaleString()}
                    </Text>
                  </>
                ) : (
                  // PM, Admin, and Office see internal budget (real costs) - NOT client_budget
                  <>
                {userRole === 'pm' && project?.pm_budgets && user?.id && project.pm_budgets[user.id] ? (
                  // PM sees their own assigned budget
                  <>
                    <Text style={styles.budgetLabel}>Your Assigned Budget:</Text>
                    <Text style={styles.budgetAmount}>
                      ${project.pm_budgets[user.id].toLocaleString()}
                    </Text>
                  </>
                ) : (
                  // Admin and Office see full project budget
                  <>
                    {/* Admin only: Show Client Price vs Internal Budget */}
                    {userRole === 'admin' && project?.client_budget && (
                      <>
                        <Text style={styles.budgetLabel}>Client Price:</Text>
                        <Text style={[styles.budgetAmount, { color: '#059669' }]}>
                          ${(project?.client_budget || 0).toLocaleString()}
                        </Text>
                        <View style={[styles.stepBudgetBreakdown, { backgroundColor: '#ecfdf5', padding: 8, borderRadius: 6, marginTop: 4, marginBottom: 8 }]}>
                          <Text style={[styles.stepBudgetLabel, { color: '#059669', fontWeight: '600' }]}>Profit Margin:</Text>
                          <Text style={[styles.stepBudgetAmount, { color: '#059669', fontWeight: '700' }]}>
                            ${((project?.client_budget || 0) - (project?.total_budget || 0)).toLocaleString()}
                          </Text>
                        </View>
                      </>
                    )}
                    <Text style={styles.budgetLabel}>Total with Approved Changes:</Text>
                    <Text style={styles.budgetAmount}>
                      ${totalWithChanges.toLocaleString()}
                    </Text>
                    <View style={styles.stepBudgetBreakdown}>
                      <Text style={styles.stepBudgetLabel}>Base Project Budget (Internal):</Text>
                      <Text style={styles.stepBudgetAmount}>
                        ${(project?.total_budget || 0).toLocaleString()}
                      </Text>
                    </View>
                  </>
                )}
                {userRole !== 'pm' && (
                  <>
                    <View style={styles.stepBudgetBreakdown}>
                      <Text style={styles.stepBudgetLabel}>Approved Change Orders Total:</Text>
                      <Text style={styles.stepBudgetAmount}>
                        ${approvedChangeOrdersTotal.toLocaleString()}
                      </Text>
                    </View>
                    {project?.steps && project.steps.length > 0 && (
                      <View style={styles.stepBudgetBreakdown}>
                        <Text style={styles.stepBudgetLabel}>Step Budgets Total:</Text>
                        <Text style={styles.stepBudgetAmount}>
                          ${project?.steps
                            ?.filter(step => step.step_type === 'parent' && step.price)
                            ?.reduce((sum, step) => sum + (step.price || 0), 0)
                            ?.toLocaleString() || '0'}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                  </>
                )}
              </View>
            )}
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${project?.progress_percentage || 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{project?.progress_percentage || 0}%</Text>
          </View>

          {project?.client_name && (
            <View style={styles.clientInfo}>
              <Text style={styles.clientLabel}>Client:</Text>
              <Text style={styles.clientName}>{project?.client_name}</Text>
            </View>
          )}

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Calendar size={20} color="#236ecf" />
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{project?.start_date ? formatDate(project.start_date) : 'N/A'}</Text>
            </View>

            <View style={styles.detailCard}>
              <Clock size={20} color={isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#236ecf'} />
              <Text style={styles.detailLabel}>Deadline</Text>
              <Text style={[
                styles.detailValue,
                { color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#236ecf' }
              ]}>
                {project?.deadline ? formatDate(project.deadline) : 'N/A'}
              </Text>
            </View>
          </View>

          {project?.steps && project.steps.length > 0 && (
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Project Timeline</Text>
              <ProjectTimeline steps={project?.steps || []} showLabels={true} />
            </View>
          )}

            <View style={styles.stepsSection}>
            <View style={styles.stepsSectionHeader}>
              <Text style={styles.sectionTitle}>Work Titles</Text>
              {userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.addStepButton}
                  onPress={() => setShowAddStepModal(true)}>
                  <Plus size={16} color="#236ecf" />
                  <Text style={styles.addStepText}>Add Work Title</Text>
                </TouchableOpacity>
              )}
            </View>


            {project?.steps?.map((step) => (
              <View key={step.id}>
                <StepCard step={step} />
              </View>
            ))}
          </View>

          {/* Complete Project Button - Show when all work titles and descriptions are finished */}
          {canCompleteProject && (
            <View style={styles.completeProjectSection}>
              <TouchableOpacity
                style={styles.completeProjectButton}
                onPress={handleCompleteProject}
              >
                <CheckCircle2 size={24} color="#ffffff" />
                <Text style={styles.completeProjectButtonText}>Complete Project</Text>
              </TouchableOpacity>
              <Text style={styles.completeProjectHint}>
                All work titles and descriptions are finished. Click to mark this project as completed.
              </Text>
            </View>
          )}
        </View>

        {/* Approved Change Orders Summary */}
        {approvedChangeOrdersTotal > 0 && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Approved Change Orders</Text>
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#374151', fontWeight: '600' }}>
                Total Approved: ${approvedChangeOrdersTotal.toLocaleString()}
              </Text>
              {changeOrders
                .filter(o => o.status === 'approved')
                .map(o => {
                  const amount = (o.steps || [])
                    .filter(s => s.step_type === 'parent' && s.price)
                    .reduce((s, st) => s + (st.price || 0), 0);
                  const completionStatus = o.completion_status || 'pending';
                  const statusColor = getCompletionStatusColor(completionStatus);
                  return (
                    <View key={o.id} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 4, borderLeftColor: statusColor }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#1f2937', fontWeight: '700' }}>{o.title}</Text>
                          {o.description ? (
                            <Text style={{ color: '#6b7280', marginTop: 2 }}>{o.description}</Text>
                          ) : null}
                        </View>
                        <View style={{ backgroundColor: `${statusColor}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: statusColor, fontSize: 12, fontWeight: '600' }}>
                            {getCompletionStatusText(completionStatus)}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: '#374151', marginTop: 6, fontWeight: '600' }}>Amount: ${amount.toLocaleString()}</Text>
                      {/* Work Titles list styled like project work items */}
                      {(o.steps || []).filter(s => s.step_type === 'parent').map(parent => (
                        <View key={parent.id} style={styles.stepCard}>
                          <View style={styles.stepHeader}>
                            <View style={styles.stepTitleAndBudget}>
                              <Text style={styles.stepName}>{parent.name}</Text>
                              <View style={styles.stepBudgetInfo}>
                                {typeof parent.price === 'number' && (
                                  <Text style={styles.stepPrice}>${parent.price.toLocaleString()}</Text>
                                )}
                              </View>
                            </View>
                          </View>

                          {(parent.child_steps || []).map(child => (
                            <View key={child.id} style={styles.childStepCard}>
                              <View style={styles.stepTitleContainer}>
                                <Text style={styles.childStepName}>{child.name}</Text>
                              </View>
                              {child.description ? (
                                <Text style={styles.childStepDescription}>{child.description}</Text>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      ))}
                      <View style={{ marginTop: 8, gap: 4 }}>
                        <Text style={{ color: '#6b7280' }}>Requested: {o.requested_date ? new Date(o.requested_date).toLocaleDateString() : '-'}</Text>
                        <Text style={{ color: '#6b7280' }}>Requested by: {o.requested_by || '-'}</Text>
                        <Text style={{ color: '#6b7280' }}>Approved: {o.approved_at ? new Date(o.approved_at).toLocaleDateString() : '-'}</Text>
                        {o.approved_by ? <Text style={{ color: '#6b7280' }}>Approved by: {o.approved_by}</Text> : null}
                        <Text style={{ color: '#6b7280' }}>Items: {(o.steps || []).filter(s => s.step_type === 'parent').length}</Text>
                      </View>
                    </View>
                  );
                })}
            </View>
            <Text style={{ marginTop: 8, color: '#6b7280', fontStyle: 'italic' }}>Pending change orders are not included.</Text>
          </View>
        )}

        {/* Chat Section */}
        <View style={styles.chatSection}>
          <View style={styles.chatSectionHeader}>
            <MessageSquare size={20} color="#236ecf" />
            <Text style={styles.sectionTitle}>Project Chat</Text>
          </View>

          {commentsLoading ? (
            <View style={styles.loadingComments}>
              <ActivityIndicator size="small" color="#236ecf" />
              <Text style={styles.loadingCommentsText}>Loading messages...</Text>
            </View>
          ) : comments && comments.length > 0 ? (
            <View style={styles.chatMessages}>
              {comments.map((comment: any) => (
                <View key={comment.id} style={styles.chatMessage}>
                  <View style={styles.chatMessageHeader}>
                    <View style={styles.chatUserInfo}>
                      <View style={[styles.chatUserAvatar, { backgroundColor: getRoleColor(comment.user_role || 'unknown') }]}>
                        <Text style={styles.chatUserAvatarText}>
                          {comment.user_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <View style={styles.chatUserNameRow}>
                          <Text style={styles.chatUserName}>{comment.user_name}</Text>
                          <View style={[styles.chatRoleBadge, { backgroundColor: getRoleColor(comment.user_role || 'unknown') }]}>
                            <Text style={styles.chatRoleBadgeText}>
                              {(comment.user_role || 'user').toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.chatMessageDate}>{formatDate(comment.created_at)}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.chatMessageText}>{comment.comment}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyComments}>
              <MessageSquare size={48} color="#d1d5db" />
              <Text style={styles.emptyCommentsText}>No messages yet</Text>
              <Text style={styles.emptyCommentsSubtext}>Start the conversation</Text>
            </View>
          )}

          {(userRole === 'client' || userRole === 'pm' || userRole === 'admin' || userRole === 'office' || userRole === 'sales') && (
            <TouchableOpacity
              style={styles.chatInputButton}
              onPress={() => setShowCommentModal(true)}>
              <MessageSquare size={18} color="#ffffff" />
              <Text style={styles.chatInputButtonText}>Send Message</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* To-Do List Section */}
        {id && (
          <View style={styles.todoSection}>
            <TodoList
              projectId={id as string}
              canCreate={userRole === 'admin'}
              canEdit={userRole === 'admin' || userRole === 'pm'}
              canDelete={userRole === 'admin'}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Project Menu */}
      {id && (
        <View style={styles.bottomMenu}>
          <View style={styles.bottomMenuContainer}>
            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => id && router.push(`/(tabs)/project/${id}/schedule`)}>
              <Calendar size={24} color="#059669" />
              <Text style={styles.bottomMenuText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => id && router.push(`/(tabs)/project/${id}/materials`)}>
              <Package size={24} color="#f59e0b" />
              <Text style={styles.bottomMenuText}>Materials</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => id && router.push(`/(tabs)/change-order?projectId=${id}`)}>
              <FileText size={24} color="#8b5cf6" />
              <Text style={styles.bottomMenuText}>Change Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => id && router.push(`/(tabs)/project/${id}/daily-logs`)}>
              <Calendar size={24} color="#f59e0b" />
              <Text style={styles.bottomMenuText}>Daily Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => id && router.push(`/(tabs)/project/${id}/documents`)}>
              <Folder size={24} color="#059669" />
              <Text style={styles.bottomMenuText}>Documents</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomMenuItem}
              onPress={() => setShowProjectSettingsModal(true)}>
              <Settings size={24} color="#6b7280" />
              <Text style={styles.bottomMenuText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Work Title Selection Modal - Must be after Add Step Modal to appear on top */}
      <Modal
        visible={showWorkTitleSelectModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}>
        <View style={[styles.modalOverlay, { zIndex: 9999 }]}>
          <View style={[styles.categoryModal, { zIndex: 10000 }]}>
            <View style={styles.workTitleModalHeader}>
              <Text style={styles.workTitleModalTitle}>Select Work Title</Text>
              <TouchableOpacity onPress={() => {
                setShowWorkTitleSelectModal(false);
                setWorkTitleSearchQuery('');
                if (selectedWorkTitleFromList !== 'New') {
                  setSelectedWorkTitleFromList('');
                }
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search work titles..."
                value={workTitleSearchQuery}
                onChangeText={setWorkTitleSearchQuery}
                autoCapitalize="none"
              />
            </View>
            
            <ScrollView 
              style={styles.categoryList}
              contentContainerStyle={styles.categoryListContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {predefinedWorkTitles
                .filter(title => 
                  title.toLowerCase().includes(workTitleSearchQuery.toLowerCase())
                )
                .map((title) => (
                  <TouchableOpacity
                    key={title}
                    style={[
                      styles.categoryOption,
                      selectedWorkTitleFromList === title && styles.selectedCategory
                    ]}
                    onPress={() => {
                      if (title === 'New') {
                        setSelectedWorkTitleFromList('New');
                        setNewStep(prev => ({ ...prev, name: '' }));
                        setShowWorkTitleSelectModal(false);
                      } else {
                        setSelectedWorkTitleFromList(title);
                        setNewStep(prev => ({ ...prev, name: title }));
                        setShowWorkTitleSelectModal(false);
                      }
                      setWorkTitleSearchQuery('');
                    }}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedWorkTitleFromList === title && styles.selectedCategoryText
                    ]}>
                      {title}
                    </Text>
                    {selectedWorkTitleFromList === title && title !== 'New' && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Step Modal */}
      <Modal
        visible={showAddStepModal && !showWorkTitleSelectModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addStep')}</Text>
            <TouchableOpacity onPress={() => {
              setShowAddStepModal(false);
              setNewStep({ name: '', description: '', price: '' });
              setSelectedWorkTitleFromList('');
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Title *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowWorkTitleSelectModal(true)}
              >
                <Text style={[styles.inputText, !newStep.name && styles.placeholderText]}>
                  {newStep.name || 'Select Work Title *'}
                </Text>
              </TouchableOpacity>
              {selectedWorkTitleFromList === 'New' && (
              <TextInput
                style={styles.input}
                  placeholder="Enter custom work title *"
                value={newStep.name}
                onChangeText={(text) => setNewStep(prev => ({ ...prev, name: text }))}
              />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newStep.description}
                onChangeText={(text) => setNewStep(prev => ({ ...prev, description: text }))}
                placeholder="Describe the work..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={newStep.price}
                onChangeText={(text) => setNewStep(prev => ({ ...prev, price: text }))}
                placeholder="e.g. 50000"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddStep}>
              <Text style={styles.submitButtonText}>{t('add')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Child Step Modal */}
      <Modal
        visible={showAddChildStepModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Work Description</Text>
            <TouchableOpacity onPress={() => setShowAddChildStepModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Description</Text>
              <TextInput
                style={styles.input}
                value={newChildStep.name}
                onChangeText={(text) => setNewChildStep(prev => ({ ...prev, name: text }))}
                placeholder="e.g. Site Preparation"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newChildStep.description}
                onChangeText={(text) => setNewChildStep(prev => ({ ...prev, description: text }))}
                placeholder="Describe the work..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!selectedParentStepId || !newChildStep.name || newChildStep.name.trim() === '') && styles.submitButtonDisabled
              ]} 
              onPress={async () => {
                console.log('Add Work Description button pressed', { selectedParentStepId, newChildStep, projectId: project?.id });
                if (!selectedParentStepId) {
                  console.error('selectedParentStepId is null');
                  Alert.alert('Error', 'Parent step not selected');
                  return;
                }
                if (!newChildStep.name || newChildStep.name.trim() === '') {
                  console.error('newChildStep.name is empty');
                  Alert.alert('Error', 'Please enter work description name');
                  return;
                }
                if (!project?.id) {
                  console.error('project.id is missing');
                  Alert.alert('Error', 'Project ID is missing');
                  return;
                }
                try {
                  console.log('Calling handleAddChildStep...');
                  await handleAddChildStep(selectedParentStepId);
                } catch (error) {
                  console.error('Error in onPress handler:', error);
                  Alert.alert('Error', `Failed to add work description: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
              disabled={!selectedParentStepId || !newChildStep.name || newChildStep.name.trim() === ''}>
              <Text style={styles.submitButtonText}>Add Work Description</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Notes Modal */}
      <Modal
        visible={showEditNotesModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Notes</Text>
            <TouchableOpacity onPress={() => setShowEditNotesModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={stepNotes}
                onChangeText={setStepNotes}
                placeholder="Add notes for this step..."
                multiline
                numberOfLines={5}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={() => selectedStepForNotes && handleUpdateStepNotes(selectedStepForNotes.id, stepNotes)}>
              <Text style={styles.submitButtonText}>Save Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Step Modal */}
      <Modal
        visible={showEditStepModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Step</Text>
            <TouchableOpacity onPress={() => setShowEditStepModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Step Name</Text>
              <TextInput
                style={styles.input}
                value={editStep.name}
                onChangeText={(text) => setEditStep(prev => ({ ...prev, name: text }))}
                placeholder="e.g. Electrical Work"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editStep.description}
                onChangeText={(text) => setEditStep(prev => ({ ...prev, description: text }))}
                placeholder="Step description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={editStep.price}
                onChangeText={(text) => setEditStep(prev => ({ ...prev, price: text }))}
                placeholder="e.g. 50000"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateStep}>
              <Text style={styles.submitButtonText}>Update Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Child Step Modal */}
      <Modal
        visible={showEditChildStepModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Work Description</Text>
            <TouchableOpacity onPress={() => setShowEditChildStepModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Description</Text>
              <TextInput
                style={styles.input}
                value={editChildStep.name}
                onChangeText={(text) => setEditChildStep(prev => ({ ...prev, name: text }))}
                placeholder="e.g. Site Preparation"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editChildStep.description}
                onChangeText={(text) => setEditChildStep(prev => ({ ...prev, description: text }))}
                placeholder="Work description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateChildStep}>
              <Text style={styles.submitButtonText}>Update Work Description</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Message</Text>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Message</Text>
              <Text style={styles.mentionHint}>Tip: Type @ to mention someone</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newComment}
                onChangeText={handleCommentChange}
                placeholder="Type your message here... Use @ to mention users"
                multiline
                numberOfLines={5}
              />
              
              {showMentionSuggestions && (
                <View style={styles.mentionSuggestionsContainer}>
                  <Text style={styles.mentionSuggestionsTitle}>Mention:</Text>
                  <ScrollView style={styles.mentionSuggestions} keyboardShouldPersistTaps="handled">
                    {mentionSuggestions.map(user => (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.mentionSuggestion}
                        onPress={() => handleMentionSelect(user.name)}>
                        <View style={[styles.mentionAvatar, { backgroundColor: getRoleColor(user.role) }]}>
                          <Text style={styles.mentionAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.mentionInfo}>
                          <Text style={styles.mentionName}>{user.name}</Text>
                          <View style={[styles.mentionRoleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                            <Text style={styles.mentionRoleText}>{user.role.toUpperCase()}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
              <MessageSquare size={18} color="#ffffff" />
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PM Assignment Modal */}
      <Modal
        visible={showPMAssignmentModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Project Managers</Text>
            <TouchableOpacity onPress={() => {
              setShowPMAssignmentModal(false);
              setSelectedPMs([]);
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Project Managers</Text>
              <Text style={styles.helperText}>You can assign multiple PMs to this project</Text>
              
              {/* Currently Assigned PMs */}
              {project?.assigned_pms && project.assigned_pms.length > 0 && (
                <View style={styles.assignedSection}>
                  <Text style={styles.assignedSectionTitle}>Currently Assigned:</Text>
                  {project.assigned_pms.map((pmId) => {
                    const pm = pms.find(p => p.id === pmId);
                    if (!pm) return null;
                    return (
                      <View key={pmId} style={styles.assignedPMCard}>
                        <View style={styles.assignedPMInfo}>
                          <Text style={styles.assignedPMName}>{pm.name}</Text>
                          <Text style={styles.assignedPMEmail}>{pm.email}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removePMButton}
                          onPress={() => handleTogglePM(pmId)}>
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Available PMs */}
              <View style={styles.pmList}>
                {pms.map((pm) => {
                  const isSelected = selectedPMs.includes(pm.id);
                  const isCurrentlyAssigned = project?.assigned_pms?.includes(pm.id);
                  
                  return (
                    <TouchableOpacity
                      key={pm.id}
                      style={[
                        styles.pmOption,
                        isSelected && styles.selectedPMOption,
                        isCurrentlyAssigned && !isSelected && styles.currentlyAssignedPM,
                      ]}
                      onPress={() => handleTogglePM(pm.id)}>
                      <View style={styles.pmInfo}>
                        <Text style={styles.pmName}>{pm.name}</Text>
                        <Text style={styles.pmEmail}>{pm.email}</Text>
                        {isCurrentlyAssigned && (
                          <Text style={styles.currentlyAssignedText}>Currently assigned</Text>
                        )}
                      </View>
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected
                      ]}>
                        {isSelected && (
                          <Check size={16} color="#ffffff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowPMAssignmentModal(false);
                setSelectedPMs([]);
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSavePMAssignment}>
              <Text style={styles.confirmButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Client Assignment Modal */}
      <Modal
        visible={showClientAssignmentModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Client</Text>
            <TouchableOpacity onPress={() => setShowClientAssignmentModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Client</Text>
              <ScrollView style={styles.clientList} showsVerticalScrollIndicator={false}>
                {clients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={[
                      styles.clientOption,
                      selectedClient === client.id && styles.selectedClientOption
                    ]}
                    onPress={() => setSelectedClient(client.id)}>
                    <View style={styles.clientInfo}>
                      <Text style={[
                        styles.clientName,
                        selectedClient === client.id && styles.selectedClientText
                      ]}>
                        {client.name}
                      </Text>
                      <Text style={[
                        styles.clientCompany,
                        selectedClient === client.id && styles.selectedClientText
                      ]}>
                        {client.email}
                      </Text>
                      <Text style={[
                        styles.clientEmail,
                        selectedClient === client.id && styles.selectedClientText
                      ]}>
                        {client.email}
                      </Text>
                    </View>
                    {selectedClient === client.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowClientAssignmentModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                !selectedClient && styles.disabledButton
              ]}
              onPress={handleAssignClient}
              disabled={!selectedClient}>
              <Text style={[
                styles.confirmButtonText,
                !selectedClient && styles.disabledButtonText
              ]}>
                Assign Client
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={cancelDelete}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>Silmek istediğinizden emin misiniz?</Text>
            <Text style={styles.deleteMessage}>
              Bu adımı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelDeleteText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Project Settings Modal */}
      <Modal
        visible={showProjectSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Project Settings</Text>
            <TouchableOpacity onPress={() => setShowProjectSettingsModal(false)}>
              <X size={24} color="#ffcc00" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {/* Project Actions */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Project Actions</Text>
              
              {/* Only show Assign PM for admin and pm roles, not for sales */}
              {(userRole === 'admin' || userRole === 'pm') && (
                <TouchableOpacity
                  style={styles.settingsItem}
                  onPress={() => {
                    setShowProjectSettingsModal(false);
                    setShowPMAssignmentModal(true);
                  }}>
                  <View style={styles.settingsItemIcon}>
                    <User size={24} color="#236ecf" />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>Assign Project Manager</Text>
                    <Text style={styles.settingsItemDescription}>Assign or change project manager</Text>
                  </View>
                  <ArrowRight size={20} color="#6b7280" />
                </TouchableOpacity>
              )}

              {/* Only admin and sales can assign clients, not clients themselves */}
              {(userRole === 'admin' || userRole === 'sales') && (
                <TouchableOpacity
                  style={styles.settingsItem}
                  onPress={() => {
                    setShowProjectSettingsModal(false);
                    setShowClientAssignmentModal(true);
                  }}>
                  <View style={styles.settingsItemIcon}>
                    <User size={24} color="#10b981" />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={styles.settingsItemTitle}>Assign Client</Text>
                    <Text style={styles.settingsItemDescription}>Assign or change project client</Text>
                  </View>
                  <ArrowRight size={20} color="#6b7280" />
                </TouchableOpacity>
              )}

              {userRole === 'admin' && (
                <TouchableOpacity
                  style={[styles.settingsItem, styles.dangerItem]}
                  onPress={() => {
                    setShowProjectSettingsModal(false);
                    setShowDeleteProjectModal(true);
                  }}>
                  <View style={[styles.settingsItemIcon, styles.dangerIcon]}>
                    <Trash2 size={24} color="#ef4444" />
                  </View>
                  <View style={styles.settingsItemContent}>
                    <Text style={[styles.settingsItemTitle, styles.dangerText]}>Delete Project</Text>
                    <Text style={[styles.settingsItemDescription, styles.dangerText]}>Permanently delete this project</Text>
                  </View>
                  <ArrowRight size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Project Information */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Project Information</Text>
              
              <View style={styles.infoItem}>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{project?.status}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Progress:</Text>
                <Text style={styles.infoValue}>{project?.progress_percentage}%</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Created:</Text>
                <Text style={styles.infoValue}>{project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        visible={showDeleteProjectModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDeleteProjectModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>Are you sure you want to delete this project?</Text>
            <Text style={styles.deleteMessage}>
              "{project?.title}" will be permanently deleted. This action cannot be undone.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={() => setShowDeleteProjectModal(false)}>
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={async () => {
                  if (!project?.id) return;
                  try {
                    await ProjectService.deleteProject(project.id);
                    setShowDeleteProjectModal(false);
                    // Navigate to projects page immediately after deletion
                    router.replace('/(tabs)/projects');
                  } catch (error) {
                    console.error('Error deleting project:', error);
                    setShowDeleteProjectModal(false);
                    Alert.alert('Error', 'Failed to delete project');
                  }
                }}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Project Success Modal */}
      <Modal
        visible={showDeleteProjectSuccessModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Project Deleted</Text>
            <Text style={styles.successMessage}>
              The project has been successfully deleted.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowDeleteProjectSuccessModal(false);
                // Navigate to projects page
                router.replace('/(tabs)/projects');
              }}>
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Project</Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEditingProject(null);
              setEditProjectForm({
                title: '',
                description: '',
                category: '',
                client_id: '',
                client_name: '',
                start_date: '',
                deadline: '',
                project_street: '',
                project_city: '',
                project_state: '',
                project_zip: '',
                discount: '',
                project_description: '',
                general_conditions_percentage: '18.5',
                supervision_type: 'part-time',
                supervision_weeks: '',
              });
              setEditWorkTitles([]);
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter project title"
                value={editProjectForm.title}
                onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, title: text }))}
              />
            </View>

            {(userRole === 'admin' || userRole === 'sales') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Internal Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter internal notes (optional)"
                  value={editProjectForm.description}
                  onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEditCategoryModal(true)}
              >
                <Text style={[styles.inputText, !editProjectForm.category && styles.placeholderText]}>
                  {editProjectForm.category || 'Select category'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clients *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowClientSelectModal(true)}
              >
                <Text style={[styles.inputText, selectedEditClients.length === 0 && styles.placeholderText]}>
                  {selectedEditClients.length > 0 
                    ? selectedEditClients.map(c => c.name).join(', ')
                    : 'Select Clients *'}
                </Text>
              </TouchableOpacity>
              {selectedEditClients.length > 0 && (
                <View style={styles.selectedClientsList}>
                  {selectedEditClients.map((client, index) => (
                    <View key={client.id} style={styles.selectedClientTag}>
                      <Text style={styles.selectedClientTagText}>{client.name}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newSelected = selectedEditClients.filter((_, i) => i !== index);
                          setSelectedEditClients(newSelected);
                          if (newSelected.length > 0) {
                            setEditProjectForm(prev => ({
                              ...prev,
                              client_id: newSelected[0].id,
                              client_name: newSelected[0].name
                            }));
                          } else {
                            setEditProjectForm(prev => ({
                              ...prev,
                              client_id: '',
                              client_name: ''
                            }));
                          }
                        }}
                      >
                        <X size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={editProjectForm.start_date}
                  onChange={(e) => setEditProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    marginTop: '8px',
                    backgroundColor: '#ffffff',
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowEditStartDatePicker(true)}
                  >
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.datePickerText}>
                      {editProjectForm.start_date || 'Select Start Date'}
                    </Text>
                  </TouchableOpacity>
                  {showEditStartDatePicker && (
                    <DateTimePicker
                      value={editProjectForm.start_date ? new Date(editProjectForm.start_date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowEditStartDatePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setEditProjectForm(prev => ({ ...prev, start_date: formattedDate }));
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deadline *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={editProjectForm.deadline}
                  onChange={(e) => setEditProjectForm(prev => ({ ...prev, deadline: e.target.value }))}
                  min={editProjectForm.start_date || new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    marginTop: '8px',
                    backgroundColor: '#ffffff',
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowEditDeadlinePicker(true)}
                  >
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.datePickerText}>
                      {editProjectForm.deadline || 'Select Deadline'}
                    </Text>
                  </TouchableOpacity>
                  {showEditDeadlinePicker && (
                    <DateTimePicker
                      value={editProjectForm.deadline ? new Date(editProjectForm.deadline) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={editProjectForm.start_date ? new Date(editProjectForm.start_date) : new Date()}
                      onChange={(event, selectedDate) => {
                        setShowEditDeadlinePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setEditProjectForm(prev => ({ ...prev, deadline: formattedDate }));
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter street address"
                value={editProjectForm.project_street}
                onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, project_street: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                value={editProjectForm.project_city}
                onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, project_city: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter state"
                value={editProjectForm.project_state}
                onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, project_state: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ZIP code"
                value={editProjectForm.project_zip}
                onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, project_zip: text }))}
                keyboardType="numeric"
              />
            </View>

            {/* Work Titles Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Titles</Text>
              
              {/* Work Titles List */}
              {editWorkTitles.length > 0 && (
                <View style={styles.workTitlesList}>
                  {editWorkTitles.map((workTitle, index) => (
                    <View key={index} style={styles.workTitleItem}>
                      <View style={styles.workTitleInfo}>
                        <Text style={styles.workTitleName}>{workTitle.name}</Text>
                        {workTitle.description && (
                          <Text style={styles.workTitleDescription}>{workTitle.description}</Text>
                        )}
                        <View style={styles.workTitleDetails}>
                          <Text style={styles.workTitleDetailText}>
                            Qty: {workTitle.quantity}
                          </Text>
                          <Text style={styles.workTitleDetailText}>
                            Unit Price: ${parseFloat(workTitle.unit_price || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                          <Text style={styles.workTitlePrice}>
                            Total: ${parseFloat(workTitle.price || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeWorkTitleButton}
                        onPress={() => {
                          const newWorkTitles = editWorkTitles.filter((_, i) => i !== index);
                          setEditWorkTitles(newWorkTitles);
                        }}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Add Work Title Form */}
              {editingWorkTitleIndex === null && (
                <View style={styles.addWorkTitleForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Work Title *</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowEditWorkTitleModal(true)}
                    >
                      <Text style={[styles.inputText, !newEditWorkTitle.name && styles.placeholderText]}>
                        {newEditWorkTitle.name || 'Select Work Title *'}
                      </Text>
                    </TouchableOpacity>
                    {selectedEditWorkTitleFromList === 'New' && (
                      <TextInput
                        style={styles.input}
                        placeholder="Enter custom work title *"
                        value={newEditWorkTitle.name}
                        onChangeText={(text) => setNewEditWorkTitle(prev => ({ ...prev, name: text }))}
                      />
                    )}
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Work Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter work description"
                      value={newEditWorkTitle.description}
                      onChangeText={(text) => setNewEditWorkTitle(prev => ({ ...prev, description: text }))}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                  <View style={styles.quantityUnitRow}>
                    <View style={styles.quantityInputContainer}>
                      <Text style={styles.label}>Qty/Unit *</Text>
                      {Platform.OS === 'web' ? (
                        <input
                          type="number"
                          placeholder="0"
                          value={newEditWorkTitle.quantity}
                          onChange={(e) => {
                            const text = e.target.value;
                            setNewEditWorkTitle(prev => {
                              const quantity = parseFloat(text) || 0;
                              const unitPrice = parseFloat(prev.unit_price) || 0;
                              const calculatedPrice = (quantity * unitPrice).toString();
                              return { ...prev, quantity: text, price: calculatedPrice };
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: 12,
                            fontSize: 16,
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 8,
                            backgroundColor: '#ffffff',
                          }}
                          className="no-spinner"
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      ) : (
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          value={newEditWorkTitle.quantity}
                          onChangeText={(text) => {
                            setNewEditWorkTitle(prev => {
                              const quantity = parseFloat(text) || 0;
                              const unitPrice = parseFloat(prev.unit_price) || 0;
                              const calculatedPrice = (quantity * unitPrice).toString();
                              return { ...prev, quantity: text, price: calculatedPrice };
                            });
                          }}
                          keyboardType="numeric"
                        />
                      )}
                    </View>
                  </View>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceLabel}>$</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Unit Price *"
                        value={newEditWorkTitle.unit_price}
                        onChange={(e) => {
                          const text = e.target.value;
                          setNewEditWorkTitle(prev => {
                            const quantity = parseFloat(prev.quantity) || 0;
                            const unitPrice = parseFloat(text) || 0;
                            const calculatedPrice = (quantity * unitPrice).toString();
                            return { ...prev, unit_price: text, price: calculatedPrice };
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: 12,
                          fontSize: 16,
                          borderWidth: 1,
                          borderColor: '#d1d5db',
                          borderRadius: 8,
                          backgroundColor: '#ffffff',
                        }}
                        className="no-spinner"
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    ) : (
                      <TextInput
                        style={[styles.input, styles.priceInput]}
                        placeholder="Unit Price *"
                        value={newEditWorkTitle.unit_price}
                        onChangeText={(text) => {
                          setNewEditWorkTitle(prev => {
                            const quantity = parseFloat(prev.quantity) || 0;
                            const unitPrice = parseFloat(text) || 0;
                            const calculatedPrice = (quantity * unitPrice).toString();
                            return { ...prev, unit_price: text, price: calculatedPrice };
                          });
                        }}
                        keyboardType="numeric"
                      />
                    )}
                    <TouchableOpacity
                      style={styles.addWorkTitleButton}
                      onPress={() => {
                        if (!newEditWorkTitle.name || !newEditWorkTitle.quantity || !newEditWorkTitle.unit_price) {
                          Alert.alert('Error', 'Please fill in all required fields');
                          return;
                        }
                        setEditWorkTitles([...editWorkTitles, { ...newEditWorkTitle }]);
                        setNewEditWorkTitle({ name: '', description: '', quantity: '', unit_price: '', price: '' });
                        setSelectedEditWorkTitleFromList('');
                      }}
                    >
                      <Plus size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  {newEditWorkTitle.quantity && newEditWorkTitle.unit_price && (
                    <View style={styles.calculatedPriceContainer}>
                      <Text style={styles.calculatedPriceLabel}>Price (Qty × Unit Price):</Text>
                      <Text style={styles.calculatedPriceValue}>
                        ${(parseFloat(newEditWorkTitle.quantity || '0') * parseFloat(newEditWorkTitle.unit_price || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>General Conditions</Text>
              <View style={styles.percentageInputRow}>
                {Platform.OS === 'web' ? (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="18.5"
                    value={editProjectForm.general_conditions_percentage}
                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, general_conditions_percentage: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: 12,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                    }}
                    className="no-spinner"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                ) : (
                  <TextInput
                    style={[styles.input, styles.percentageInput]}
                    placeholder="18.5"
                    value={editProjectForm.general_conditions_percentage}
                    onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, general_conditions_percentage: text }))}
                    keyboardType="numeric"
                  />
                )}
                <Text style={styles.percentageLabel}>%</Text>
              </View>
              {(() => {
                const currentWorkTitleTotal = (() => {
                  const quantity = parseFloat(newEditWorkTitle.quantity) || 0;
                  const unitPrice = parseFloat(newEditWorkTitle.unit_price) || 0;
                  if (quantity > 0 && unitPrice > 0) {
                    return quantity * unitPrice;
                  }
                  return 0;
                })();
                const workTitlesTotal = editWorkTitles.reduce((sum, workTitle) => {
                  const quantity = parseFloat(workTitle.quantity) || 0;
                  const unitPrice = parseFloat(workTitle.unit_price) || 0;
                  return sum + (quantity * unitPrice);
                }, 0);
                const totalWorkTitles = workTitlesTotal + currentWorkTitleTotal;
                const supervisionWeeks = parseFloat(editProjectForm.supervision_weeks) || 0;
                const supervisionRate = editProjectForm.supervision_type === 'full-time' ? 1450 : editProjectForm.supervision_type === 'part-time' ? 725 : 0;
                const supervisionFee = (supervisionWeeks > 0 && editProjectForm.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
                const discount = parseFloat(editProjectForm.discount) || 0;
                const generalConditionsPercentageInput = editProjectForm.general_conditions_percentage.trim();
                const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
                const generalConditionsAmount = ((totalWorkTitles + supervisionFee) * generalConditionsPercentage) / 100;
                return (
                  <View style={styles.calculatedAmount}>
                    <Text style={styles.calculatedAmountLabel}>Calculated Amount:</Text>
                    <Text style={styles.calculatedAmountValue}>
                      ${generalConditionsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })()}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Supervision Type</Text>
              <View style={styles.categoryList}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    editProjectForm.supervision_type === 'none' && styles.selectedCategory
                  ]}
                  onPress={() => setEditProjectForm(prev => ({ ...prev, supervision_type: 'none', supervision_weeks: '' }))}
                >
                  <Text style={[
                    styles.categoryText,
                    editProjectForm.supervision_type === 'none' && styles.selectedCategoryText
                  ]}>
                    None
                  </Text>
                  {editProjectForm.supervision_type === 'none' && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    editProjectForm.supervision_type === 'full-time' && styles.selectedCategory
                  ]}
                  onPress={() => setEditProjectForm(prev => ({ ...prev, supervision_type: 'full-time' }))}
                >
                  <Text style={[
                    styles.categoryText,
                    editProjectForm.supervision_type === 'full-time' && styles.selectedCategoryText
                  ]}>
                    Full-Time ($1,450/week)
                  </Text>
                  {editProjectForm.supervision_type === 'full-time' && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    editProjectForm.supervision_type === 'part-time' && styles.selectedCategory
                  ]}
                  onPress={() => setEditProjectForm(prev => ({ ...prev, supervision_type: 'part-time' }))}
                >
                  <Text style={[
                    styles.categoryText,
                    editProjectForm.supervision_type === 'part-time' && styles.selectedCategoryText
                  ]}>
                    Part-Time ($725/week)
                  </Text>
                  {editProjectForm.supervision_type === 'part-time' && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {editProjectForm.supervision_type !== 'none' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Weeks *</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="number"
                    placeholder="Enter number of weeks"
                    value={editProjectForm.supervision_weeks}
                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, supervision_weeks: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: 12,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                    }}
                    className="no-spinner"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter number of weeks"
                    value={editProjectForm.supervision_weeks}
                    onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, supervision_weeks: text }))}
                    keyboardType="numeric"
                  />
                )}
                {editProjectForm.supervision_weeks && parseFloat(editProjectForm.supervision_weeks) > 0 && (
                  <View style={styles.calculatedAmount}>
                    <Text style={styles.calculatedAmountLabel}>Supervision Fee:</Text>
                    <Text style={styles.calculatedAmountValue}>
                      ${((editProjectForm.supervision_type === 'full-time' ? 1450 : editProjectForm.supervision_type === 'part-time' ? 725 : 0) * parseFloat(editProjectForm.supervision_weeks)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Discount</Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.priceLabel}>$</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter discount amount"
                    value={editProjectForm.discount}
                    onChange={(e) => setEditProjectForm(prev => ({ ...prev, discount: e.target.value }))}
                    style={{
                      flex: 1,
                      padding: 12,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                    }}
                    className="no-spinner"
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                ) : (
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    placeholder="Enter discount amount"
                    value={editProjectForm.discount}
                    onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, discount: text }))}
                    keyboardType="numeric"
                  />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter project description or notes"
                value={editProjectForm.project_description}
                onChangeText={(text) => setEditProjectForm(prev => ({ ...prev, project_description: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Budget</Text>
              <TextInput
                style={[styles.input, styles.totalBudgetInput]}
                placeholder="Auto-calculated from work titles, general conditions, supervision fee, and discount"
                value={(() => {
                  const workTitlesTotal = editWorkTitles.reduce((sum, wt) => {
                    const quantity = parseFloat(wt.quantity) || 0;
                    const unitPrice = parseFloat(wt.unit_price) || 0;
                    return sum + (quantity * unitPrice);
                  }, 0);
                  const currentWorkTitleTotal = (() => {
                    const quantity = parseFloat(newEditWorkTitle.quantity) || 0;
                    const unitPrice = parseFloat(newEditWorkTitle.unit_price) || 0;
                    return quantity * unitPrice;
                  })();
                  const totalWorkTitles = workTitlesTotal + currentWorkTitleTotal;
                  const supervisionWeeks = parseFloat(editProjectForm.supervision_weeks) || 0;
                  const supervisionRate = editProjectForm.supervision_type === 'full-time' ? 1450 : editProjectForm.supervision_type === 'part-time' ? 725 : 0;
                  const supervisionFee = (supervisionWeeks > 0 && editProjectForm.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
                  const generalConditionsPercentageInput = editProjectForm.general_conditions_percentage.trim();
                  const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
                  const generalConditions = ((totalWorkTitles + supervisionFee) * generalConditionsPercentage) / 100;
                  const discount = parseFloat(editProjectForm.discount) || 0;
                  const total = totalWorkTitles + generalConditions + supervisionFee - discount;
                  return total > 0 ? `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
                })()}
                editable={false}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateProject}>
              <Text style={styles.submitButtonText}>Update Project</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Client Selection Modal for Edit Project */}
      <Modal
        visible={showClientSelectModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}>
        <View style={[styles.modalOverlay, { zIndex: 9999 }]}>
          <View style={[styles.categoryModal, { zIndex: 10000 }]}>
            <View style={styles.workTitleModalHeader}>
              <Text style={styles.workTitleModalTitle}>Select Clients</Text>
              <TouchableOpacity onPress={() => {
                setShowClientSelectModal(false);
                setClientSearchQuery('');
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search clients..."
                value={clientSearchQuery}
                onChangeText={setClientSearchQuery}
              />
            </View>

            <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={true}>
              {/* Existing Clients - Filtered and sorted */}
              {clients
                .filter(client => 
                  client.name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                  client.email?.toLowerCase().includes(clientSearchQuery.toLowerCase())
                )
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map((client) => {
                  const isSelected = selectedEditClients.some(c => c.id === client.id);
                  return (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.categoryOption,
                        isSelected && styles.selectedCategory
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          // Remove client
                          const newSelected = selectedEditClients.filter(c => c.id !== client.id);
                          setSelectedEditClients(newSelected);
                          if (newSelected.length > 0) {
                            setEditProjectForm(prev => ({
                              ...prev,
                              client_id: newSelected[0].id,
                              client_name: newSelected[0].name
                            }));
                          } else {
                            setEditProjectForm(prev => ({
                              ...prev,
                              client_id: '',
                              client_name: ''
                            }));
                          }
                        } else {
                          // Add client
                          const newSelected = [...selectedEditClients, { id: client.id, name: client.name }];
                          setSelectedEditClients(newSelected);
                          setEditProjectForm(prev => ({
                            ...prev,
                            client_id: newSelected[0].id,
                            client_name: newSelected[0].name
                          }));
                        }
                      }}
                    >
                      <View style={styles.clientOptionContent}>
                        <View style={styles.clientInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[
                              styles.checkbox,
                              isSelected && styles.checkboxChecked
                            ]}>
                              {isSelected && <Check size={16} color="#ffffff" />}
                            </View>
                            <Text style={[
                              styles.categoryText,
                              isSelected && styles.selectedCategoryText
                            ]}>
                              {client.name}
                            </Text>
                          </View>
                          {client.email && (
                            <Text style={styles.clientEmail}>
                              {client.email}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.doneButton, selectedEditClients.length === 0 && styles.doneButtonDisabled]}
              onPress={() => {
                if (selectedEditClients.length > 0) {
                  setShowClientSelectModal(false);
                  setClientSearchQuery('');
                }
              }}
              disabled={selectedEditClients.length === 0}
            >
              <Text style={[styles.doneButtonText, selectedEditClients.length === 0 && styles.doneButtonTextDisabled]}>
                Done ({selectedEditClients.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Move Step to Position Modal */}
      <Modal
        visible={showMoveStepModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.moveStepModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Move Work Title</Text>
              <TouchableOpacity onPress={() => {
                setShowMoveStepModal(false);
                setStepToMove(null);
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.label}>Select new position:</Text>
              <ScrollView style={styles.positionList}>
                {project?.steps && project.steps
                  .filter(step => step.step_type === 'parent')
                  .map((step, index) => {
                    const currentStepIndex = project.steps?.findIndex(s => s.id === stepToMove) ?? -1;
                    const isCurrentPosition = currentStepIndex === index;
                    return (
                      <TouchableOpacity
                        key={step.id}
                        style={[
                          styles.positionOption,
                          isCurrentPosition && styles.currentPositionOption
                        ]}
                        onPress={() => {
                          if (stepToMove && !isCurrentPosition) {
                            moveStepToPosition(stepToMove, index);
                            setShowMoveStepModal(false);
                            setStepToMove(null);
                          }
                        }}
                        disabled={isCurrentPosition}
                      >
                        <Text style={[
                          styles.positionOptionText,
                          isCurrentPosition && styles.currentPositionText
                        ]}>
                          Position {index + 1}: {step.name}
                        </Text>
                        {isCurrentPosition && (
                          <Text style={styles.currentPositionLabel}>(Current)</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowMoveStepModal(false);
                  setStepToMove(null);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Work Titles List Modal */}
      <Modal
        visible={showWorkTitlesListModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Work Titles</Text>
            <TouchableOpacity onPress={() => setShowWorkTitlesListModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {project?.steps && project.steps.length > 0 ? (
              <View style={styles.workTitlesListContainer}>
                {project.steps.map((step, index) => (
                  <View key={step.id} style={styles.workTitleModalItem}>
                    <View style={styles.workTitleModalNumber}>
                      <Text style={styles.workTitleModalNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.workTitleModalInfo}>
                      <Text style={styles.workTitleModalName}>{step.name}</Text>
                      {step.description && (
                        <Text style={styles.workTitleModalDescription}>{step.description}</Text>
                      )}
                      {step.price !== undefined && step.price > 0 && (
                        <Text style={styles.workTitleModalPrice}>
                          ${step.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      )}
                      <View style={[
                        styles.workTitleModalStatus,
                        { backgroundColor: step.status === 'finished' ? '#10b981' : step.status === 'in_progress' ? '#f59e0b' : '#6b7280' }
                      ]}>
                        <Text style={styles.workTitleModalStatusText}>
                          {step.status === 'finished' ? 'Finished' : step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No work titles added yet</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowWorkTitlesListModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background
  },
  header: {
    backgroundColor: '#1e40af', // Darker blue header like teams
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like teams
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitleContainer: {
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
    marginTop: 2,
  },
  saveChangesBar: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveChangesText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveChangesButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  saveChangesButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  saveChangesButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitleOld: {
    fontSize: 28, // Increased font size like teams
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#236ecf', // Blue button on dark blue header
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Extra padding for mobile bottom menu
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  projectHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#ffcc00', // Yellow like teams
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffcc00', // Yellow like teams
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937', // Dark text on white background
    minWidth: 60,
    textAlign: 'right',
  },
  clientInfo: {
    backgroundColor: '#ffffff', // White card like teams
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#ffffff', // White card like teams
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  timelineSection: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937', // Dark text on white background
    marginBottom: 16,
  },
  stepsSection: {
    marginTop: 20,
  },
  stepsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00', // Yellow button like teams
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addStepText: {
    color: '#1f2937', // Dark text on yellow
    fontSize: 12,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: '#ffffff', // White card like teams
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // borderLeftColor will be set dynamically based on status
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  stepName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#236ecf',
    flex: 1,
    lineHeight: 18,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeStatusButton: {
    backgroundColor: '#236ecf', // Mavi - pending
    borderColor: '#236ecf',
  },
  activeStatusButtonText: {
    color: '#ffffff',
  },
  statusButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '700',
    textAlign: 'center',
  },
  // Status specific colors - Active (pressed/selected)
  pendingButton: {
    backgroundColor: '#9ca3af', // Grey
    borderColor: '#9ca3af',
    borderWidth: 2,
    shadowColor: '#9ca3af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pendingButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  inProgressButton: {
    backgroundColor: '#f97316', // Orange
    borderColor: '#f97316',
    borderWidth: 2,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inProgressButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  finishedButton: {
    backgroundColor: '#22c55e', // Green
    borderColor: '#22c55e',
    borderWidth: 2,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  finishedButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  clientStatusButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientStatusButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like teams
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#236ecf', // Blue background
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
  submitButton: {
    backgroundColor: '#ffcc00', // Yellow button like teams
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  childStepCard: {
    marginLeft: 20,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 12,
  },
  stepTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  stepCheckboxChecked: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  stepCheckboxDisabled: {
    opacity: 0.5,
  },
  childStepIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#236ecf',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedChildStepIndicator: {
    backgroundColor: '#10b981', // Green for completed steps
  },
  clickableChildStepIndicator: {
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  disabledChildStepIndicator: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  childStepName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  childStepDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  addChildStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addChildStepText: {
    fontSize: 12,
    color: '#236ecf',
    fontWeight: '600',
    marginLeft: 4,
  },
  stepTitleAndBudget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#236ecf',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepBudgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  budgetSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#236ecf',
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  stepBudgetBreakdown: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  stepBudgetLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 2,
  },
  stepBudgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editDeleteButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    fontSize: 10,
    color: '#236ecf',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  budgetSummary: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  budgetSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  budgetTotal: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  budgetWarning: {
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  commentsSection: {
    margin: 20,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCommentText: {
    fontSize: 14,
    color: '#236ecf',
    fontWeight: '600',
    marginLeft: 4,
  },
  commentCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyComments: {
    backgroundColor: '#f9fafb',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyCommentsSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  loadingComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingCommentsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chatSection: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  todoSection: {
    margin: 20,
    marginTop: 0,
    minHeight: 400,
  },
  chatSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  chatMessages: {
    gap: 16,
  },
  chatMessage: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#236ecf',
  },
  chatMessageHeader: {
    marginBottom: 12,
  },
  chatUserInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  chatUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatUserAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  chatUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chatUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  chatRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chatRoleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  chatMessageDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  chatMessageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  chatInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236ecf',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  chatInputButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  mentionHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  mentionSuggestionsContainer: {
    marginTop: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mentionSuggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  mentionSuggestions: {
    maxHeight: 200,
  },
  mentionSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  mentionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentionAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  mentionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mentionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  mentionRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mentionRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  changeOrdersContainer: {
    gap: 12,
  },
  changeOrderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  changeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  changeOrderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  changeOrderDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  changeOrderDetails: {
    gap: 4,
  },
  changeOrderDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#374151',
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
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  approveButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  rejectButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyChangeOrders: {
    backgroundColor: '#f9fafb',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyChangeOrdersText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  changeOrderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  changeOrderStep: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    marginTop: 8,
  },
  changeOrderStepName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  changeOrderStepPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  assignPMButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  assignPMButtonText: {
    fontSize: 12,
    color: '#236ecf',
    fontWeight: '600',
  },
  assignClientButton: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  assignClientButtonText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  pmList: {
    gap: 8,
  },
  clientList: {
    maxHeight: 200,
    marginTop: 8,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedClientOption: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  clientCompany: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 11,
    color: '#9ca3af',
  },
  selectedClientText: {
    color: '#ffffff',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pmOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  selectedPMOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  currentlyAssignedPM: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  pmInfo: {
    flex: 1,
  },
  pmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  pmEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  currentlyAssignedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  assignedSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  assignedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  assignedPMCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  assignedPMInfo: {
    flex: 1,
  },
  assignedPMName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  assignedPMEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  removePMButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    backgroundColor: '#236ecf',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#236ecf',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#236ecf',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#236ecf',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  parentStepActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editNotesButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  editNotesText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  childStepsContainer: {
    marginTop: 8,
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 12,
  },
  reorderButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reorderButton: {
    padding: 4,
    marginHorizontal: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  moveToPositionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moveToPositionText: {
    fontSize: 12,
    color: '#236ecf',
    fontWeight: '600',
  },
  moveStepModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  positionList: {
    maxHeight: 400,
    marginTop: 16,
  },
  positionOption: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currentPositionOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
    opacity: 0.6,
  },
  positionOptionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  currentPositionText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  currentPositionLabel: {
    fontSize: 12,
    color: '#236ecf',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  deleteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 24,
    color: '#ef4444',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#236ecf',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  projectInfoSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  // Bottom Menu Styles
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 10,
  },
  bottomMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  bottomMenuItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 50,
    flex: 1,
    maxWidth: 80,
  },
  bottomMenuText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  // Settings Modal Styles
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text on blue background
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff', // White cards
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  dangerItem: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: '#fef2f2',
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingsItemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerText: {
    color: '#ef4444',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff', // White cards
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  // Date Picker Styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  completeProjectSection: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    alignItems: 'center',
  },
  completeProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeProjectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  completeProjectHint: {
    marginTop: 12,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  datePickerText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  // Delete Project Modal Styles
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  // Success Modal Styles
  successModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 32,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: '#236ecf',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  workTitlesListContainer: {
    padding: 16,
  },
  workTitleModalItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  workTitleModalNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workTitleModalNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  workTitleModalInfo: {
    flex: 1,
  },
  workTitleModalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workTitleModalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  workTitleModalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  workTitleModalStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workTitleModalStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Work Title Selection Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  categoryModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    margin: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
    zIndex: 10000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Work Title Modal Header (simple style like create project form)
  workTitleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  workTitleModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  categoryList: {
    flex: 1,
    maxHeight: 500,
  },
  categoryListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCategory: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  closeModalButton: {
    backgroundColor: '#236ecf',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  closeModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  doneButton: {
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButtonTextDisabled: {
    color: '#9ca3af',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  selectedClientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  selectedClientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  selectedClientTagText: {
    fontSize: 14,
    color: '#236ecf',
    fontWeight: '500',
  },
  percentageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageInput: {
    flex: 1,
  },
  percentageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  calculatedAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  calculatedAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  calculatedAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  priceInput: {
    flex: 1,
  },
});