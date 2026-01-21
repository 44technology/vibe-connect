import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CheckCircle, XCircle, Eye, Building2, Package, FileText, Calendar, DollarSign, User, Search, Download, Filter, ArrowLeft, Receipt, BarChart3, Edit, Send } from 'lucide-react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project, MaterialRequest, ChangeOrderRequest, Proposal } from '@/types';
import { ProjectService } from '@/services/projectService';
import { UserService } from '@/services/userService';
import { MaterialRequestService } from '@/services/materialRequestService';
import { ChangeOrderService } from '@/services/changeOrderService';
import { ProposalService } from '@/services/proposalService';
import { CommentService } from '@/services/commentService';
import { Comment } from '@/types';
import { MessageSquare } from 'lucide-react-native';
import HamburgerMenu from '@/components/HamburgerMenu';

export default function ProjectApprovalScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [viewMode, setViewMode] = useState<'select' | 'project' | 'sales' | 'sales-proposal'>('select');
  const [activeTab, setActiveTab] = useState<'project' | 'material' | 'change-order'>('project');
  
  // Projects
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);
  
  // Material Requests
  const [pendingMaterialRequests, setPendingMaterialRequests] = useState<MaterialRequest[]>([]);
  const [approvedMaterialRequests, setApprovedMaterialRequests] = useState<MaterialRequest[]>([]);
  
  // Change Orders
  const [pendingChangeOrders, setPendingChangeOrders] = useState<ChangeOrderRequest[]>([]);
  const [approvedChangeOrders, setApprovedChangeOrders] = useState<ChangeOrderRequest[]>([]);
  
  // Sales - Proposals
  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMaterialRequest, setSelectedMaterialRequest] = useState<MaterialRequest | null>(null);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrderRequest | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeRequestReason, setChangeRequestReason] = useState('');
  const [changeOrderComments, setChangeOrderComments] = useState<Comment[]>([]);
  const [newChangeOrderComment, setNewChangeOrderComment] = useState('');
  const [projectComments, setProjectComments] = useState<Comment[]>([]);
  const [newProjectComment, setNewProjectComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingProjectComments, setLoadingProjectComments] = useState(false);
  const [availablePMs, setAvailablePMs] = useState<any[]>([]);
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
  const [grossProfitRate, setGrossProfitRate] = useState(28.5);
  const [grossProfitRateText, setGrossProfitRateText] = useState('28.5');
  const [pmBudget, setPmBudget] = useState(0);
  const [stepBudgetRates, setStepBudgetRates] = useState<Record<string, number>>({});
  const [stepBudgetRateTexts, setStepBudgetRateTexts] = useState<Record<string, string>>({});
  const [showApprovalSuccessModal, setShowApprovalSuccessModal] = useState(false);
  const [approvedItemName, setApprovedItemName] = useState('');
  const [approvedItemType, setApprovedItemType] = useState<'project' | 'material' | 'change-order'>('project');
  
  // Web-specific features
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');

  // Load data
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'sales') {
      if (viewMode === 'select') {
        setLoading(false);
      } else if (viewMode === 'project') {
        // Only admin can approve projects, but sales can view
        if (userRole === 'admin') {
          loadData();
        } else {
          setLoading(false);
        }
      } else if (viewMode === 'sales-proposal') {
        // Only admin can approve proposals, but sales can view
        if (userRole === 'admin') {
          loadSalesData();
        } else {
          setLoading(false);
        }
      }
    } else {
      setLoading(false);
    }
  }, [userRole, viewMode]);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'sales') {
      if (viewMode === 'project') {
        // Only admin can approve projects
        if (userRole === 'admin') {
          loadData();
        }
      } else if (activeTab === 'material' || activeTab === 'change-order') {
        // Sales can still view material requests and change orders
        if (userRole === 'admin' || userRole === 'sales') {
          loadData();
        }
      }
    }
  }, [activeTab]);

  // Load project comments when project is selected
  useEffect(() => {
    if (selectedProject && activeTab === 'project') {
      loadProjectComments(selectedProject.id);
    }
  }, [selectedProject, activeTab]);

  // Set display mode based on platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      setDisplayMode('table');
    } else {
      setDisplayMode('card');
    }
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      
      if (viewMode === 'sales-proposal') {
        // Only admin can approve proposals (management approval)
        if (userRole === 'admin') {
          const allProposals = await ProposalService.getProposals();
          const pending = allProposals.filter(p => p.management_approval === 'pending');
          setPendingProposals(pending);
        }
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      Alert.alert('Error', 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'project') {
        // Only admin can load and approve projects
        if (userRole === 'admin') {
          const projects = await ProjectService.getProjects();
          // Show pending, under_review, and rejected projects
          const pending = projects.filter(p => 
            p.status === 'pending' || 
            p.status === 'under_review' || 
            p.status === 'rejected'
          );
          setPendingProjects(pending);
          
          // Show approved projects
          const approved = projects.filter(p => p.status === 'approved');
          setApprovedProjects(approved);
          
          const pms = await UserService.getUsersByRole('pm');
          setAvailablePMs(pms);
        }
      } else if (activeTab === 'material') {
        // Admin and sales can view material requests
        if (userRole === 'admin' || userRole === 'sales') {
          const materialRequests = await MaterialRequestService.getMaterialRequests();
          const pending = materialRequests.filter(r => r.status === 'pending');
          setPendingMaterialRequests(pending);
          
          // Show approved material requests
          const approved = materialRequests.filter(r => r.status === 'approved');
          setApprovedMaterialRequests(approved);
        }
      } else if (activeTab === 'change-order') {
        // Admin and sales can view change orders
        if (userRole === 'admin' || userRole === 'sales') {
          const changeOrders = await ChangeOrderService.getChangeOrderRequests();
          // Show pending change orders
          const pending = changeOrders.filter(co => co.status === 'pending');
          setPendingChangeOrders(pending);
          
          // Show approved change orders
          const approved = changeOrders.filter(co => co.status === 'approved');
          setApprovedChangeOrders(approved);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Project Approval Functions
  const handleApproveProject = async (project: Project) => {
    try {
      await ProjectService.updateProject(project.id, {
        status: 'approved',
        approved_by: user?.id || '',
        approved_by_name: user?.name || '',
        approved_at: new Date().toISOString(),
      });
      
      // Clear comments when approved
      setProjectComments([]);
      setNewProjectComment('');

      // Update selectedProject status to show "Assign to PMs" section
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject(prev => prev ? { ...prev, status: 'approved' } : null);
      }

      setPendingProjects(prev => prev.filter(p => p.id !== project.id));
      // Don't close modal - keep it open to show "Assign to PMs" section
      // setShowDetailModal(false);
      
      // Reload project data to get updated status
      const updatedProject = await ProjectService.getProjectById(project.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      
      setApprovedItemName(project.title);
      setApprovedItemType('project');
      // Don't show success modal immediately - let user see "Assign to PMs" section
      // setShowApprovalSuccessModal(true);
      
      await loadData();
    } catch (error) {
      console.error('Error approving project:', error);
      Alert.alert('Error', 'Failed to approve project');
    }
  };

  const handleRejectProject = async () => {
    if (!selectedProject) return;

    try {
      await ProjectService.updateProject(selectedProject.id, {
        status: 'rejected',
        rejected_by: user?.id || '',
        rejected_by_name: user?.name || '',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      });
      
      // Clear comments when rejected
      setProjectComments([]);
      setNewProjectComment('');

      setPendingProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      
      Alert.alert('Success', 'Project rejected');
      await loadData();
    } catch (error) {
      console.error('Error rejecting project:', error);
      Alert.alert('Error', 'Failed to reject project');
    }
  };

  // Change Request Functions
  const handleChangeRequestProject = async () => {
    if (!selectedProject) return;
    if (!changeRequestReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for change request');
      return;
    }

    try {
      await ProjectService.updateProject(selectedProject.id, {
        status: 'under_review',
        change_request_by: user?.id || '',
        change_request_by_name: user?.name || '',
        change_request_at: new Date().toISOString(),
        change_request_reason: changeRequestReason,
      });
      
      setProjectComments([]);
      setNewProjectComment('');

      setPendingProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setShowDetailModal(false);
      setShowChangeRequestModal(false);
      setChangeRequestReason('');
      
      Alert.alert('Success', 'Change request sent to project owner');
      await loadData();
    } catch (error) {
      console.error('Error sending change request:', error);
      Alert.alert('Error', 'Failed to send change request');
    }
  };

  const handleChangeRequestMaterialRequest = async () => {
    if (!selectedMaterialRequest) return;
    if (!changeRequestReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for change request');
      return;
    }

    try {
      await MaterialRequestService.updateMaterialRequest(selectedMaterialRequest.id, {
        status: 'under_review',
        change_request_by: user?.id || '',
        change_request_at: new Date().toISOString(),
        change_request_reason: changeRequestReason,
      });

      setPendingMaterialRequests(prev => prev.filter(r => r.id !== selectedMaterialRequest.id));
      setShowDetailModal(false);
      setShowChangeRequestModal(false);
      setChangeRequestReason('');
      
      Alert.alert('Success', 'Change request sent');
      await loadData();
    } catch (error) {
      console.error('Error sending change request:', error);
      Alert.alert('Error', 'Failed to send change request');
    }
  };

  const handleChangeRequestChangeOrder = async () => {
    if (!selectedChangeOrder) return;
    if (!changeRequestReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for change request');
      return;
    }

    try {
      await ChangeOrderService.updateChangeOrderRequest(selectedChangeOrder.id, {
        status: 'under_review',
        change_request_by: user?.id || '',
        change_request_at: new Date().toISOString(),
        change_request_reason: changeRequestReason,
      });

      setShowDetailModal(false);
      setShowChangeRequestModal(false);
      setChangeRequestReason('');
      
      Alert.alert('Success', 'Change request sent');
      await loadData();
    } catch (error) {
      console.error('Error sending change request:', error);
      Alert.alert('Error', 'Failed to send change request');
    }
  };

  const handleChangeRequestProposal = async () => {
    if (!selectedProposal) return;
    if (!changeRequestReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for change request');
      return;
    }

    try {
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }
      await ProposalService.updateProposal(selectedProposal.id, {
        management_approval: 'pending',
        change_request_by: user.id,
        change_request_by_name: user.name,
        change_request_at: new Date().toISOString(),
        change_request_reason: changeRequestReason,
      });
      
      setPendingProposals(prev => prev.filter(p => p.id !== selectedProposal.id));
      setShowDetailModal(false);
      setShowChangeRequestModal(false);
      setChangeRequestReason('');
      setSelectedProposal(null);
      
      Alert.alert('Success', 'Change request sent to sales team');
      await loadData();
    } catch (error) {
      console.error('Error sending change request:', error);
      Alert.alert('Error', 'Failed to send change request');
    }
  };

  const handleApproveProposal = async (proposal: Proposal) => {
    try {
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }
      await ProposalService.approveProposalByManagement(proposal.id, user.id, user.name);
      // Update selectedProposal to show "Assign to PMs" section
      const updatedProposal = { ...proposal, management_approval: 'approved' as const };
      setSelectedProposal(updatedProposal);
      setPendingProposals(prev => prev.filter(p => p.id !== proposal.id));
      // Keep modal open to show "Assign to PMs" section
      await loadData();
    } catch (error) {
      console.error('Error approving proposal:', error);
      Alert.alert('Error', 'Failed to approve proposal');
    }
  };

  const handleRejectProposal = async (proposal: Proposal) => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }
      await ProposalService.rejectProposalByManagement(proposal.id, user.id, user.name, rejectionReason);
      setPendingProposals(prev => prev.filter(p => p.id !== proposal.id));
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedProposal(null);
      
      Alert.alert('Success', 'Proposal rejected');
      await loadData();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      Alert.alert('Error', 'Failed to reject proposal');
    }
  };

  const handleAssignToPMs = async (project: Project) => {
    if (selectedPMs.length === 0) {
      Alert.alert('Error', 'Please select at least one PM');
      return;
    }

    try {
      // Calculate PM budget for each selected PM
      const totalBudget = project.total_budget || 0;
      const pmBudgetPerPM = pmBudget / selectedPMs.length; // Divide PM budget equally among selected PMs
      
      // Create pm_budgets object
      const pmBudgets: { [pmId: string]: number } = {};
      selectedPMs.forEach(pmId => {
        pmBudgets[pmId] = pmBudgetPerPM;
      });

      // Persist per-work-title profit rates onto steps (parent steps only) so PM budget can be computed per work title later
      const updatedSteps = (project.steps || []).map((step: any, idx: number) => {
        if (step.step_type !== 'parent') return step;
        const stepId = step.id || `step-${idx}`;
        const profitRate = stepBudgetRates[stepId];
        return profitRate !== undefined ? { ...step, profit_rate: profitRate } : step;
      });

      await ProjectService.updateProject(project.id, {
        assigned_pms: selectedPMs,
        pm_budgets: pmBudgets,
        gross_profit_rate: grossProfitRate,
        steps: updatedSteps,
        is_job: true,
        status: 'active',
      });

      setPendingProjects(prev => prev.filter(p => p.id !== project.id));
      setShowDetailModal(false);
      setSelectedPMs([]);
      
      Alert.alert('Success', `Project assigned to ${selectedPMs.length} PM(s) with budget allocation and job created!`);
      await loadData();
    } catch (error) {
      console.error('Error assigning project:', error);
      Alert.alert('Error', 'Failed to assign project');
    }
  };

  // Material Request Approval Functions
  const handleApproveMaterialRequest = async (request: MaterialRequest) => {
    try {
      await MaterialRequestService.updateMaterialRequest(request.id, {
        status: 'approved',
        approved_by: user?.id || '',
        approved_at: new Date().toISOString(),
      });

      setPendingMaterialRequests(prev => prev.filter(r => r.id !== request.id));
      setShowDetailModal(false);
      
      setApprovedItemName(request.description);
      setApprovedItemType('material');
      setShowApprovalSuccessModal(true);
      
      await loadData();
    } catch (error) {
      console.error('Error approving material request:', error);
      Alert.alert('Error', 'Failed to approve material request');
    }
  };

  const handleRejectMaterialRequest = async () => {
    if (!selectedMaterialRequest) return;

    try {
      await MaterialRequestService.updateMaterialRequest(selectedMaterialRequest.id, {
        status: 'rejected',
        rejected_by: user?.id || '',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      });

      setPendingMaterialRequests(prev => prev.filter(r => r.id !== selectedMaterialRequest.id));
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      
      Alert.alert('Success', 'Material request rejected');
      await loadData();
    } catch (error) {
      console.error('Error rejecting material request:', error);
      Alert.alert('Error', 'Failed to reject material request');
    }
  };

  // Change Order Approval Functions
  const handleApproveChangeOrder = async (request: ChangeOrderRequest) => {
    try {
      await ChangeOrderService.updateChangeOrderRequest(request.id, {
        status: 'approved',
        approved_by: user?.id || '',
        approved_at: new Date().toISOString(),
      });

      // Don't filter out - keep all change orders to show status
      // setPendingChangeOrders(prev => prev.filter(r => r.id !== request.id));
      setShowDetailModal(false);
      
      setApprovedItemName(request.title);
      setApprovedItemType('change-order');
      setShowApprovalSuccessModal(true);
      
      await loadData();
    } catch (error) {
      console.error('Error approving change order:', error);
      Alert.alert('Error', 'Failed to approve change order');
    }
  };

  // Load project comments
  const loadProjectComments = async (projectId: string) => {
    try {
      setLoadingProjectComments(true);
      const comments = await CommentService.getCommentsByProjectId(projectId);
      setProjectComments(comments);
    } catch (error) {
      console.error('Error loading project comments:', error);
    } finally {
      setLoadingProjectComments(false);
    }
  };

  // Load change order comments
  const loadChangeOrderComments = async (changeOrderId: string) => {
    try {
      setLoadingComments(true);
      const comments = await CommentService.getCommentsByChangeOrderId(changeOrderId);
      setChangeOrderComments(comments);
    } catch (error) {
      console.error('Error loading change order comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddProjectComment = async () => {
    if (!newProjectComment.trim() || !selectedProject || !user) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      await CommentService.addComment({
        project_id: selectedProject.id,
        user_id: user.id,
        user_name: user.name,
        comment: newProjectComment.trim(),
      });
      
      setNewProjectComment('');
      await loadProjectComments(selectedProject.id);
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleRejectChangeOrder = async () => {
    if (!selectedChangeOrder) return;

    try {
      await ChangeOrderService.updateChangeOrderRequest(selectedChangeOrder.id, {
        status: 'rejected',
        rejected_by: user?.id || '',
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      });

      // Don't filter out - keep all change orders to show status
      // setPendingChangeOrders(prev => prev.filter(r => r.id !== selectedChangeOrder.id));
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      
      Alert.alert('Success', 'Change order rejected');
      await loadData();
    } catch (error) {
      console.error('Error rejecting change order:', error);
      Alert.alert('Error', 'Failed to reject change order');
    }
  };

  const togglePMSelection = (pmId: string) => {
    setSelectedPMs(prev => 
      prev.includes(pmId) 
        ? prev.filter(id => id !== pmId)
        : [...prev, pmId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Company Profit % is `rate` (e.g. 28.5). PM Budget is the remaining % (100 - rate).
  const calculatePMBudget = (totalBudget: number, companyProfitRate: number) => {
    const pmRate = Math.max(0, Math.min(100, 100 - companyProfitRate));
    return (totalBudget * pmRate) / 100;
  };

  useEffect(() => {
    if (selectedProject && selectedProject.total_budget) {
      const calculated = calculatePMBudget(selectedProject.total_budget, grossProfitRate);
      setPmBudget(calculated);
    }
  }, [selectedProject, grossProfitRate]);


  if (userRole !== 'admin' && userRole !== 'sales') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Approval</Text>
          <Text style={styles.subtitle}>Access denied</Text>
        </View>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>
            Only administrators and sales can access this page
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const getPendingCount = () => {
    if (activeTab === 'project') return pendingProjects.length;
    if (activeTab === 'material') return pendingMaterialRequests.length;
    return pendingChangeOrders.length;
  };

  // Filter and search functions
  const getFilteredProjects = () => {
    if (!searchQuery) return pendingProjects;
    const query = searchQuery.toLowerCase();
    return pendingProjects.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.client_name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  };

  const getFilteredMaterialRequests = () => {
    if (!searchQuery) return pendingMaterialRequests;
    const query = searchQuery.toLowerCase();
    return pendingMaterialRequests.filter(r => 
      r.description.toLowerCase().includes(query) ||
      r.project_name.toLowerCase().includes(query)
    );
  };

  const getFilteredChangeOrders = () => {
    if (!searchQuery) return pendingChangeOrders;
    const query = searchQuery.toLowerCase();
    return pendingChangeOrders.filter(co => 
      co.title.toLowerCase().includes(query) ||
      co.project_name.toLowerCase().includes(query) ||
      co.requested_by.toLowerCase().includes(query)
    );
  };

  // Batch operations
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (activeTab === 'project') {
      const allIds = new Set(pendingProjects.map(p => p.id));
      setSelectedItems(allIds);
    } else if (activeTab === 'material') {
      const allIds = new Set(pendingMaterialRequests.map(r => r.id));
      setSelectedItems(allIds);
    } else {
      const allIds = new Set(pendingChangeOrders.map(co => co.id));
      setSelectedItems(allIds);
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleBatchApprove = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('Error', 'Please select items to approve');
      return;
    }

    try {
      if (activeTab === 'project') {
        for (const id of selectedItems) {
          await ProjectService.updateProject(id, {
            status: 'approved',
            approved_by: user?.id || '',
            approved_by_name: user?.name || '',
            approved_at: new Date().toISOString(),
          });
        }
      } else if (activeTab === 'material') {
        for (const id of selectedItems) {
          await MaterialRequestService.updateMaterialRequest(id, {
            status: 'approved',
            approved_by: user?.id || '',
            approved_at: new Date().toISOString(),
          });
        }
      } else {
        for (const id of selectedItems) {
          await ChangeOrderService.updateChangeOrderRequest(id, {
            status: 'approved',
            approved_by: user?.id || '',
            approved_at: new Date().toISOString(),
          });
        }
      }

      clearSelection();
      Alert.alert('Success', `${selectedItems.size} item(s) approved successfully`);
      await loadData();
    } catch (error) {
      console.error('Error batch approving:', error);
      Alert.alert('Error', 'Failed to approve items');
    }
  };

  const handleBatchReject = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Error', 'Please select items to reject');
      return;
    }
    setShowRejectModal(true);
  };

  const confirmBatchReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      if (activeTab === 'project') {
        for (const id of selectedItems) {
          await ProjectService.updateProject(id, {
            status: 'rejected',
            rejected_by: user?.id || '',
            rejected_by_name: user?.name || '',
            rejected_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
          });
        }
      } else if (activeTab === 'material') {
        for (const id of selectedItems) {
          await MaterialRequestService.updateMaterialRequest(id, {
            status: 'rejected',
            rejected_by: user?.id || '',
            rejected_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
          });
        }
      } else {
        for (const id of selectedItems) {
          await ChangeOrderService.updateChangeOrderRequest(id, {
            status: 'rejected',
            rejected_by: user?.id || '',
            rejected_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
          });
        }
      }

      setRejectionReason('');
      setShowRejectModal(false);
      clearSelection();
      Alert.alert('Success', `${selectedItems.size} item(s) rejected`);
      await loadData();
    } catch (error) {
      console.error('Error batch rejecting:', error);
      Alert.alert('Error', 'Failed to reject items');
    }
  };

  // Show selection screen if viewMode is 'select'
  if (viewMode === 'select') {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Approval</Text>
              <Text style={styles.subtitle}>Choose category</Text>
            </View>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('project')}
              >
                <Building2 size={48} color="#236ecf" />
                <Text style={styles.selectionTitle}>Project</Text>
                <Text style={styles.selectionDescription}>
                  Approve projects, materials, and change orders
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('sales')}
              >
                <BarChart3 size={48} color="#8b5cf6" />
                <Text style={styles.selectionTitle}>Sales</Text>
                <Text style={styles.selectionDescription}>
                  Approve proposals
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  // Show sales selection screen if viewMode is 'sales'
  if (viewMode === 'sales') {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => setViewMode('select')} 
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#ffcc00" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Sales Approval</Text>
              <Text style={styles.subtitle}>Choose approval type</Text>
            </View>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('sales-proposal')}
              >
                <FileText size={48} color="#f59e0b" />
                <Text style={styles.selectionTitle}>Proposal</Text>
                <Text style={styles.selectionDescription}>
                  Review and approve pending proposals
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (viewMode === 'project') {
                setViewMode('select');
              } else if (viewMode === 'sales-proposal') {
                setViewMode('sales');
              }
            }} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {viewMode === 'project' ? 'Project Approval' : 
               viewMode === 'sales-proposal' ? 'Proposal Approval' : 'Approval'}
            </Text>
            <Text style={styles.subtitle}>
              {viewMode === 'project' 
                ? (activeTab === 'change-order' 
                    ? `${pendingChangeOrders.length} change orders` 
                    : `${getPendingCount()} ${activeTab === 'project' ? 'projects' : 'material requests'} pending approval`)
                : viewMode === 'sales-proposal'
                ? `${pendingProposals.length} proposals pending approval`
                : ''}
            </Text>
          </View>
        </View>

        {viewMode === 'project' ? (
          <>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'project' && styles.activeTab]}
          onPress={() => setActiveTab('project')}
        >
          <Building2 size={18} color={activeTab === 'project' ? '#236ecf' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'project' && styles.activeTabText]}>
            Project
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'material' && styles.activeTab]}
          onPress={() => setActiveTab('material')}
        >
          <Package size={18} color={activeTab === 'material' ? '#236ecf' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'material' && styles.activeTabText]}>
            Material
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'change-order' && styles.activeTab]}
          onPress={() => setActiveTab('change-order')}
        >
          <FileText size={18} color={activeTab === 'change-order' ? '#236ecf' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'change-order' && styles.activeTabText]}>
            Change Order
          </Text>
        </TouchableOpacity>
      </View>

      {/* Web: Search and Batch Operations Toolbar */}
      {Platform.OS === 'web' && (
        <View style={styles.webToolbar}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.toolbarActions}>
            {selectedItems.size > 0 && (
              <>
                <TouchableOpacity
                  style={styles.batchButton}
                  onPress={handleBatchApprove}
                >
                  <CheckCircle size={16} color="#ffffff" />
                  <Text style={styles.batchButtonText}>Approve ({selectedItems.size})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.batchButton, styles.rejectBatchButton]}
                  onPress={handleBatchReject}
                >
                  <XCircle size={16} color="#ffffff" />
                  <Text style={styles.batchButtonText}>Reject ({selectedItems.size})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </>
            )}
            {selectedItems.size === 0 && (
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={selectAll}
              >
                <Text style={styles.selectAllButtonText}>Select All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Web Table View */}
        {Platform.OS === 'web' && displayMode === 'table' ? (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.tableCheckbox}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={selectAll}
                >
                  {selectedItems.size > 0 && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              </View>
              {activeTab === 'project' && (
                <>
                  <Text style={styles.tableHeaderText}>Project</Text>
                  <Text style={styles.tableHeaderText}>Client</Text>
                  <Text style={styles.tableHeaderText}>Budget</Text>
                  <Text style={styles.tableHeaderText}>Category</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                  <Text style={styles.tableHeaderText}>Actions</Text>
                </>
              )}
              {activeTab === 'material' && (
                <>
                  <Text style={styles.tableHeaderText}>Description</Text>
                  <Text style={styles.tableHeaderText}>Project</Text>
                  <Text style={styles.tableHeaderText}>Quantity</Text>
                  <Text style={styles.tableHeaderText}>Delivery Date</Text>
                  <Text style={styles.tableHeaderText}>Actions</Text>
                </>
              )}
              {activeTab === 'change-order' && (
                <>
                  <Text style={styles.tableHeaderText}>Title</Text>
                  <Text style={styles.tableHeaderText}>Project</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                  <Text style={styles.tableHeaderText}>Requested By</Text>
                  <Text style={styles.tableHeaderText}>Date</Text>
                  <Text style={styles.tableHeaderText}>Actions</Text>
                </>
              )}
            </View>
            {activeTab === 'project' && (
              <>
                {getFilteredProjects().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No projects found</Text>
                  </View>
                ) : (
                  getFilteredProjects().map((project) => (
                    <View key={project.id} style={styles.tableRow}>
                      <View style={styles.tableCheckbox}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            selectedItems.has(project.id) && styles.checkboxSelected
                          ]}
                          onPress={() => toggleItemSelection(project.id)}
                        >
                          {selectedItems.has(project.id) && (
                            <Text style={styles.checkboxCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.tableCell}>{project.title}</Text>
                      <Text style={styles.tableCell}>{project.client_name}</Text>
                      <Text style={styles.tableCell}>{formatCurrency(project.total_budget || 0)}</Text>
                      <Text style={styles.tableCell}>{project.category}</Text>
                      <View style={styles.tableCell}>
                        <View style={[
                          styles.statusBadge,
                          project.status === 'pending' && styles.statusBadgePending,
                          project.status === 'under_review' && styles.statusBadgeReview,
                          project.status === 'rejected' && styles.statusBadgeRejected,
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            project.status === 'pending' && styles.statusBadgeTextPending,
                            project.status === 'under_review' && styles.statusBadgeTextReview,
                            project.status === 'rejected' && styles.statusBadgeTextRejected,
                          ]}>
                            {project.status === 'under_review' ? 'Under Review' : 
                             project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tableActions}>
                        <TouchableOpacity
                          style={styles.tableActionButton}
                          onPress={() => {
                            setSelectedProject(project);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={16} color="#236ecf" />
                        </TouchableOpacity>
                        {project.status !== 'rejected' && (
                          <TouchableOpacity
                            style={[styles.tableActionButton, styles.approveActionButton]}
                            onPress={() => handleApproveProject(project)}
                          >
                            <CheckCircle size={16} color="#22c55e" />
                          </TouchableOpacity>
                        )}
                        {project.status !== 'rejected' && (
                          <TouchableOpacity
                            style={[styles.tableActionButton, styles.rejectActionButton]}
                            onPress={() => {
                              setSelectedProject(project);
                              setShowRejectModal(true);
                            }}
                          >
                            <XCircle size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
            {activeTab === 'material' && (
              <>
                {getFilteredMaterialRequests().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No material requests found</Text>
                  </View>
                ) : (
                  getFilteredMaterialRequests().map((request) => (
                    <View key={request.id} style={styles.tableRow}>
                      <View style={styles.tableCheckbox}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            selectedItems.has(request.id) && styles.checkboxSelected
                          ]}
                          onPress={() => toggleItemSelection(request.id)}
                        >
                          {selectedItems.has(request.id) && (
                            <Text style={styles.checkboxCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.tableCell}>{request.description}</Text>
                      <Text style={styles.tableCell}>{request.project_name}</Text>
                      <Text style={styles.tableCell}>{request.quantity}</Text>
                      <Text style={styles.tableCell}>
                        {new Date(request.delivery_date).toLocaleDateString()}
                      </Text>
                      <View style={styles.tableActions}>
                        <TouchableOpacity
                          style={styles.tableActionButton}
                          onPress={() => {
                            setSelectedMaterialRequest(request);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={16} color="#236ecf" />
                        </TouchableOpacity>
                        {userRole === 'admin' && (
                          <>
                            <TouchableOpacity
                              style={[styles.tableActionButton, styles.approveActionButton]}
                              onPress={() => handleApproveMaterialRequest(request)}
                            >
                              <CheckCircle size={16} color="#22c55e" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.tableActionButton, styles.rejectActionButton]}
                              onPress={() => {
                                setSelectedMaterialRequest(request);
                                setShowRejectModal(true);
                              }}
                            >
                              <XCircle size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
            {activeTab === 'change-order' && (
              <>
                {getFilteredChangeOrders().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No change orders found</Text>
                  </View>
                ) : (
                  getFilteredChangeOrders().map((request) => (
                    <View key={request.id} style={styles.tableRow}>
                      <View style={styles.tableCheckbox}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            selectedItems.has(request.id) && styles.checkboxSelected
                          ]}
                          onPress={() => toggleItemSelection(request.id)}
                        >
                          {selectedItems.has(request.id) && (
                            <Text style={styles.checkboxCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.tableCell}>{request.title}</Text>
                      <Text style={styles.tableCell}>{request.project_name}</Text>
                      <View style={styles.tableCell}>
                        <View style={[
                          styles.statusBadge,
                          request.status === 'approved' && styles.statusBadgeApproved,
                          request.status === 'rejected' && styles.statusBadgeRejected,
                          request.status === 'pending' && styles.statusBadgePending,
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            request.status === 'approved' && styles.statusBadgeTextApproved,
                            request.status === 'rejected' && styles.statusBadgeTextRejected,
                            request.status === 'pending' && styles.statusBadgeTextPending,
                          ]}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.tableCell}>{request.requested_by}</Text>
                      <Text style={styles.tableCell}>
                        {new Date(request.requested_date).toLocaleDateString()}
                      </Text>
                      <View style={styles.tableActions}>
                        <TouchableOpacity
                          style={styles.tableActionButton}
                          onPress={() => {
                            setSelectedChangeOrder(request);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={16} color="#236ecf" />
                        </TouchableOpacity>
                        {userRole === 'admin' && (
                          <>
                            <TouchableOpacity
                              style={[styles.tableActionButton, styles.approveActionButton]}
                              onPress={() => handleApproveChangeOrder(request)}
                            >
                              <CheckCircle size={16} color="#22c55e" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.tableActionButton, styles.rejectActionButton]}
                              onPress={() => {
                                setSelectedChangeOrder(request);
                                setShowRejectModal(true);
                              }}
                            >
                              <XCircle size={16} color="#ef4444" />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        ) : (
          /* Mobile Card View */
          <>
            {activeTab === 'project' && (
              <>
                {getFilteredProjects().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No projects pending approval</Text>
                  </View>
                ) : (
                  getFilteredProjects().map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={styles.approvalCard}
                      onPress={() => {
                        setSelectedProject(project);
                        setShowDetailModal(true);
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                          <Building2 size={24} color="#236ecf" />
                        </View>
                        <View style={styles.cardInfo}>
                          <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle}>{project.title}</Text>
                            <View style={[
                              styles.statusBadge,
                              project.status === 'pending' && styles.statusBadgePending,
                              project.status === 'under_review' && styles.statusBadgeReview,
                              project.status === 'rejected' && styles.statusBadgeRejected,
                            ]}>
                              <Text style={[
                                styles.statusBadgeText,
                                project.status === 'pending' && styles.statusBadgeTextPending,
                                project.status === 'under_review' && styles.statusBadgeTextReview,
                                project.status === 'rejected' && styles.statusBadgeTextRejected,
                              ]}>
                                {project.status === 'under_review' ? 'Under Review' : 
                                 project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cardSubtitle}>Client: {project.client_name}</Text>
                        </View>
                        <View style={styles.budgetBadge}>
                          <Text style={styles.budgetText}>
                            {formatCurrency(project.total_budget || 0)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

            {activeTab === 'material' && (
              <>
                {getFilteredMaterialRequests().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No material requests pending approval</Text>
                  </View>
                ) : (
                  getFilteredMaterialRequests().map((request) => (
                    <TouchableOpacity
                      key={request.id}
                      style={styles.approvalCard}
                      onPress={() => {
                        setSelectedMaterialRequest(request);
                        setShowDetailModal(true);
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                          <Package size={24} color="#f59e0b" />
                        </View>
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle}>{request.description}</Text>
                          <Text style={styles.cardSubtitle}>Project: {request.project_name}</Text>
                          <Text style={styles.cardMeta}>Quantity: {request.quantity}</Text>
                        </View>
                        <View style={styles.dateBadge}>
                          <Text style={styles.dateText}>
                            {new Date(request.delivery_date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

            {activeTab === 'change-order' && (
              <>
                {getFilteredChangeOrders().length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No change orders found</Text>
                  </View>
                ) : (
                  getFilteredChangeOrders().map((request) => (
                    <TouchableOpacity
                      key={request.id}
                      style={styles.approvalCard}
                      onPress={() => {
                        setSelectedChangeOrder(request);
                        setShowDetailModal(true);
                      }}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                          <FileText size={24} color="#8b5cf6" />
                        </View>
                        <View style={styles.cardInfo}>
                          <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle}>{request.title}</Text>
                            <View style={[
                              styles.statusBadge,
                              request.status === 'approved' && styles.statusBadgeApproved,
                              request.status === 'rejected' && styles.statusBadgeRejected,
                              request.status === 'pending' && styles.statusBadgePending,
                            ]}>
                              <Text style={[
                                styles.statusBadgeText,
                                request.status === 'approved' && styles.statusBadgeTextApproved,
                                request.status === 'rejected' && styles.statusBadgeTextRejected,
                                request.status === 'pending' && styles.statusBadgeTextPending,
                              ]}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cardSubtitle}>Project: {request.project_name}</Text>
                          <Text style={styles.cardMeta}>Requested by: {request.requested_by}</Text>
                        </View>
                        <View style={styles.dateBadge}>
                          <Text style={styles.dateText}>
                            {new Date(request.requested_date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </>
          )}
          </ScrollView>
        </>
        ) : viewMode === 'sales-proposal' ? (
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {pendingProposals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending proposals</Text>
            </View>
          ) : (
            pendingProposals.map((proposal) => (
              <TouchableOpacity
                key={proposal.id}
                style={styles.card}
                onPress={() => {
                  setSelectedProposal(proposal);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{proposal.proposal_number}</Text>
                    <Text style={styles.cardSubtitle}>Client: {proposal.client_name}</Text>
                    <Text style={styles.cardSubtitle}>Created by: {proposal.created_by_name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.totalAmount}>
                    ${proposal.total_cost?.toLocaleString() || '0'}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
            )}
          </ScrollView>
        ) : null}

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {viewMode === 'sales-proposal' && selectedProposal ? 'Proposal Details' :
               activeTab === 'project' ? 'Project Details' : 
               activeTab === 'material' ? 'Material Request Details' : 
               'Change Order Details'}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowDetailModal(false);
              setSelectedProject(null);
              setSelectedMaterialRequest(null);
              setSelectedChangeOrder(null);
              setSelectedProposal(null);
              setChangeOrderComments([]);
              setNewChangeOrderComment('');
              setProjectComments([]);
              setNewProjectComment('');
            }}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {activeTab === 'project' && selectedProject && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Project Information</Text>
                  <Text style={styles.detailTitle}>{selectedProject.title}</Text>
                  <Text style={styles.detailDescription}>{selectedProject.description}</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client:</Text>
                    <Text style={styles.detailValue}>{selectedProject.client_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{selectedProject.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created by:</Text>
                    <Text style={styles.detailValue}>{selectedProject.created_by_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Budget:</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(selectedProject.total_budget || 0)}
                    </Text>
                  </View>
                  {selectedProject.start_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Start Date:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedProject.start_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {selectedProject.deadline && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Deadline:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedProject.deadline).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {selectedProject.project_address && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Project Address:</Text>
                      <Text style={styles.detailValue}>
                        {selectedProject.project_address}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedProject.steps && selectedProject.steps.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Work Titles</Text>
                    {selectedProject.steps
                      .filter(step => step.step_type === 'parent')
                      .map((step, index) => {
                        const stepId = step.id || `step-${index}`;
                        const stepPrice = step.price || 0;
                        const stepProfitRate = stepBudgetRates[stepId] ?? grossProfitRate;
                        const pmBudgetForStep = (stepPrice * (100 - stepProfitRate)) / 100;
                        const companyProfitForStep = stepPrice - pmBudgetForStep;
                        
                        return (
                          <View key={stepId} style={styles.stepItem}>
                            <View style={styles.stepHeader}>
                              <Text style={styles.stepName}>{index + 1}. {step.name}</Text>
                            </View>
                            {step.price && (
                              <View style={styles.stepPriceContainer}>
                                <View style={styles.priceRow}>
                                  <Text style={styles.priceLabel}>Price:</Text>
                                  <Text style={styles.stepPrice}>
                                    ${stepPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </Text>
                                </View>
                                <View style={styles.priceRow}>
                                  <Text style={styles.priceLabel}>Company Profit (%):</Text>
                                  <TextInput
                                    style={styles.stepBudgetInput}
                                    value={stepBudgetRateTexts[stepId] ?? stepProfitRate.toString()}
                                    onChangeText={(text) => {
                                      const cleanedText = text.replace(/[^0-9.]/g, '');
                                      const parts = cleanedText.split('.');
                                      const validText = parts.length > 2 
                                        ? parts[0] + '.' + parts.slice(1).join('')
                                        : cleanedText;
                                      
                                      setStepBudgetRateTexts(prev => ({ ...prev, [stepId]: validText }));
                                      
                                      const rate = parseFloat(validText);
                                      if (!isNaN(rate)) {
                                        if (rate > 100) {
                                          setStepBudgetRates(prev => ({ ...prev, [stepId]: 100 }));
                                          setStepBudgetRateTexts(prev => ({ ...prev, [stepId]: '100' }));
                                        } else if (rate < 0) {
                                          setStepBudgetRates(prev => ({ ...prev, [stepId]: 0 }));
                                          setStepBudgetRateTexts(prev => ({ ...prev, [stepId]: '0' }));
                                        } else {
                                          setStepBudgetRates(prev => ({ ...prev, [stepId]: rate }));
                                        }
                                      }
                                    }}
                                    keyboardType="numeric"
                                    placeholder={grossProfitRate.toString()}
                                  />
                                </View>
                                <View style={styles.priceRow}>
                                  <Text style={styles.priceLabel}>PM Budget:</Text>
                                  <Text style={styles.grossProfitAmount}>
                                    ${pmBudgetForStep.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </Text>
                                </View>
                                <View style={[styles.priceRow, styles.finalPriceRow]}>
                                  <Text style={styles.priceLabel}>Company Profit:</Text>
                                  <Text style={styles.finalPriceAmount}>
                                    ${companyProfitForStep.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {step.description && (
                              <Text style={styles.stepDescription}>{step.description}</Text>
                            )}
                            {step.child_steps && step.child_steps.length > 0 && (
                              <View style={styles.childStepsContainer}>
                                {step.child_steps.map((childStep, childIndex) => (
                                  <View key={childStep.id || childIndex} style={styles.childStepItem}>
                                    <Text style={styles.childStepName}>
                                      {index + 1}.{childIndex + 1} {childStep.name}
                                    </Text>
                                    {childStep.description && (
                                      <Text style={styles.childStepDescription}>
                                        {childStep.description}
                                      </Text>
                                    )}
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      })}
                  </View>
                )}

                {/* Comments Section - Show for all projects */}
                {selectedProject && (
                  <View style={styles.detailSection}>
                    <View style={styles.commentsSectionHeader}>
                      <View style={styles.commentsTitleContainer}>
                        <MessageSquare size={20} color="#236ecf" />
                        <Text style={styles.sectionTitle}>Review Comments</Text>
                        {selectedProject.status === 'under_review' && (
                          <View style={styles.reviewBadge}>
                            <Text style={styles.reviewBadgeText}>Under Review</Text>
                          </View>
                        )}
                      </View>
                      {userRole === 'admin' && (
                        <TouchableOpacity
                          style={styles.addCommentButton}
                          onPress={handleAddProjectComment}
                        >
                          <Text style={styles.addCommentButtonText}>Add Comment</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {userRole === 'admin' && (
                      <View style={styles.commentInputContainer}>
                        <TextInput
                          style={styles.commentInput}
                          value={newProjectComment}
                          onChangeText={setNewProjectComment}
                          placeholder="Add a review comment for sales..."
                          multiline
                          numberOfLines={3}
                        />
                      </View>
                    )}

                    {loadingProjectComments ? (
                      <View style={styles.loadingComments}>
                        <ActivityIndicator size="small" color="#236ecf" />
                        <Text style={styles.loadingCommentsText}>Loading comments...</Text>
                      </View>
                    ) : projectComments.length > 0 ? (
                      <View style={styles.commentsList}>
                        {projectComments.map((comment) => (
                          <View key={comment.id} style={styles.commentCard}>
                            <View style={styles.commentHeader}>
                              <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                              <Text style={styles.commentDate}>
                                {new Date(comment.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
                            </View>
                            <Text style={styles.commentText}>{comment.comment}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.emptyComments}>
                        <Text style={styles.emptyCommentsText}>No comments yet</Text>
                      </View>
                    )}
                  </View>
                )}

                {selectedProject && selectedProject.status === 'approved' && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Assign to PMs</Text>
                    <View style={styles.commissionSection}>
                    <Text style={styles.commissionLabel}>Budget Rate (%)</Text>
                    <TextInput
                      style={styles.commissionInput}
                      value={grossProfitRateText}
                      onChangeText={(text) => {
                        // Allow only numbers and one decimal point
                        const cleanedText = text.replace(/[^0-9.]/g, '');
                        // Ensure only one decimal point
                        const parts = cleanedText.split('.');
                        const validText = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('')
                          : cleanedText;
                        
                        setGrossProfitRateText(validText);
                        
                        // Parse and validate the rate
                        const rate = parseFloat(validText);
                        if (!isNaN(rate)) {
                          // Limit to 0-100 range
                          if (rate >= 0 && rate <= 100) {
                            setGrossProfitRate(rate);
                          } else if (rate > 100) {
                            setGrossProfitRate(100);
                            setGrossProfitRateText('100');
                          } else if (rate < 0) {
                            setGrossProfitRate(0);
                            setGrossProfitRateText('0');
                          }
                        } else if (validText === '' || validText === '.') {
                          // Allow empty or just decimal point while typing
                          setGrossProfitRate(0);
                        }
                      }}
                      keyboardType="decimal-pad"
                      placeholder="28.5"
                    />
                  </View>

                  <View style={styles.budgetCalculation}>
                    {/* Admin only: Show Client Price vs Internal Budget comparison */}
                    {userRole === 'admin' && (
                      <>
                        <View style={styles.budgetRow}>
                          <Text style={styles.budgetLabel}>Client Price:</Text>
                          <Text style={[styles.budgetValue, { color: '#059669' }]}>
                            {formatCurrency(selectedProject.client_budget || selectedProject.total_budget || 0)}
                          </Text>
                        </View>
                        <View style={styles.budgetRow}>
                          <Text style={styles.budgetLabel}>Internal Budget:</Text>
                          <Text style={styles.budgetValue}>
                            {formatCurrency(selectedProject.total_budget || 0)}
                          </Text>
                        </View>
                        <View style={[styles.budgetRow, { backgroundColor: '#ecfdf5', padding: 8, borderRadius: 6, marginBottom: 8 }]}>
                          <Text style={[styles.budgetLabel, { color: '#059669', fontWeight: '600' }]}>Profit Margin:</Text>
                          <Text style={[styles.budgetValue, { color: '#059669', fontWeight: '700' }]}>
                            {formatCurrency((selectedProject.client_budget || selectedProject.total_budget || 0) - (selectedProject.total_budget || 0))}
                          </Text>
                        </View>
                      </>
                    )}
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Company Profit ({grossProfitRate}%):</Text>
                      <Text style={styles.budgetValue}>
                        {formatCurrency(((selectedProject.total_budget || 0) * grossProfitRate) / 100)}
                      </Text>
                    </View>
                    <View style={[styles.budgetRow, styles.pmBudgetRow]}>
                      <Text style={styles.pmBudgetLabel}>PM Budget:</Text>
                      <Text style={styles.pmBudgetValue}>
                        {formatCurrency(pmBudget)}
                      </Text>
                    </View>
                  </View>
                  
                  {availablePMs.map((pm) => (
                    <TouchableOpacity
                      key={pm.id}
                      style={[
                        styles.pmOption,
                        selectedPMs.includes(pm.id) && styles.selectedPMOption
                      ]}
                      onPress={() => togglePMSelection(pm.id)}>
                      <Text style={[
                        styles.pmOptionText,
                        selectedPMs.includes(pm.id) && styles.selectedPMOptionText
                      ]}>
                        {pm.name} ({pm.email})
                      </Text>
                      {selectedPMs.includes(pm.id) && (
                        <Text style={styles.selectedIndicator}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                  
                  {/* Assign to PMs Button */}
                  {selectedPMs.length > 0 && (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignToPMs(selectedProject!)}
                    >
                      <User size={20} color="#ffffff" />
                      <Text style={styles.assignButtonText}>
                        Assign to {selectedPMs.length} PM{selectedPMs.length > 1 ? 's' : ''} (Budget: {formatCurrency(pmBudget)})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                )}
              </>
            )}

            {viewMode === 'sales-proposal' && selectedProposal && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Proposal Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposal Number:</Text>
                    <Text style={styles.detailValue}>{selectedProposal.proposal_number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client:</Text>
                    <Text style={styles.detailValue}>{selectedProposal.client_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client Email:</Text>
                    <Text style={styles.detailValue}>{selectedProposal.client_email || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client Address:</Text>
                    <Text style={styles.detailValue}>{selectedProposal.client_address || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{selectedProposal.category || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created by:</Text>
                    <Text style={styles.detailValue}>{selectedProposal.created_by_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Proposal Date:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProposal.proposal_date ? new Date(selectedProposal.proposal_date).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Management Approval:</Text>
                    <View style={[
                      styles.statusBadge,
                      selectedProposal.management_approval === 'approved' && styles.statusBadgeApproved,
                      selectedProposal.management_approval === 'rejected' && styles.statusBadgeRejected,
                      selectedProposal.management_approval === 'pending' && styles.statusBadgePending,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        selectedProposal.management_approval === 'approved' && styles.statusBadgeTextApproved,
                        selectedProposal.management_approval === 'rejected' && styles.statusBadgeTextRejected,
                        selectedProposal.management_approval === 'pending' && styles.statusBadgeTextPending,
                      ]}>
                        {selectedProposal.management_approval ? selectedProposal.management_approval.charAt(0).toUpperCase() + selectedProposal.management_approval.slice(1) : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client Approval:</Text>
                    <View style={[
                      styles.statusBadge,
                      selectedProposal.client_approval === 'approved' && styles.statusBadgeApproved,
                      selectedProposal.client_approval === 'rejected' && styles.statusBadgeRejected,
                      selectedProposal.client_approval === 'pending' && styles.statusBadgePending,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        selectedProposal.client_approval === 'approved' && styles.statusBadgeTextApproved,
                        selectedProposal.client_approval === 'rejected' && styles.statusBadgeTextRejected,
                        selectedProposal.client_approval === 'pending' && styles.statusBadgeTextPending,
                      ]}>
                        {selectedProposal.client_approval ? selectedProposal.client_approval.charAt(0).toUpperCase() + selectedProposal.client_approval.slice(1) : 'Not Sent'}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedProposal.work_titles && selectedProposal.work_titles.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Work Titles</Text>
                    {selectedProposal.work_titles.map((workTitle, index) => (
                      <View key={index} style={styles.stepItem}>
                        <Text style={styles.stepName}>{index + 1}. {workTitle.name}</Text>
                        {workTitle.description && (
                          <Text style={styles.stepDescription}>{workTitle.description}</Text>
                        )}
                        <View style={styles.priceInfo}>
                          {workTitle.quantity && (
                            <Text style={styles.stepPrice}>
                              Quantity: {workTitle.quantity}
                            </Text>
                          )}
                          {workTitle.unit_price && (
                            <Text style={styles.stepPrice}>
                              Unit Price: {formatCurrency(parseFloat(workTitle.unit_price) || 0)}
                            </Text>
                          )}
                          {workTitle.price && (
                            <Text style={styles.stepPrice}>
                              Price: {formatCurrency(parseFloat(workTitle.price) || 0)}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                  {selectedProposal.general_conditions && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>General Conditions:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedProposal.general_conditions)}
                      </Text>
                    </View>
                  )}
                  {selectedProposal.supervision_fee && selectedProposal.supervision_fee > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Supervision Fee:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedProposal.supervision_fee)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={styles.detailLabel}>Total Cost (Client Price):</Text>
                    <Text style={styles.detailValue}>
                      {formatCurrency(selectedProposal.total_cost || 0)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {activeTab === 'material' && selectedMaterialRequest && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Material Request Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Item Name:</Text>
                    <Text style={styles.detailValue}>{selectedMaterialRequest.item_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{selectedMaterialRequest.description}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Project:</Text>
                    <Text style={styles.detailValue}>{selectedMaterialRequest.project_name}</Text>
                  </View>
                  {selectedMaterialRequest.substep_name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Substep:</Text>
                      <Text style={styles.detailValue}>{selectedMaterialRequest.substep_name}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{selectedMaterialRequest.quantity}</Text>
                  </View>
                  {selectedMaterialRequest.unit && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Unit:</Text>
                      <Text style={styles.detailValue}>{selectedMaterialRequest.unit}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Delivery Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedMaterialRequest.delivery_date).toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedMaterialRequest.sub_contractor && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sub Contractor:</Text>
                      <Text style={styles.detailValue}>{selectedMaterialRequest.sub_contractor}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested by:</Text>
                    <Text style={styles.detailValue}>{selectedMaterialRequest.requested_by}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested at:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedMaterialRequest.requested_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedMaterialRequest.vendor_id && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vendor ID:</Text>
                      <Text style={styles.detailValue}>{selectedMaterialRequest.vendor_id}</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {activeTab === 'change-order' && selectedChangeOrder && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Change Order Information</Text>
                  <Text style={styles.detailTitle}>{selectedChangeOrder.title}</Text>
                  <Text style={styles.detailDescription}>{selectedChangeOrder.description}</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Project:</Text>
                    <Text style={styles.detailValue}>{selectedChangeOrder.project_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested by:</Text>
                    <Text style={styles.detailValue}>{selectedChangeOrder.requested_by}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedChangeOrder.requested_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[
                      styles.statusBadge,
                      selectedChangeOrder.status === 'approved' && styles.statusBadgeApproved,
                      selectedChangeOrder.status === 'rejected' && styles.statusBadgeRejected,
                      selectedChangeOrder.status === 'pending' && styles.statusBadgePending,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        selectedChangeOrder.status === 'approved' && styles.statusBadgeTextApproved,
                        selectedChangeOrder.status === 'rejected' && styles.statusBadgeTextRejected,
                        selectedChangeOrder.status === 'pending' && styles.statusBadgeTextPending,
                      ]}>
                        {selectedChangeOrder.status.charAt(0).toUpperCase() + selectedChangeOrder.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedChangeOrder.steps && selectedChangeOrder.steps.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Work Items</Text>
                    {selectedChangeOrder.steps.map((step, index) => (
                      <View key={step.id || index} style={styles.stepItem}>
                        <Text style={styles.stepName}>{index + 1}. {step.name}</Text>
                        {step.description && (
                          <Text style={styles.stepDescription}>{step.description}</Text>
                        )}
                        {step.price && (
                          <View style={styles.priceInfo}>
                            <Text style={styles.stepPrice}>
                              Price: {formatCurrency(step.price)}
                            </Text>
                            {step.sub_contractor_price && (
                              <Text style={styles.stepPrice}>
                                Sub Contractor Fee: {formatCurrency(step.sub_contractor_price)}
                              </Text>
                            )}
                            {step.price && step.sub_contractor_price && (
                              <Text style={[styles.stepPrice, styles.profitPrice]}>
                                Change Order Request Profit: {formatCurrency(step.price - step.sub_contractor_price)}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Comments Section */}
                <View style={styles.detailSection}>
                  <View style={styles.commentsSectionHeader}>
                    <View style={styles.commentsTitleContainer}>
                      <MessageSquare size={20} color="#236ecf" />
                      <Text style={styles.sectionTitle}>Comments</Text>
                    </View>
                    {userRole === 'admin' && (
                      <TouchableOpacity
                        style={styles.addCommentButton}
                        onPress={async () => {
                          if (!newChangeOrderComment.trim()) {
                            Alert.alert('Error', 'Please enter a comment');
                            return;
                          }
                          if (!selectedChangeOrder || !user) return;
                          
                          try {
                            await CommentService.addComment({
                              change_order_id: selectedChangeOrder.id,
                              user_id: user.id,
                              user_name: user.name,
                              comment: newChangeOrderComment.trim(),
                            });
                            
                            setNewChangeOrderComment('');
                            loadChangeOrderComments(selectedChangeOrder.id);
                          } catch (error) {
                            console.error('Error adding comment:', error);
                            Alert.alert('Error', 'Failed to add comment');
                          }
                        }}>
                        <Text style={styles.addCommentButtonText}>Add Comment</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {userRole === 'admin' && (
                    <View style={styles.commentInputContainer}>
                      <TextInput
                        style={styles.commentInput}
                        value={newChangeOrderComment}
                        onChangeText={setNewChangeOrderComment}
                        placeholder="Write a comment..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  )}

                  {loadingComments ? (
                    <View style={styles.loadingComments}>
                      <ActivityIndicator size="small" color="#236ecf" />
                      <Text style={styles.loadingCommentsText}>Loading comments...</Text>
                    </View>
                  ) : changeOrderComments.length > 0 ? (
                    <View style={styles.commentsList}>
                      {changeOrderComments.map((comment) => (
                        <View key={comment.id} style={styles.commentCard}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                            <Text style={styles.commentDate}>
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                          </View>
                          <Text style={styles.commentText}>{comment.comment}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyComments}>
                      <Text style={styles.emptyCommentsText}>No comments yet</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              {/* Admin can mark project as under review */}
              {activeTab === 'project' && selectedProject?.status === 'pending' && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={async () => {
                    try {
                      await ProjectService.updateProject(selectedProject.id, {
                        status: 'under_review',
                      });
                      const updatedProject = await ProjectService.getProjectById(selectedProject.id);
                      if (updatedProject) {
                        setSelectedProject(updatedProject);
                      }
                      await loadData();
                      Alert.alert('Success', 'Project marked as under review');
                    } catch (error) {
                      console.error('Error updating project status:', error);
                      Alert.alert('Error', 'Failed to update project status');
                    }
                  }}
                >
                  <Eye size={20} color="#ffffff" />
                  <Text style={styles.reviewButtonText}>Mark as Review</Text>
                </TouchableOpacity>
              )}

              {/* Sales can view but not approve projects - removed approval buttons */}

              {/* Admin actions - Reject, Change Request, Approve */}
              {/* Hide Reject and Change Request buttons for approved proposals */}
              {(activeTab === 'project' || activeTab === 'material' || activeTab === 'change-order' || (viewMode === 'sales-proposal' && selectedProposal?.management_approval !== 'approved')) && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => setShowRejectModal(true)}>
                  <XCircle size={20} color="#ffffff" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              )}

              {/* Change Request Button - Hide for approved proposals */}
              {(activeTab === 'project' || activeTab === 'material' || activeTab === 'change-order' || (viewMode === 'sales-proposal' && selectedProposal?.management_approval !== 'approved')) && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.changeRequestButton}
                  onPress={() => setShowChangeRequestModal(true)}>
                  <Edit size={20} color="#ffffff" />
                  <Text style={styles.changeRequestButtonText}>Change Request</Text>
                </TouchableOpacity>
              )}

              {/* Admin can approve */}
              {viewMode === 'sales-proposal' && selectedProposal && selectedProposal.management_approval !== 'approved' && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveProposal(selectedProposal)}>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'project' && viewMode !== 'sales-proposal' && selectedProject?.status !== 'approved' && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveProject(selectedProject!)}>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'material' && viewMode !== 'sales-proposal' && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveMaterialRequest(selectedMaterialRequest!)}>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'change-order' && viewMode !== 'sales-proposal' && userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveChangeOrder(selectedChangeOrder!)}>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
              )}

              {activeTab === 'project' && selectedProject?.status === 'approved' && selectedPMs.length > 0 && (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => handleAssignToPMs(selectedProject!)}>
                  <User size={20} color="#ffffff" />
                  <Text style={styles.assignButtonText}>Assign to PMs</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModal}>
            <Text style={styles.rejectModalTitle}>
              Reject {selectedItems.size > 0 ? `${selectedItems.size} Items` : viewMode === 'sales-proposal' ? 'Proposal' : activeTab === 'project' ? 'Project' : activeTab === 'material' ? 'Material Request' : 'Change Order'}
            </Text>
            <Text style={styles.rejectModalMessage}>
              Please provide a reason for rejection:
            </Text>
            
            <TextInput
              style={styles.rejectInput}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter rejection reason..."
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.rejectModalActions}>
              <TouchableOpacity
                style={styles.cancelRejectButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}>
                <Text style={styles.cancelRejectText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmRejectButton}
                onPress={() => {
                  if (selectedItems.size > 0) {
                    confirmBatchReject();
                  } else {
                    if (viewMode === 'sales-proposal' && selectedProposal) {
                      handleRejectProposal(selectedProposal);
                    } else if (activeTab === 'project') {
                      handleRejectProject();
                    } else if (activeTab === 'material') {
                      handleRejectMaterialRequest();
                    } else {
                      handleRejectChangeOrder();
                    }
                  }
                }}>
                <Text style={styles.confirmRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Request Modal */}
      <Modal
        visible={showChangeRequestModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.changeRequestModal}>
            <Text style={styles.changeRequestModalTitle}>
              Request Changes for {viewMode === 'sales-proposal' ? 'Proposal' : activeTab === 'project' ? 'Project' : activeTab === 'material' ? 'Material Request' : 'Change Order'}
            </Text>
            <Text style={styles.changeRequestModalMessage}>
              Please provide details about what changes are needed:
            </Text>
            
            <TextInput
              style={styles.changeRequestInput}
              value={changeRequestReason}
              onChangeText={setChangeRequestReason}
              placeholder="Enter change request details..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.changeRequestModalActions}>
              <TouchableOpacity
                style={styles.cancelChangeRequestButton}
                onPress={() => {
                  setShowChangeRequestModal(false);
                  setChangeRequestReason('');
                }}>
                <Text style={styles.cancelChangeRequestText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmChangeRequestButton}
                onPress={() => {
                  if (viewMode === 'sales-proposal' && selectedProposal) {
                    handleChangeRequestProposal();
                  } else if (activeTab === 'project') {
                    handleChangeRequestProject();
                  } else if (activeTab === 'material') {
                    handleChangeRequestMaterialRequest();
                  } else {
                    handleChangeRequestChangeOrder();
                  }
                }}>
                <Text style={styles.confirmChangeRequestText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Approval Success Modal */}
      <Modal
        visible={showApprovalSuccessModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.approvalSuccessModal}>
            <View style={styles.approvalSuccessIcon}>
              <CheckCircle size={64} color="#22c55e" />
            </View>
            <Text style={styles.approvalSuccessTitle}>Approved!</Text>
            <Text style={styles.approvalSuccessMessage}>
              "{approvedItemName}" has been successfully approved.
            </Text>
            <TouchableOpacity
              style={styles.approvalSuccessButton}
              onPress={() => {
                setShowApprovalSuccessModal(false);
                setShowDetailModal(false);
              }}>
              <Text style={styles.approvalSuccessButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like teams
  },
  header: {
    backgroundColor: '#1e40af', // Darker blue header
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  selectionContainer: {
    flexDirection: 'row',
    gap: 20,
    padding: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  selectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  selectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e40af', // Darker blue like team tabs
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    backgroundColor: '#236ecf',
  },
  activeTab: {
    backgroundColor: '#ffcc00', // Yellow active tab
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff', // White text on blue
  },
  activeTabText: {
    color: '#236ecf', // Blue text on yellow
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
    fontWeight: '500',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 18,
    color: '#ffffff', // White text on blue background
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff', // White text on blue background
    textAlign: 'center',
  },
  approvalCard: {
    backgroundColor: '#ffffff',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  budgetBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  dateBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  statusBadgeApproved: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeRejected: {
    backgroundColor: '#fee2e2',
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeReview: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadgeTextApproved: {
    color: '#16a34a',
  },
  statusBadgeTextRejected: {
    color: '#dc2626',
  },
  statusBadgeTextPending: {
    color: '#d97706',
  },
  statusBadgeTextReview: {
    color: '#d97706',
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
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  totalRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  stepItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  stepName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceInfo: {
    marginTop: 8,
    gap: 4,
  },
  stepPriceContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  finalPriceRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 0,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  stepPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  stepBudgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
    marginLeft: 8,
    maxWidth: 100,
  },
  grossProfitAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  finalPriceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
  },
  profitPrice: {
    color: '#236ecf',
    fontWeight: '700',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  // (removed duplicate stepName/stepDescription; keep earlier definitions above)
  childStepsContainer: {
    marginTop: 8,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  childStepItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  childStepName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  childStepDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  commissionSection: {
    marginBottom: 16,
  },
  commissionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  commissionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#ffffff',
  },
  budgetCalculation: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pmBudgetRow: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    marginTop: 8,
  },
  pmBudgetLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pmBudgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  pmOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  selectedPMOption: {
    backgroundColor: '#f0f9ff',
    borderColor: '#236ecf',
  },
  pmOptionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectedPMOptionText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  selectedIndicator: {
    fontSize: 16,
    color: '#236ecf',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  changeRequestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  changeRequestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  assignButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  assignButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sendApprovalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  sendApprovalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  reviewBadgeText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  rejectModalMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  rejectModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelRejectButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelRejectText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmRejectButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRejectText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  changeRequestModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  changeRequestModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  changeRequestModalMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  changeRequestInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  changeRequestModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelChangeRequestButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelChangeRequestText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmChangeRequestButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmChangeRequestText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  approvalSuccessModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  approvalSuccessIcon: {
    marginBottom: 20,
  },
  approvalSuccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  approvalSuccessMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  approvalSuccessButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  approvalSuccessButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Comments UI (used in project + change order detail modals)
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  commentsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addCommentButton: {
    backgroundColor: '#ffcc00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCommentButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  commentInputContainer: {
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  loadingComments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  loadingCommentsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  commentsList: {
    gap: 10,
  },
  commentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyComments: {
    paddingVertical: 16,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  // Web-specific styles
  webToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 400,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    padding: 0,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  rejectBatchButton: {
    backgroundColor: '#ef4444',
  },
  batchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  selectAllButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  // Table styles
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCheckbox: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  tableActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 120,
    justifyContent: 'flex-end',
  },
  tableActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveActionButton: {
    backgroundColor: '#f0fdf4',
  },
  rejectActionButton: {
    backgroundColor: '#fef2f2',
  },
});
