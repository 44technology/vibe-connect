import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, CreditCard as Edit3, Trash2, Calendar, Clock, User, Plus, X, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import { ProjectTimeline } from '@/components/ProjectTimeline';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectStep } from '@/types';

// Mock data - In real app, this would come from database
const mockProject: Project = {
  id: '1',
  title: 'Luxury Villa - Miami Beach',
  description: 'Modern luxury villa construction with ocean view and premium finishes. This project includes 4 bedrooms, 3 bathrooms, a spacious living area, and a beautiful garden with pool.',
  category: 'residential',
  start_date: '2024-01-15',
  deadline: '2024-08-30',
  status: 'active',
  client_id: 'client1',
  client_name: 'John Smith',
  manager_id: 'manager1',
  progress_percentage: 45,
  created_at: '2024-01-15T00:00:00Z',
  steps: [
    {
      id: '1',
      project_id: '1',
      name: 'PERMIT PROCESS',
      description: 'Different text',
      status: 'in_progress',
      assigned_employee_id: 'emp1',
      order_index: 1,
      created_at: '2024-01-15T00:00:00Z',
      step_type: 'parent',
      notes: 'Permit fees not included, to be paid separate by the owner. Architectural plans are not included.',
      budget_percentage: 20,
      child_steps: [
        {
          id: '1-1',
          project_id: '1',
          name: 'Demolition permit',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 1,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-2',
          project_id: '1',
          name: 'Flooring permit',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 2,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-3',
          project_id: '1',
          name: 'Master permit',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 3,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-4',
          project_id: '1',
          name: 'Electrical permit',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 4,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-5',
          project_id: '1',
          name: 'Plumbing permit',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 5,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-6',
          project_id: '1',
          name: 'Mechanical permit',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 6,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-7',
          project_id: '1',
          name: 'Get permit cards',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 7,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '1-8',
          project_id: '1',
          name: 'Apply and get the notice of commencement',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp1',
          order_index: 8,
          parent_step_id: '1',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
      ],
    },
    {
      id: '2',
      project_id: '1',
      name: 'PROTECTION AND PREPARATION WORK',
      description: '',
      status: 'pending',
      assigned_employee_id: 'emp2',
      order_index: 2,
      created_at: '2024-01-15T00:00:00Z',
      step_type: 'parent',
      notes: 'This includes the initial setup and preparation of the job site for construction activities.',
      budget_percentage: 15,
      child_steps: [
        {
          id: '2-1',
          project_id: '1',
          name: 'Coordinate access for the move-in process, ensuring protection of existing finishes and common areas.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp2',
          order_index: 1,
          parent_step_id: '2',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '2-2',
          project_id: '1',
          name: 'Temporary floor, window and cabinet coverings, wall protections, smoke detection and other safety measures will be installed as needed to prevent damage during the course of work.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp2',
          order_index: 2,
          parent_step_id: '2',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
      ],
    },
    {
      id: '3',
      project_id: '1',
      name: 'DEMOLITION WORK',
      description: '',
      status: 'pending',
      assigned_employee_id: 'emp3',
      order_index: 3,
      created_at: '2024-01-15T00:00:00Z',
      step_type: 'parent',
      notes: 'Bathrooms not included',
      budget_percentage: 35,
      child_steps: [
        {
          id: '3-1',
          project_id: '1',
          name: 'Complete demolition and removal of existing flooring materials such as carpet, marble, along with any underlayment on the lower floor.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp3',
          order_index: 1,
          parent_step_id: '3',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '3-2',
          project_id: '1',
          name: 'All debris will be properly disposed of off-site.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp3',
          order_index: 2,
          parent_step_id: '3',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '3-3',
          project_id: '1',
          name: 'Following demolition, the subfloor will be thoroughly inspected for damage, moisture, and levelness, with necessary repairs made to ensure a structurally sound and even surface.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp3',
          order_index: 3,
          parent_step_id: '3',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '3-4',
          project_id: '1',
          name: 'The subfloor will then be cleaned and prepped to ensure it is free of dust and debris, ready for the installation of new hardwood flooring.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp3',
          order_index: 4,
          parent_step_id: '3',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
      ],
    },
    {
      id: '4',
      project_id: '1',
      name: 'SOUNDPROOFING',
      description: '',
      status: 'pending',
      assigned_employee_id: 'emp4',
      order_index: 4,
      created_at: '2024-01-15T00:00:00Z',
      step_type: 'parent',
      notes: 'Only on lower floor, bathrooms not included.',
      budget_percentage: 30,
      child_steps: [
        {
          id: '4-1',
          project_id: '1',
          name: 'Install soundproofing materials in designated areas as outlined in the project specifications.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp4',
          order_index: 1,
          parent_step_id: '4',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '4-2',
          project_id: '1',
          name: 'Prioritize installation in high-impact zones, particularly where tile flooring is planned.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp4',
          order_index: 2,
          parent_step_id: '4',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '4-3',
          project_id: '1',
          name: 'Ensure proper sealing of all edges and joints to prevent sound leakage and vibrations.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp4',
          order_index: 3,
          parent_step_id: '4',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
        {
          id: '4-4',
          project_id: '1',
          name: 'Labor and materials included.',
          description: '',
          status: 'pending',
          assigned_employee_id: 'emp4',
          order_index: 4,
          parent_step_id: '4',
          created_at: '2024-01-15T00:00:00Z',
          step_type: 'child',
        },
      ],
    },
  ],
  comments: [
    {
      id: '1',
      project_id: '1',
      user_id: 'client-1',
      user_name: 'Client User',
      comment: 'The project is progressing well. I have a question about the timeline for the finishing phase.',
      created_at: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      project_id: '1',
      user_id: 'pm-1',
      user_name: 'PM User',
      comment: 'Thanks for your feedback. The finishing phase should be completed by the end of next month.',
      created_at: '2024-01-20T14:30:00Z',
    },
  ],
};


export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [project, setProject] = useState<Project>(mockProject);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showAddChildStepModal, setShowAddChildStepModal] = useState(false);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [showEditChildStepModal, setShowEditChildStepModal] = useState(false);
  const [selectedParentStepId, setSelectedParentStepId] = useState<string | null>(null);
  const [selectedStepForNotes, setSelectedStepForNotes] = useState<ProjectStep | null>(null);
  const [selectedStepForEdit, setSelectedStepForEdit] = useState<ProjectStep | null>(null);
  const [selectedChildStepForEdit, setSelectedChildStepForEdit] = useState<{step: ProjectStep, parentId: string} | null>(null);
  const [newStep, setNewStep] = useState({ name: '', description: '', budget_percentage: 0 });
  const [newChildStep, setNewChildStep] = useState({ name: '', description: '' });
  const [editStep, setEditStep] = useState({ name: '', description: '', budget_percentage: 0 });
  const [editChildStep, setEditChildStep] = useState({ name: '', description: '' });
  const [stepNotes, setStepNotes] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showPMAssignmentModal, setShowPMAssignmentModal] = useState(false);
  const [showClientAssignmentModal, setShowClientAssignmentModal] = useState(false);
  const [selectedPM, setSelectedPM] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysUntilDeadline = () => {
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

  const handleAddStep = () => {
    if (!newStep.name) return;

    const step: ProjectStep = {
      id: Date.now().toString(),
      project_id: project.id,
      name: newStep.name,
      description: newStep.description,
      status: 'pending',
      order_index: (project.steps?.length || 0) + 1,
      created_at: new Date().toISOString(),
      step_type: 'parent',
      child_steps: [],
      budget_percentage: newStep.budget_percentage,
    };

    setProject(prev => ({
      ...prev,
      steps: [...(prev.steps || []), step],
    }));

    setShowAddStepModal(false);
    setNewStep({ name: '', description: '', budget_percentage: 0 });
  };

  const handleAddChildStep = (parentStepId: string) => {
    if (!newChildStep.name) return;

    const childStep: ProjectStep = {
      id: `${parentStepId}-${Date.now()}`,
      project_id: project.id,
      name: newChildStep.name,
      description: newChildStep.description,
      status: 'pending',
      order_index: 1,
      parent_step_id: parentStepId,
      created_at: new Date().toISOString(),
      step_type: 'child',
    };

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
  };

  const handleUpdateStepNotes = (stepId: string, notes: string) => {
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
    console.log('Delete step called:', { stepId, isChildStep, parentStepId });
    Alert.alert(
      'Delete Step',
      'Are you sure you want to delete this step?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Delete confirmed:', { stepId, isChildStep, parentStepId });
            if (isChildStep && parentStepId) {
              // Delete child step
              setProject(prev => {
                console.log('Deleting child step, current steps:', prev.steps);
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
                console.log('New project after child step deletion:', newProject);
                return newProject;
              });
            } else {
              // Delete parent step
              setProject(prev => {
                console.log('Deleting parent step, current steps:', prev.steps);
                const newProject = {
                  ...prev,
                  steps: prev.steps?.filter(step => step.id !== stepId) || [],
                };
                console.log('New project after parent step deletion:', newProject);
                return newProject;
              });
            }
          },
        },
      ]
    );
  };

  const handleEditStep = (step: ProjectStep) => {
    setSelectedStepForEdit(step);
    setEditStep({
      name: step.name,
      description: step.description || '',
      budget_percentage: step.budget_percentage || 0,
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
    if (!selectedStepForEdit || !editStep.name) return;

    setProject(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === selectedStepForEdit.id 
          ? { 
              ...step, 
              name: editStep.name,
              description: editStep.description,
              budget_percentage: editStep.budget_percentage,
            }
          : step
      ) || [],
    }));

    setShowEditStepModal(false);
    setSelectedStepForEdit(null);
    setEditStep({ name: '', description: '', budget_percentage: 0 });
  };

  const handleUpdateChildStep = () => {
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
    return project.steps?.reduce((total, step) => total + (step.budget_percentage || 0), 0) || 0;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      project_id: project.id,
      user_id: 'current-user', // In real app, use actual user ID
      user_name: 'Current User', // In real app, use actual user name
      comment: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    setProject(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment],
    }));

    setNewComment('');
    setShowCommentModal(false);
  };

  // Mock PM list
  const mockPMs = [
    { id: 'pm1', name: 'John Smith', email: 'john@example.com' },
    { id: 'pm2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: 'pm3', name: 'Mike Wilson', email: 'mike@example.com' },
  ];

  // Mock Client list
  const mockClients = [
    { id: 'client1', name: 'Alice Brown', email: 'alice@company.com', company: 'Tech Corp' },
    { id: 'client2', name: 'Bob Davis', email: 'bob@startup.io', company: 'Startup Inc' },
    { id: 'client3', name: 'Carol Wilson', email: 'carol@enterprise.com', company: 'Enterprise Ltd' },
    { id: 'client4', name: 'David Miller', email: 'david@agency.net', company: 'Creative Agency' },
    { id: 'client5', name: 'Client User', email: 'client@example.com', company: 'Test Company' },
  ];

  const handleAssignPM = () => {
    if (!selectedPM || !assignmentDeadline) return;

    const pm = mockPMs.find(p => p.id === selectedPM);
    if (!pm) return;

    const schedule = {
      id: Date.now().toString(),
      project_id: project.id,
      pm_id: selectedPM,
      pm_name: pm.name,
      assigned_date: new Date().toISOString(),
      deadline: assignmentDeadline,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    setProject(prev => ({
      ...prev,
      assigned_pms: [...(prev.assigned_pms || []), selectedPM],
      schedules: [...(prev.schedules || []), schedule],
    }));

    setSelectedPM('');
    setAssignmentDeadline('');
    setShowPMAssignmentModal(false);
  };

  const handleAssignClient = () => {
    if (!selectedClient) return;

    const client = mockClients.find(c => c.id === selectedClient);
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
        company: client.company,
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

  const moveStepUp = (stepId: string) => {
    setProject(prev => {
      const steps = prev.steps || [];
      const currentIndex = steps.findIndex(step => step.id === stepId);
      
      if (currentIndex > 0) {
        const newSteps = [...steps];
        [newSteps[currentIndex], newSteps[currentIndex - 1]] = [newSteps[currentIndex - 1], newSteps[currentIndex]];
        
        // Update order_index
        newSteps.forEach((step, index) => {
          step.order_index = index;
        });
        
        return { ...prev, steps: newSteps };
      }
      return prev;
    });
  };

  const moveStepDown = (stepId: string) => {
    setProject(prev => {
      const steps = prev.steps || [];
      const currentIndex = steps.findIndex(step => step.id === stepId);
      
      if (currentIndex < steps.length - 1) {
        const newSteps = [...steps];
        [newSteps[currentIndex], newSteps[currentIndex + 1]] = [newSteps[currentIndex + 1], newSteps[currentIndex]];
        
        // Update order_index
        newSteps.forEach((step, index) => {
          step.order_index = index;
        });
        
        return { ...prev, steps: newSteps };
      }
      return prev;
    });
  };

  const handleUpdateStepStatus = (stepId: string, newStatus: ProjectStep['status'], isChildStep: boolean = false, parentStepId?: string) => {
    if (isChildStep && parentStepId) {
      // Update child step
      setProject(prev => ({
        ...prev,
        steps: prev.steps?.map(step => 
          step.id === parentStepId 
            ? {
                ...step,
                child_steps: step.child_steps?.map(childStep =>
                  childStep.id === stepId ? { ...childStep, status: newStatus } : childStep
                ) || []
              }
            : step
        ) || [],
      }));
    } else {
      // Update parent step
      setProject(prev => ({
        ...prev,
        steps: prev.steps?.map(step => 
          step.id === stepId ? { ...step, status: newStatus } : step
        ) || [],
      }));
    }

    // Update project progress based on completed steps
    const allSteps = project.steps?.flatMap(step => [
      step,
      ...(step.child_steps || [])
    ]) || [];
    const completedSteps = allSteps.filter(s => s.status === 'finished').length;
    const totalSteps = allSteps.length || 1;
    const newProgress = Math.round((completedSteps / totalSteps) * 100);
    
    setProject(prev => ({
      ...prev,
      progress_percentage: newProgress,
    }));
  };

  const daysLeft = getDaysUntilDeadline();
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft <= 7 && daysLeft >= 0;

  const StepCard = ({ step, isChild = false, parentStepId }: { step: ProjectStep; isChild?: boolean; parentStepId?: string }) => {
    const isExpanded = expandedSteps.has(step.id);
    const hasChildSteps = step.child_steps && step.child_steps.length > 0;
    
    return (
      <View style={[styles.stepCard, isChild && styles.childStepCard]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepTitleContainer}>
            {isChild && <View style={styles.childStepIndicator} />}
            <View style={styles.stepTitleAndBudget}>
              <Text style={[styles.stepName, isChild && styles.childStepName]}>{step.name}</Text>
              {!isChild && step.budget_percentage && (
                <Text style={styles.budgetPercentage}>{step.budget_percentage}%</Text>
              )}
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
                  disabled={userRole === 'client'}>
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
                </View>
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => isChild ? handleEditChildStep(step, parentStepId!) : handleEditStep(step)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteStep(step.id, isChild, parentStepId)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
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
            <Text style={styles.addChildStepText}>Add Sub-step</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Text style={styles.title}>{project.title}</Text>
            <Text style={styles.category}>{t(project.category)}</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${project.progress_percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{project.progress_percentage}%</Text>
          </View>

          {project.client_name && (
            <View style={styles.clientInfo}>
              <Text style={styles.clientLabel}>Client:</Text>
              <Text style={styles.clientName}>{project.client_name}</Text>
            </View>
          )}

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Calendar size={20} color="#236ecf" />
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(project.start_date)}</Text>
            </View>

            <View style={styles.detailCard}>
              <Clock size={20} color={isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#236ecf'} />
              <Text style={styles.detailLabel}>Deadline</Text>
              <Text style={[
                styles.detailValue,
                { color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#236ecf' }
              ]}>
                {formatDate(project.deadline)}
              </Text>
            </View>
          </View>

          {project.steps && project.steps.length > 0 && (
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Project Timeline</Text>
              <ProjectTimeline steps={project.steps} showLabels={true} />
            </View>
          )}

            <View style={styles.stepsSection}>
            <View style={styles.stepsSectionHeader}>
              <Text style={styles.sectionTitle}>{t('steps')}</Text>
              {userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.addStepButton}
                  onPress={() => setShowAddStepModal(true)}>
                  <Plus size={16} color="#236ecf" />
                  <Text style={styles.addStepText}>{t('addStep')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Budget Summary */}
            <View style={styles.budgetSummary}>
              <Text style={styles.budgetSummaryTitle}>Budget Distribution</Text>
              <Text style={[
                styles.budgetTotal,
                { color: getTotalBudgetPercentage() === 100 ? '#10b981' : getTotalBudgetPercentage() > 100 ? '#ef4444' : '#f59e0b' }
              ]}>
                Total: {getTotalBudgetPercentage()}%
              </Text>
              {getTotalBudgetPercentage() !== 100 && (
                <Text style={styles.budgetWarning}>
                  {getTotalBudgetPercentage() < 100 ? 'Budget allocation incomplete' : 'Budget allocation exceeds 100%'}
                </Text>
              )}
            </View>

            {project.steps?.map((step) => (
              <View key={step.id}>
                <StepCard step={step} />
              </View>
            ))}
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {userRole === 'client' && (
              <TouchableOpacity
                style={styles.addCommentButton}
                onPress={() => setShowCommentModal(true)}>
                <Plus size={16} color="#236ecf" />
                <Text style={styles.addCommentText}>Add Comment</Text>
              </TouchableOpacity>
            )}
          </View>

          {project.comments && project.comments.length > 0 ? (
            project.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                  <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Step Modal */}
      <Modal
        visible={showAddStepModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addStep')}</Text>
            <TouchableOpacity onPress={() => setShowAddStepModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('stepName')}</Text>
              <TextInput
                style={styles.input}
                value={newStep.name}
                onChangeText={(text) => setNewStep(prev => ({ ...prev, name: text }))}
                placeholder="e.g. Electrical Work"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newStep.description}
                onChangeText={(text) => setNewStep(prev => ({ ...prev, description: text }))}
                placeholder="Step description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Percentage</Text>
              <TextInput
                style={styles.input}
                value={newStep.budget_percentage.toString()}
                onChangeText={(text) => setNewStep(prev => ({ ...prev, budget_percentage: parseInt(text) || 0 }))}
                placeholder="e.g. 25"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddStep}>
              <Text style={styles.submitButtonText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Child Step Modal */}
      <Modal
        visible={showAddChildStepModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Sub-step</Text>
            <TouchableOpacity onPress={() => setShowAddChildStepModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sub-step Name</Text>
              <TextInput
                style={styles.input}
                value={newChildStep.name}
                onChangeText={(text) => setNewChildStep(prev => ({ ...prev, name: text }))}
                placeholder="e.g. Site Preparation"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newChildStep.description}
                onChangeText={(text) => setNewChildStep(prev => ({ ...prev, description: text }))}
                placeholder="Sub-step description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={() => selectedParentStepId && handleAddChildStep(selectedParentStepId)}>
              <Text style={styles.submitButtonText}>Add Sub-step</Text>
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
              <Text style={styles.label}>Budget Percentage</Text>
              <TextInput
                style={styles.input}
                value={editStep.budget_percentage.toString()}
                onChangeText={(text) => setEditStep(prev => ({ ...prev, budget_percentage: parseInt(text) || 0 }))}
                placeholder="e.g. 25"
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
            <Text style={styles.modalTitle}>Edit Sub-step</Text>
            <TouchableOpacity onPress={() => setShowEditChildStepModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sub-step Name</Text>
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
                placeholder="Sub-step description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateChildStep}>
              <Text style={styles.submitButtonText}>Update Sub-step</Text>
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
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Comment</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Share your thoughts about this project..."
                multiline
                numberOfLines={5}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
              <Text style={styles.submitButtonText}>Add Comment</Text>
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
            <Text style={styles.modalTitle}>Assign Project Manager</Text>
            <TouchableOpacity onPress={() => setShowPMAssignmentModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select PM</Text>
              <View style={styles.pmList}>
                {mockPMs.map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    style={[
                      styles.pmOption,
                      selectedPM === pm.id && styles.selectedPMOption,
                    ]}
                    onPress={() => setSelectedPM(pm.id)}>
                    <View style={styles.pmInfo}>
                      <Text style={styles.pmName}>{pm.name}</Text>
                      <Text style={styles.pmEmail}>{pm.email}</Text>
                    </View>
                    {selectedPM === pm.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deadline</Text>
              <TextInput
                style={styles.input}
                value={assignmentDeadline}
                onChangeText={setAssignmentDeadline}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAssignPM}>
              <Text style={styles.submitButtonText}>Assign PM</Text>
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
                {mockClients.map((client) => (
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
                        {client.company}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#236ecf20',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#236ecf',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 20,
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
  },
  projectHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#b8860b',
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
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#b8860b30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#236ecf',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
    minWidth: 50,
  },
  clientInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#236ecf',
  },
  clientLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    color: '#236ecf',
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    color: '#236ecf',
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#236ecf',
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
    backgroundColor: '#236ecf20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addStepText: {
    color: '#236ecf',
    fontSize: 12,
    fontWeight: '600',
  },
  stepCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#b8860b',
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
    gap: 2,
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    minWidth: 50,
  },
  activeStatusButton: {
    backgroundColor: '#236ecf', // Mavi - pending
  },
  activeStatusButtonText: {
    color: '#ffffff',
  },
  statusButtonText: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Status specific colors
  pendingButton: {
    backgroundColor: '#3b82f6', // Mavi
  },
  pendingButtonText: {
    color: '#ffffff',
  },
  inProgressButton: {
    backgroundColor: '#f59e0b', // Koyu sarı
  },
  inProgressButtonText: {
    color: '#ffffff',
  },
  finishedButton: {
    backgroundColor: '#10b981', // Yeşil
  },
  finishedButtonText: {
    color: '#ffffff',
  },
  clientStatusButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  clientStatusButtonText: {
    color: '#6b7280',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
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
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
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
    backgroundColor: '#236ecf',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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
  childStepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#236ecf',
    marginRight: 8,
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
  },
  selectedPMOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
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
});