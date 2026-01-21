import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  TextInput,
  Platform,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, X, Calendar, Trash2, Trash, Send, Check } from 'lucide-react-native';
import { Swipeable, SwipeableProps } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectService } from '@/services/projectService';
import { UserService } from '@/services/userService';
import { InvoiceService } from '@/services/invoiceService';
import { ProposalService } from '@/services/proposalService';
import { PermissionService } from '@/services/permissionService';
import { Project, SubContractor } from '@/types';
import HamburgerMenu from '@/components/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProjectsScreen() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key: string) => key);
  const authContext = useAuth();
  const userRole = authContext?.userRole || 'admin';
  const user = authContext?.user || null;
  const params = useLocalSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>(
    (params.tab as 'active' | 'completed') || 'active'
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCreatingFromProposal, setIsCreatingFromProposal] = useState(false);
  const [projectJustCreated, setProjectJustCreated] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const cardAnimation = useRef(new Animated.Value(1)).current;
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  
  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showClientSelectModal, setShowClientSelectModal] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', temporaryPassword: '' });
  const [canCreateProject, setCanCreateProject] = useState(false);
  const [clientBudget, setClientBudget] = useState<string>(''); // Client-facing budget from proposal
  // Admin budget settings
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
  const [availablePMs, setAvailablePMs] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [grossProfitRate, setGrossProfitRate] = useState(28.5);
  const [grossProfitRateText, setGrossProfitRateText] = useState('28.5');
  const [pmBudget, setPmBudget] = useState(0);
  
  // Check permissions for creating projects
  useEffect(() => {
    const checkCreatePermission = async () => {
      if (userRole === 'admin') {
        setCanCreateProject(true);
        return;
      }
      
      try {
        const permission = await PermissionService.getPagePermission('projects', userRole as 'admin' | 'pm' | 'sales' | 'office' | 'client');
        setCanCreateProject(permission === 'edit');
      } catch (error) {
        console.error('Error checking permission:', error);
        // Default: only admin can create
        setCanCreateProject(false);
      }
    };
    
    checkCreatePermission();
  }, [userRole]);
  
  // Generate random temporary password
  const generateTempPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };
  
  // Category options
  const categories = ['Residential', 'Commercial'];
  
  // Delete Project Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    client_id: '',
    client_name: '',
    start_date: '',
    deadline: '',
    total_budget: '',
    manager_id: '',
    project_address: '',
    project_street: '',
    project_city: '',
    project_state: '',
    project_zip: '',
    general_conditions: '',
    general_conditions_percentage: '18.5',
    supervision_fee: '',
    supervision_type: 'part-time' as 'full-time' | 'part-time' | 'none',
    supervision_weeks: '',
    discount: '',
    project_description: '',
  });
  const [selectedClients, setSelectedClients] = useState<Array<{ id: string; name: string }>>([]);
  const [workTitles, setWorkTitles] = useState<Array<{ name: string; description: string; quantity: string; unit_price: string; price: string }>>([]);
  const [newWorkTitle, setNewWorkTitle] = useState({ name: '', description: '', quantity: '', unit_price: '', price: '' });
  const [editingWorkTitleIndex, setEditingWorkTitleIndex] = useState<number | null>(null);
  const [invoiceLoaded, setInvoiceLoaded] = useState(false);
  const [showWorkTitleModal, setShowWorkTitleModal] = useState(false);
  const [selectedWorkTitleFromList, setSelectedWorkTitleFromList] = useState<string>('');
  
  // Predefined work titles list
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

  // Calculate total budget from work titles, general conditions, and supervision fee
  useEffect(() => {
    // Calculate work titles total (including current form work title if valid)
    let workTitlesTotal = workTitles.reduce((sum, workTitle) => {
      const quantity = parseFloat(workTitle.quantity) || 0;
      const unitPrice = parseFloat(workTitle.unit_price) || 0;
      const price = quantity * unitPrice;
      return sum + price;
    }, 0);
    
    // Add current work title if it's valid
    if (newWorkTitle.name && newWorkTitle.quantity && newWorkTitle.unit_price) {
      const quantity = parseFloat(newWorkTitle.quantity) || 0;
      const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
      if (quantity > 0 && unitPrice > 0) {
        workTitlesTotal += quantity * unitPrice;
      }
    }
    
    // Calculate supervision fee based on type and weeks
    const supervisionWeeks = parseFloat(newProject.supervision_weeks) || 0;
    const supervisionRate = newProject.supervision_type === 'full-time' ? 1450 : newProject.supervision_type === 'part-time' ? 725 : 0;
    const supervisionFee = (supervisionWeeks > 0 && newProject.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
    const generalConditionsPercentageInput = newProject.general_conditions_percentage.trim();
    const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
    const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
    const discount = parseFloat(newProject.discount) || 0;
    const total = workTitlesTotal + generalConditions + supervisionFee - discount;
    setNewProject(prev => ({ ...prev, total_budget: total > 0 ? total.toString() : '', general_conditions: generalConditions.toString(), supervision_fee: supervisionFee.toString() }));
  }, [workTitles, newWorkTitle.quantity, newWorkTitle.unit_price, newProject.general_conditions_percentage, newProject.supervision_fee, newProject.supervision_type, newProject.supervision_weeks, newProject.discount]);

  useEffect(() => {
    loadProjects();
    // Load clients if user can create projects
    if (userRole === 'admin' || userRole === 'sales' || canCreateProject) {
      loadClients();
    }
    
    // Auto-refresh every 5 minutes (300000ms) while page is open
    const interval = setInterval(() => {
      loadProjects();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [canCreateProject]);

  // Update active tab when params change
  useEffect(() => {
    if (params.tab === 'completed' || params.tab === 'active') {
      setActiveTab(params.tab as 'active' | 'completed');
    }
  }, [params.tab]);

  // Load invoice data if fromInvoice parameter exists
  useEffect(() => {
    const fromInvoiceId = params.fromInvoice as string;
    if (fromInvoiceId && !invoiceLoaded && (userRole === 'admin' || userRole === 'sales') && clients.length > 0) {
      loadInvoiceData(fromInvoiceId);
    }
  }, [params.fromInvoice, invoiceLoaded, userRole, clients.length]);

  // Load proposal data if fromProposal parameter exists
  useEffect(() => {
    const fromProposalId = params.fromProposal as string;
    // Don't open form again if project was just created
    if (projectJustCreated) {
      return;
    }
    if (fromProposalId && !invoiceLoaded && (userRole === 'admin' || userRole === 'sales')) {
      // Set creating from proposal mode immediately
      setIsCreatingFromProposal(true);
      // Load clients first if not loaded, then load proposal data
      const loadData = async () => {
        if (clients.length === 0) {
          await loadClients();
        }
        // Wait a bit for clients to be set, then load proposal data
        setTimeout(() => {
          loadProposalData(fromProposalId);
        }, 100);
      };
      loadData();
    }
  }, [params.fromProposal, invoiceLoaded, userRole, projectJustCreated]);

  // Mobile detection
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      return;
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isMobileWidth = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileWidth || isMobileUA);
      
      const handleResize = () => {
        if (typeof window !== 'undefined') {
          const mobileWidth = window.innerWidth <= 768;
          const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            window.navigator.userAgent || ''
          );
          setIsMobile(mobileWidth || mobileUA);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize);
        }
      };
    }
  }, []);

  // Reload projects when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      try {
        const firebaseProjects = await ProjectService.getProjects();
        
        // Filter projects based on user role
        let filteredProjects = firebaseProjects;
        if (userRole === 'pm') {
          // PM can only see projects they are assigned to
          // assigned_pms contains PM IDs, so we check by user.id
          filteredProjects = firebaseProjects.filter(project => 
            project.assigned_pms?.includes(user?.id || '')
          );
        } else if (userRole === 'client') {
          // Client can only see their own projects (by client_id or client_name)
          filteredProjects = firebaseProjects.filter(project => 
            project.client_id === user?.id || project.client_name === user?.name
          );
        }
        
        // Sort projects by created_at (newest first)
        const sortedProjects = (filteredProjects || []).sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Ensure we always set projects array, even if empty
        setProjects(sortedProjects);
        
        // Haptic feedback on mobile
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (firebaseError) {
        console.error('Firebase error loading projects:', firebaseError);
        setProjects([]);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadProjects();
  };

  // Delete project handlers
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Close swipeable if open
    swipeableRefs.current[project.id]?.close();
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await ProjectService.deleteProject(projectToDelete.id);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setShowDeleteModal(false);
        // Reload projects first to ensure state is updated
        await loadProjects();
        setProjectToDelete(null);
        // Show success modal after projects are reloaded
        setShowDeleteSuccessModal(true);
      } catch (error) {
        console.error('Error deleting project:', error);
        setShowDeleteModal(false);
        setProjectToDelete(null);
        Alert.alert('Error', 'Failed to delete project');
        // Reload projects even on error to ensure UI is updated
        await loadProjects();
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    }
  };

  const cancelDeleteProject = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleSendProjectForApproval = async (projectId: string) => {
    try {
      // Update project status to under_review if it's pending
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        Alert.alert('Error', 'Project not found');
        return;
      }

      if (project.status === 'pending') {
        await ProjectService.updateProject(projectId, {
          status: 'under_review',
        });
        await loadProjects();
        Alert.alert('Success', 'Project sent for admin approval');
      } else {
        Alert.alert('Info', 'Project is already sent for approval');
      }
    } catch (error) {
      console.error('Error sending project for approval:', error);
      Alert.alert('Error', 'Failed to send project for approval');
    }
  };

  // Swipe actions for mobile
  const renderRightActions = (project: Project) => {
    if (Platform.OS === 'web' || (userRole !== 'admin' && userRole !== 'sales')) {
      return null;
    }

    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.swipeDeleteButton}
          onPress={() => handleDeleteProject(project)}
        >
          <Trash2 size={24} color="#ffffff" />
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const loadClients = async () => {
    try {
      const allUsers = await UserService.getAllUsers();
      const clientUsers = allUsers.filter(u => u.role === 'client');
      setClients(clientUsers);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    }
  };

  const loadPMs = async () => {
    try {
      const allUsers = await UserService.getAllUsers();
      const pmUsers = allUsers.filter(u => u.role === 'pm').map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));
      setAvailablePMs(pmUsers);
    } catch (error) {
      console.error('Error loading PMs:', error);
      setAvailablePMs([]);
    }
  };

  // Company Profit % is `rate` (e.g. 28.5). PM Budget is the remaining % (100 - rate).
  const calculatePMBudget = (totalBudget: number, companyProfitRate: number): number => {
    const pmRate = Math.max(0, Math.min(100, 100 - companyProfitRate));
    return (totalBudget * pmRate) / 100;
  };

  // Toggle PM selection
  const togglePMSelection = (pmId: string) => {
    setSelectedPMs(prev => {
      if (prev.includes(pmId)) {
        return prev.filter(id => id !== pmId);
      } else {
        return [...prev, pmId];
      }
    });
  };

  // Load PMs when admin opens create modal
  useEffect(() => {
    if (showCreateModal && userRole === 'admin') {
      loadPMs();
    }
  }, [showCreateModal, userRole]);

  // Calculate PM budget when total budget or gross profit rate changes
  useEffect(() => {
    if (userRole === 'admin' && showCreateModal) {
      // Use total_budget from newProject state (already calculated)
      const totalBudgetValue = parseFloat(newProject.total_budget) || 0;
      
      if (totalBudgetValue > 0 && grossProfitRate > 0) {
        const calculatedPMBudget = calculatePMBudget(totalBudgetValue, grossProfitRate);
        setPmBudget(calculatedPMBudget);
      } else {
        setPmBudget(0);
      }
    } else {
      setPmBudget(0);
    }
  }, [newProject.total_budget, grossProfitRate, showCreateModal, userRole]);

  const loadInvoiceData = async (invoiceId: string) => {
    try {
      const invoice = await InvoiceService.getInvoiceById(invoiceId);
      // Allow project creation if invoice is paid or partial-paid
      if (invoice && (invoice.status === 'paid' || invoice.status === 'partial-paid')) {
        // Pre-fill client information
        if (invoice.client_id) {
          // Find client in clients list
          const client = clients.find(c => c.id === invoice.client_id);
          if (client) {
            setNewProject(prev => ({
              ...prev,
              client_id: invoice.client_id || '',
              client_name: invoice.client_name,
            }));
          } else {
            // Client ID exists but not found in clients list, just set name
            setNewProject(prev => ({
              ...prev,
              client_name: invoice.client_name,
            }));
          }
        } else {
          // New client from invoice
          setNewProject(prev => ({
            ...prev,
            client_name: invoice.client_name,
          }));
        }

        // Pre-fill work titles
        const invoiceWorkTitles = invoice.work_titles.map(wt => ({
          name: wt.name,
          description: wt.description || '',
          quantity: (wt.quantity || 0).toString(),
          unit_price: (wt.unit_price || 0).toString(),
          price: wt.price.toString(),
        }));
        setWorkTitles(invoiceWorkTitles);

        // Pre-fill general conditions and supervision fee
        setNewProject(prev => ({
          ...prev,
          general_conditions: invoice.general_conditions.toString(),
          supervision_fee: invoice.supervision_fee.toString(),
        }));

        // Open create modal
        setShowCreateModal(true);
        setInvoiceLoaded(true);
      }
    } catch (error) {
      console.error('Error loading invoice data:', error);
      Alert.alert('Error', 'Failed to load invoice data');
    }
  };

  const loadProposalData = async (proposalId: string) => {
    try {
      // Load clients if not already loaded
      if (clients.length === 0) {
        await loadClients();
      }
      
      // First, check if invoice exists and is paid/partial-paid
      const allInvoices = await InvoiceService.getInvoices();
      // Try to find invoice by proposal_id first
      let proposalInvoice = allInvoices.find(inv => inv.proposal_id === proposalId);
      
      // If not found by proposal_id, try to find by matching client info
      if (!proposalInvoice) {
        const proposal = await ProposalService.getProposalById(proposalId);
        if (proposal) {
          // Try to find invoice by matching client_id, client_name, or client_email
          proposalInvoice = allInvoices.find(inv => 
            (inv.client_id && proposal.client_id && inv.client_id === proposal.client_id) ||
            (inv.client_name && proposal.client_name && inv.client_name === proposal.client_name) ||
            (inv.client_email && proposal.client_email && inv.client_email.toLowerCase() === proposal.client_email.toLowerCase())
          );
        }
      }
      
      if (!proposalInvoice) {
        Alert.alert(
          'Invoice Required',
          'An invoice must be created for this proposal before creating a project. Please create an invoice first and mark it as paid or partial-paid.',
          [{ text: 'OK', onPress: () => {
            setIsCreatingFromProposal(false);
            router.back();
          }}]
        );
        return;
      }
      
      if (proposalInvoice.status !== 'paid' && proposalInvoice.status !== 'partial-paid') {
        Alert.alert(
          'Payment Required',
          `The invoice for this proposal is not paid yet. Current status: ${proposalInvoice.status}. Please mark the invoice as paid or partial-paid before creating a project.`,
          [{ text: 'OK', onPress: () => {
            setIsCreatingFromProposal(false);
            router.back();
          }}]
        );
        return;
      }
      
      const proposal = await ProposalService.getProposalById(proposalId);
      if (proposal && proposal.management_approval === 'approved' && proposal.client_approval === 'approved') {
        // Pre-fill client information
        let selectedClient: { id: string; name: string } | null = null;
        if (proposal.client_id) {
          // Find client in clients list
          const client = clients.find(c => c.id === proposal.client_id);
          if (client) {
            selectedClient = { id: client.id, name: client.name };
            setSelectedClients([selectedClient]);
            setNewProject(prev => ({
              ...prev,
              client_id: proposal.client_id || '',
              client_name: proposal.client_name,
            }));
          } else {
            // Client ID exists but not found in clients list, just set name
            setNewProject(prev => ({
              ...prev,
              client_name: proposal.client_name,
            }));
          }
        } else {
          // New client from proposal - try to find by name or email
          const clientByName = clients.find(c => c.name === proposal.client_name);
          const clientByEmail = proposal.client_email ? clients.find(c => c.email === proposal.client_email) : null;
          const foundClient = clientByName || clientByEmail;
          
          if (foundClient) {
            selectedClient = { id: foundClient.id, name: foundClient.name };
            setSelectedClients([selectedClient]);
            setNewProject(prev => ({
              ...prev,
              client_id: foundClient.id,
              client_name: foundClient.name,
            }));
          } else {
            // Client not found, just set name
            setNewProject(prev => ({
              ...prev,
              client_name: proposal.client_name,
            }));
          }
        }

        // Pre-fill category
        setNewProject(prev => ({
          ...prev,
          category: proposal.category || '',
        }));

        // Pre-fill address information
        setNewProject(prev => ({
          ...prev,
          project_address: proposal.client_address || '',
          project_street: proposal.client_street || '',
          project_city: proposal.client_city || '',
          project_state: proposal.client_state || '',
          project_zip: proposal.client_zip || '',
        }));

        // Pre-fill discount
        if (proposal.discount !== undefined && proposal.discount > 0) {
          setNewProject(prev => ({
            ...prev,
            discount: proposal.discount!.toString(),
          }));
        }

        // Pre-fill work titles from proposal
        const proposalWorkTitles = proposal.work_titles.map(wt => ({
          name: wt.name,
          description: wt.descriptions && wt.descriptions.length > 0 
            ? wt.descriptions.join(', ') 
            : (wt.description || ''),
          quantity: (wt.quantity || 0).toString(),
          unit_price: (wt.unit_price || 0).toString(),
          price: wt.price.toString(),
        }));
        setWorkTitles(proposalWorkTitles);

        // Calculate work titles total for percentage calculation
        const workTitlesTotal = proposal.work_titles.reduce((sum, wt) => {
          return sum + (wt.quantity * wt.unit_price);
        }, 0);

        // Calculate general conditions percentage from proposal data
        // general_conditions = (work_titles_total + supervision_fee) * percentage / 100
        // percentage = (general_conditions * 100) / (work_titles_total + supervision_fee)
        let generalConditionsPercentage = '18.5'; // default
        if (workTitlesTotal > 0 || proposal.supervision_fee > 0) {
          const totalBeforeGC = workTitlesTotal + proposal.supervision_fee;
          if (totalBeforeGC > 0 && proposal.general_conditions > 0) {
            const calculatedPercentage = (proposal.general_conditions * 100) / totalBeforeGC;
            generalConditionsPercentage = calculatedPercentage.toFixed(2);
          }
        }

        // Calculate supervision_type and supervision_weeks from supervision_fee
        let supervisionType: 'full-time' | 'part-time' | 'none' = 'none';
        let supervisionWeeks = '';
        if (proposal.supervision_fee > 0) {
          // Try to determine if it's full-time or part-time
          // Check if supervision_fee is divisible by 1450 (full-time) or 725 (part-time)
          const fullTimeWeeks = proposal.supervision_fee / 1450;
          const partTimeWeeks = proposal.supervision_fee / 725;
          
          // Check which one gives a whole number (or close to it)
          const fullTimeRounded = Math.round(fullTimeWeeks);
          const partTimeRounded = Math.round(partTimeWeeks);
          
          if (Math.abs(fullTimeWeeks - fullTimeRounded) < 0.01 && fullTimeRounded > 0) {
            supervisionType = 'full-time';
            supervisionWeeks = fullTimeRounded.toString();
          } else if (Math.abs(partTimeWeeks - partTimeRounded) < 0.01 && partTimeRounded > 0) {
            supervisionType = 'part-time';
            supervisionWeeks = partTimeRounded.toString();
          } else {
            // Default to part-time if can't determine
            supervisionType = 'part-time';
            supervisionWeeks = partTimeRounded > 0 ? partTimeRounded.toString() : Math.ceil(partTimeWeeks).toString();
          }
        }

        // Pre-fill all project fields from proposal
        // client_budget = proposal.total_cost (what client sees)
        // total_budget will be calculated from work titles (internal budget)
        setNewProject(prev => ({
          ...prev,
          general_conditions: proposal.general_conditions.toString(),
          general_conditions_percentage: generalConditionsPercentage,
          supervision_fee: proposal.supervision_fee.toString(),
          supervision_type: supervisionType,
          supervision_weeks: supervisionWeeks,
          // Store proposal total_cost as client_budget (will be saved separately)
          project_description: proposal.description || '',
        }));
        
        // Store client_budget separately (from proposal)
        setClientBudget(proposal.total_cost.toString());

        // Open create modal - user only needs to fill title and description
        setShowCreateModal(true);
        setInvoiceLoaded(true);
      }
    } catch (error) {
      console.error('Error loading proposal data:', error);
      setIsCreatingFromProposal(false);
      Alert.alert('Error', 'Failed to load proposal data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  // Close modal and reset form
  const handleCloseCreateModal = () => {
    const fromProposalId = params.fromProposal as string;
    setShowCreateModal(false);
    // Reset all form states
    setNewProject({
      title: '',
      description: '',
      category: '',
      client_id: '',
      client_name: '',
      start_date: '',
      deadline: '',
      total_budget: '',
      manager_id: '',
      project_address: '',
      project_street: '',
      project_city: '',
      project_state: '',
      project_zip: '',
      general_conditions: '',
      general_conditions_percentage: '18.5',
      supervision_fee: '',
      supervision_type: 'part-time',
      supervision_weeks: '',
      discount: '',
      project_description: '',
    });
    setWorkTitles([]);
    setNewWorkTitle({ name: '', description: '', quantity: '', unit_price: '', price: '' });
    setSelectedClients([]);
    setClientBudget('');
    setInvoiceLoaded(false);
    setIsCreatingFromProposal(false);
    setProjectJustCreated(false);
    // If came from proposal, go back to proposals page
    if (fromProposalId) {
      router.replace('/proposals');
    }
  };

  const handleAddWorkTitle = () => {
    if (!newWorkTitle.name || !newWorkTitle.quantity || !newWorkTitle.unit_price) {
      Alert.alert('Error', 'Please fill in work title name, quantity, and unit price');
      return;
    }
    
    const quantity = parseFloat(newWorkTitle.quantity) || 0;
    const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
    const calculatedPrice = (quantity * unitPrice).toString();
    
    setWorkTitles(prev => [...prev, { 
      name: newWorkTitle.name, 
      description: newWorkTitle.description || '',
      quantity: newWorkTitle.quantity,
      unit_price: newWorkTitle.unit_price,
      price: calculatedPrice,
    }]);
    setNewWorkTitle({ name: '', description: '', quantity: '', unit_price: '', price: '' });
    setSelectedWorkTitleFromList('');
  };


  const handleRemoveWorkTitle = (index: number) => {
    setWorkTitles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewClient = async () => {
    if (!newClient.name || !newClient.email) {
      Alert.alert('Error', 'Please fill in name and email fields');
      return;
    }

    if (!newClient.temporaryPassword || newClient.temporaryPassword.length < 6) {
      Alert.alert('Error', 'Please provide a temporary password (minimum 6 characters)');
      return;
    }

    // Check if email already exists
    const existingClient = clients.find(c => c.email === newClient.email);
    if (existingClient) {
      Alert.alert('Error', 'A client with this email already exists');
      return;
    }

    try {
      // Save current admin user email and password before creating new user
      const currentUser = auth.currentUser;
      const currentUserEmail = currentUser?.email;
      
      // Try to get admin password from AsyncStorage (if remember me was used)
      let adminPassword: string | null = null;
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        const savedPassword = await AsyncStorage.getItem('saved_password');
        const rememberMe = await AsyncStorage.getItem('remember_me');
        
        // If remember me is active and email matches, use saved password
        if (rememberMe === 'true' && savedEmail === currentUserEmail && savedPassword) {
          adminPassword = savedPassword;
        }
      } catch (error) {
        console.log('Could not retrieve admin password from storage:', error);
      }
      
      // Create client in Firebase Auth with temporary password
      const { AuthService } = await import('@/services/authService');
      await AuthService.signUp(newClient.email, newClient.temporaryPassword, {
        name: newClient.name,
        role: 'client',
        phone: newClient.phone || undefined,
      });
      
      // Restore admin session if password is available
      if (adminPassword && currentUserEmail) {
        try {
          // Sign out the new user
          await signOut(auth);
          
          // Sign in the admin again to restore admin session
          await signInWithEmailAndPassword(auth, currentUserEmail, adminPassword);
          console.log('Admin session restored successfully');
        } catch (restoreError: any) {
          console.error('Error restoring admin session:', restoreError);
        }
      }
      
      // Reload clients
      await loadClients();
      
      // Set the newly created client as selected
      const allUsers = await UserService.getAllUsers();
      const newClientUser = allUsers.find(u => u.email === newClient.email && u.role === 'client');
      if (newClientUser) {
        setNewProject(prev => ({
          ...prev,
          client_id: newClientUser.id,
          client_name: newClientUser.name
        }));
      }
      
      const tempPassword = newClient.temporaryPassword; // Save before clearing
      
      // Close modal and reset form
      setShowNewClientModal(false);
      setNewClient({ name: '', email: '', phone: '', temporaryPassword: '' });
      
      // Generate login URL
      const appUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://bluecrew-app.netlify.app';
      const loginUrl = `${appUrl}/auth/login`;
      
      Alert.alert(
        'Success',
        `Client created successfully!\n\nEmail: ${newClient.email}\nTemporary Password: ${tempPassword}\n\nLogin URL: ${loginUrl}\n\nPlease share these credentials with the client.`,
        Platform.OS === 'web' ? [
          {
            text: 'Copy Password',
            onPress: () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(tempPassword);
                Alert.alert('Copied', 'Password copied to clipboard');
              }
            }
          },
          { text: 'OK' }
        ] : [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error creating client:', error);
      Alert.alert('Error', error.message || 'Failed to create client');
    }
  };

  const handleCreateProject = async () => {
    // Check if there's a work title in the form that hasn't been added yet
    let finalWorkTitles = [...workTitles];
    if (newWorkTitle.name && newWorkTitle.quantity && newWorkTitle.unit_price) {
      // Auto-add the current work title if it's valid
      const quantity = parseFloat(newWorkTitle.quantity) || 0;
      const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
      if (quantity > 0 && unitPrice > 0) {
        const calculatedPrice = (quantity * unitPrice).toString();
        finalWorkTitles.push({
          name: newWorkTitle.name,
          description: newWorkTitle.description || '',
          quantity: newWorkTitle.quantity,
          unit_price: newWorkTitle.unit_price,
          price: calculatedPrice,
        });
      }
    }
    
    if (finalWorkTitles.length === 0) {
      Alert.alert('Error', 'Please add at least one work title');
      return;
    }

    // Collect all missing required fields
    const missingFields: string[] = [];
    
    if (!newProject.title || !newProject.title.trim()) {
      missingFields.push('Project Title');
    }
    if (!newProject.category) {
      missingFields.push('Category');
    }
    if (selectedClients.length === 0) {
      missingFields.push('Clients');
    }
    if (!newProject.start_date) {
      missingFields.push('Start Date');
    }
    if (!newProject.deadline) {
      missingFields.push('Deadline');
    }
    if (!newProject.project_street || !newProject.project_street.trim()) {
      missingFields.push('Street Address');
    }
    if (!newProject.project_city || !newProject.project_city.trim()) {
      missingFields.push('City');
    }
    if (!newProject.project_state || !newProject.project_state.trim()) {
      missingFields.push('State');
    }
    if (!newProject.project_zip || !newProject.project_zip.trim()) {
      missingFields.push('ZIP Code');
    }

    // Show detailed error message if any fields are missing
    if (missingFields.length > 0) {
      Alert.alert(
        'Required Fields Missing',
        `Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if project is created from proposal - if so, verify invoice is paid
    const fromProposalId = params.fromProposal as string;
    if (fromProposalId) {
      try {
        // Get invoice for this proposal
        const allInvoices = await InvoiceService.getInvoices();
        const proposalInvoice = allInvoices.find(inv => inv.proposal_id === fromProposalId);
        
        if (!proposalInvoice) {
          Alert.alert(
            'Invoice Required',
            'An invoice must be created and paid before creating a project from this proposal. Please ensure the invoice is created and marked as paid or partial-paid.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        if (proposalInvoice.status !== 'paid' && proposalInvoice.status !== 'partial-paid') {
          Alert.alert(
            'Payment Required',
            `The invoice for this proposal is not paid yet. Current status: ${proposalInvoice.status}. Please mark the invoice as paid or partial-paid before creating a project.`,
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (invoiceError) {
        console.error('Error checking invoice:', invoiceError);
        Alert.alert('Error', 'Failed to verify invoice status. Please try again.');
        return;
      }
    }

    try {
      // Build full address string for backward compatibility
      const fullAddress = `${newProject.project_street}, ${newProject.project_city}, ${newProject.project_state} ${newProject.project_zip}`;
      
      // Calculate internal budget from work titles
      const workTitlesTotal = finalWorkTitles.reduce((sum, wt) => {
        const quantity = parseFloat(wt.quantity) || 0;
        const unitPrice = parseFloat(wt.unit_price) || 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      const supervisionWeeks = parseFloat(newProject.supervision_weeks) || 0;
      const supervisionRate = newProject.supervision_type === 'full-time' ? 1450 : newProject.supervision_type === 'part-time' ? 725 : 0;
      const supervisionFee = (supervisionWeeks > 0 && newProject.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
      const generalConditionsPercentage = parseFloat(newProject.general_conditions_percentage) || 18.5;
      const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
      const projectDiscount = parseFloat(newProject.discount) || 0;
      const internalBudget = workTitlesTotal + generalConditions + supervisionFee - projectDiscount;
      
      // Client budget from proposal (if exists), otherwise use internal budget
      const clientBudgetValue = clientBudget ? parseFloat(clientBudget) : internalBudget;
      
      // Build project data object, filtering out undefined values
      const projectDataRaw: any = {
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        client_id: selectedClients[0].id, // First client for backward compatibility
        client_name: selectedClients[0].name, // First client name for backward compatibility
        client_ids: selectedClients.map(c => c.id), // Array of client IDs
        client_names: selectedClients.map(c => c.name), // Array of client names
        start_date: newProject.start_date,
        deadline: newProject.deadline,
        status: 'pending',
        manager_id: newProject.manager_id || '',
        assigned_pms: [],
        progress_percentage: 0,
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
        is_job: false,
        total_budget: internalBudget, // Internal budget (real costs)
        client_budget: clientBudgetValue, // Client-facing budget (from proposal)
        project_address: fullAddress, // Full address for backward compatibility
        project_street: newProject.project_street,
        project_city: newProject.project_city,
        project_state: newProject.project_state,
        project_zip: newProject.project_zip,
        created_at: new Date().toISOString(),
      };
      
      // Add proposal_id if project is created from proposal
      const fromProposalId = params.fromProposal as string;
      if (fromProposalId) {
        projectDataRaw.proposal_id = fromProposalId;
      }
      
      // Only add optional fields if they have values
      if (projectDiscount > 0) {
        projectDataRaw.discount = projectDiscount;
      }
      if (newProject.project_description && newProject.project_description.trim()) {
        projectDataRaw.project_description = newProject.project_description.trim();
      }
      
      const projectData = projectDataRaw as Omit<Project, 'id' | 'steps' | 'comments' | 'schedules'>;

      const projectId = await ProjectService.createProject(projectData);
      
      // Add work titles as steps with descriptions as child steps
      if (finalWorkTitles.length > 0 && projectId) {
        for (let i = 0; i < finalWorkTitles.length; i++) {
          const workTitle = finalWorkTitles[i];
          const quantity = parseFloat(workTitle.quantity) || 0;
          const unitPrice = parseFloat(workTitle.unit_price) || 0;
          const calculatedPrice = quantity * unitPrice;
          
          const parentStepId = await ProjectService.addStep(projectId, {
            name: workTitle.name,
            description: workTitle.description || undefined,
            price: calculatedPrice,
            status: 'pending',
            order_index: i,
            step_type: 'parent',
            child_steps: [],
            created_at: new Date().toISOString(),
          });
        }
      }

      // Admin: Assign PMs and set budget if selected
      if (userRole === 'admin' && selectedPMs.length > 0) {
        const pmBudgetPerPM = pmBudget / selectedPMs.length; // Divide PM budget equally among selected PMs
        
        // Create pm_budgets object
        const pmBudgets: { [pmId: string]: number } = {};
        selectedPMs.forEach(pmId => {
          pmBudgets[pmId] = pmBudgetPerPM;
        });

        await ProjectService.updateProject(projectId, {
          assigned_pms: selectedPMs,
          pm_budgets: pmBudgets,
          gross_profit_rate: grossProfitRate,
          is_job: true,
          status: 'active',
        });
      }
      
      await loadProjects();
      setNewProject({
        title: '',
        description: '',
        category: '',
        client_id: '',
        client_name: '',
        start_date: '',
        deadline: '',
        total_budget: '',
        manager_id: '',
        project_address: '',
        project_street: '',
        project_city: '',
        project_state: '',
        project_zip: '',
        general_conditions: '',
        general_conditions_percentage: '18.5',
        supervision_fee: '',
        supervision_type: 'part-time',
        supervision_weeks: '',
        discount: '',
        project_description: '',
      });
      setWorkTitles([]);
      setNewWorkTitle({ name: '', description: '', quantity: '', unit_price: '', price: '' });
      setSelectedClients([]);
      setInvoiceLoaded(false); // Reset invoice loaded flag
      setIsCreatingFromProposal(false); // Reset creating from proposal flag
      setProjectJustCreated(true); // Mark that project was just created to prevent form reopening
      // Reset admin budget settings
      setSelectedPMs([]);
      setGrossProfitRate(28.5);
      setGrossProfitRateText('28.5');
      setPmBudget(0);
      
      // Close modal first
      setShowCreateModal(false);
      
      // Navigate to project details page directly (no work titles modal)
      // Use replace instead of push to prevent going back to create modal
      router.replace(`/(tabs)/project/${projectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project');
    }
  };

  const handleProjectSelect = (project: Project) => {
    try {
      // Navigate to project details
      router.push(`/(tabs)/project/${project.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to project details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'in_progress': return '#0ea5e9';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  const visibleProjects = (projects || []).filter(p =>
    activeTab === 'active' ? p.status !== 'completed' : p.status === 'completed'
  );

  const activeProjectsCount = (projects || []).filter(p => p.status !== 'completed').length;
  const completedProjectsCount = (projects || []).filter(p => p.status === 'completed').length;

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>Manage all your projects</Text>
          </View>
          {!isMobile && canCreateProject && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}>
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segmentItem, activeTab === 'active' && styles.segmentActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
              Active ({activeProjectsCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentItem, activeTab === 'completed' && styles.segmentActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.segmentText, activeTab === 'completed' && styles.segmentTextActive]}>
              Completed ({completedProjectsCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Button - Moved to content area for mobile */}
      {isMobile && canCreateProject && (
        <View style={styles.contentActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}>
            <Plus size={20} color="#1f2937" />
            <Text style={styles.addButtonText}>New Project</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffcc00"
              colors={['#ffcc00']}
            />
          ) : undefined
        }
      >
        {visibleProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No projects available</Text>
          </View>
        ) : (
          <View style={styles.projectsList}>
            {visibleProjects.map((project) => {
              const cardContent = (
                <Animated.View
                  style={{
                    transform: [{ scale: cardAnimation }]
                  }}>
                  <TouchableOpacity
                    style={styles.projectCard}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      handleProjectSelect(project);
                    }}
                    activeOpacity={0.7}>
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
                      </View>
                    </View>
                    <Text style={styles.projectClient}>Client: {project.client_name}</Text>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                    <View style={styles.projectFooter}>
                      <Text style={styles.projectDate}>
                        {new Date(project.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.projectProgress}>
                        {project.progress_percentage}% Complete
                      </Text>
                    </View>
                    {(userRole === 'sales' || userRole === 'pm') && (project.status === 'pending' || project.status === 'under_review') && (
                      <TouchableOpacity
                        style={styles.sendApprovalButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleSendProjectForApproval(project.id);
                        }}>
                        <Send size={16} color="#ffffff" />
                        <Text style={styles.sendApprovalButtonText}>Send for Approval</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );

              // Mobile: Swipeable for delete action
              if (Platform.OS !== 'web' && (userRole === 'admin' || userRole === 'sales')) {
                return (
                  <Swipeable
                    key={project.id}
                    ref={(ref) => {
                      swipeableRefs.current[project.id] = ref;
                    }}
                    renderRightActions={() => renderRightActions(project)}
                    overshootRight={false}
                    onSwipeableOpen={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                    }}
                  >
                    {cardContent}
                  </Swipeable>
                );
              }

              // Web: No swipeable
              return <View key={project.id}>{cardContent}</View>;
            })}
          </View>
        )}
      </ScrollView>

      {/* Create Project Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCreateModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TouchableOpacity onPress={handleCloseCreateModal}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter project title"
                value={newProject.title}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, title: text }))}
              />
            </View>

            {(userRole === 'admin' || userRole === 'sales') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Internal Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter internal notes (optional)"
                  value={newProject.description}
                  onChangeText={(text) => setNewProject(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.inputText, !newProject.category && styles.placeholderText]}>
                  {newProject.category || 'Select category'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Clients *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowClientSelectModal(true)}
              >
                <Text style={[styles.inputText, selectedClients.length === 0 && styles.placeholderText]}>
                  {selectedClients.length > 0 
                    ? selectedClients.map(c => c.name).join(', ')
                    : 'Select Clients *'}
                </Text>
              </TouchableOpacity>
              {selectedClients.length > 0 && (
                <View style={styles.selectedClientsList}>
                  {selectedClients.map((client, index) => (
                    <View key={client.id} style={styles.selectedClientTag}>
                      <Text style={styles.selectedClientTagText}>{client.name}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newSelected = selectedClients.filter((_, i) => i !== index);
                          setSelectedClients(newSelected);
                          if (newSelected.length > 0) {
                            setNewProject(prev => ({
                              ...prev,
                              client_id: newSelected[0].id,
                              client_name: newSelected[0].name
                            }));
                          } else {
                            setNewProject(prev => ({
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
                  value={newProject.start_date}
                  onChange={(e) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
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
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.datePickerText}>
                      {newProject.start_date || 'Select Start Date'}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={newProject.start_date ? new Date(newProject.start_date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setNewProject(prev => ({ ...prev, start_date: formattedDate }));
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
                  value={newProject.deadline}
                  onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
                  min={newProject.start_date || new Date().toISOString().split('T')[0]}
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
                    onPress={() => setShowDeadlinePicker(true)}
                  >
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.datePickerText}>
                      {newProject.deadline || 'Select Deadline'}
                    </Text>
                  </TouchableOpacity>
                  {showDeadlinePicker && (
                    <DateTimePicker
                      value={newProject.deadline ? new Date(newProject.deadline) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={newProject.start_date ? new Date(newProject.start_date) : new Date()}
                      onChange={(event, selectedDate) => {
                        setShowDeadlinePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setNewProject(prev => ({ ...prev, deadline: formattedDate }));
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
                value={newProject.project_street}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, project_street: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                value={newProject.project_city}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, project_city: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter state"
                value={newProject.project_state}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, project_state: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ZIP code"
                value={newProject.project_zip}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, project_zip: text }))}
                keyboardType="numeric"
              />
            </View>

            {/* Work Titles Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Titles *</Text>
              <Text style={styles.helperText}>At least one work title is required</Text>
              
              {/* Work Titles List */}
              {workTitles.length > 0 && (
                <View style={styles.workTitlesList}>
                  {workTitles.map((workTitle, index) => (
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
                        onPress={() => handleRemoveWorkTitle(index)}
                      >
                        <Trash size={18} color="#ef4444" />
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
                      onPress={() => setShowWorkTitleModal(true)}
                    >
                      <Text style={[styles.inputText, !newWorkTitle.name && styles.placeholderText]}>
                        {newWorkTitle.name || 'Select Work Title *'}
                      </Text>
                    </TouchableOpacity>
                    {selectedWorkTitleFromList === 'New' && (
                  <TextInput
                    style={styles.input}
                        placeholder="Enter custom work title *"
                    value={newWorkTitle.name}
                    onChangeText={(text) => setNewWorkTitle(prev => ({ ...prev, name: text }))}
                  />
                    )}
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Work Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter work description"
                      value={newWorkTitle.description}
                      onChangeText={(text) => setNewWorkTitle(prev => ({ ...prev, description: text }))}
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
                          value={newWorkTitle.quantity}
                          onChange={(e) => {
                            const text = e.target.value;
                            setNewWorkTitle(prev => {
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
                          value={newWorkTitle.quantity}
                          onChangeText={(text) => {
                            setNewWorkTitle(prev => {
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
                        value={newWorkTitle.unit_price}
                        onChange={(e) => {
                          const text = e.target.value;
                          setNewWorkTitle(prev => {
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
                        value={newWorkTitle.unit_price}
                        onChangeText={(text) => {
                          setNewWorkTitle(prev => {
                            const quantity = parseFloat(prev.quantity) || 0;
                            const unitPrice = parseFloat(text) || 0;
                            const calculatedPrice = (quantity * unitPrice).toString();
                            return { ...prev, unit_price: text, price: calculatedPrice };
                          });
                        }}
                      keyboardType="numeric"
                    />
                    )}
                  </View>

                  {newWorkTitle.quantity && newWorkTitle.unit_price && (
                    <View style={styles.calculatedPriceContainer}>
                      <Text style={styles.calculatedPriceLabel}>Price (Qty × Unit Price):</Text>
                      <Text style={styles.calculatedPriceValue}>
                        ${(parseFloat(newWorkTitle.quantity || '0') * parseFloat(newWorkTitle.unit_price || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <TouchableOpacity
                      style={styles.addWorkTitleButton}
                      onPress={handleAddWorkTitle}
                    >
                      <Plus size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
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
                    value={newProject.general_conditions_percentage}
                    onChange={(e) => setNewProject(prev => ({ ...prev, general_conditions_percentage: e.target.value }))}
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
                    value={newProject.general_conditions_percentage}
                    onChangeText={(text) => setNewProject(prev => ({ ...prev, general_conditions_percentage: text }))}
                    keyboardType="numeric"
                  />
                )}
                <Text style={styles.percentageLabel}>%</Text>
              </View>
              {(() => {
                const currentWorkTitleTotal = (() => {
                  const quantity = parseFloat(newWorkTitle.quantity) || 0;
                  const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
                  if (quantity > 0 && unitPrice > 0) {
                    return quantity * unitPrice;
                  }
                  return 0;
                })();
                const workTitlesTotal = workTitles.reduce((sum, workTitle) => {
                  const quantity = parseFloat(workTitle.quantity) || 0;
                  const unitPrice = parseFloat(workTitle.unit_price) || 0;
                  return sum + (quantity * unitPrice);
                }, 0);
                const totalWorkTitles = workTitlesTotal + currentWorkTitleTotal;
                const supervisionWeeks = parseFloat(newProject.supervision_weeks) || 0;
                const supervisionRate = newProject.supervision_type === 'full-time' ? 1450 : newProject.supervision_type === 'part-time' ? 725 : 0;
                const supervisionFee = (supervisionWeeks > 0 && newProject.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
                const discount = parseFloat(newProject.discount) || 0;
                const generalConditionsPercentageInput = newProject.general_conditions_percentage.trim();
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
                    newProject.supervision_type === 'none' && styles.selectedCategory
                  ]}
                  onPress={() => setNewProject(prev => ({ ...prev, supervision_type: 'none', supervision_weeks: '' }))}
                >
                  <Text style={[
                    styles.categoryText,
                    newProject.supervision_type === 'none' && styles.selectedCategoryText
                  ]}>
                    None
                  </Text>
                  {newProject.supervision_type === 'none' && (
                    <View style={styles.selectedIndicatorDot} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    newProject.supervision_type === 'full-time' && styles.selectedCategory
                  ]}
                  onPress={() => setNewProject(prev => ({ ...prev, supervision_type: 'full-time' }))}
                >
                  <Text style={[
                    styles.categoryText,
                    newProject.supervision_type === 'full-time' && styles.selectedCategoryText
                  ]}>
                    Full-Time ($1,450/week)
                  </Text>
                  {newProject.supervision_type === 'full-time' && (
                    <View style={styles.selectedIndicatorDot} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    newProject.supervision_type === 'part-time' && styles.selectedCategory
                  ]}
                  onPress={() => setNewProject(prev => ({ ...prev, supervision_type: 'part-time' }))}
                >
                  <Text style={[
                    styles.categoryText,
                    newProject.supervision_type === 'part-time' && styles.selectedCategoryText
                  ]}>
                    Part-Time ($725/week)
                  </Text>
                  {newProject.supervision_type === 'part-time' && (
                    <View style={styles.selectedIndicatorDot} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {newProject.supervision_type !== 'none' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Weeks *</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="number"
                    placeholder="Enter number of weeks"
                    value={newProject.supervision_weeks}
                    onChange={(e) => setNewProject(prev => ({ ...prev, supervision_weeks: e.target.value }))}
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
                    value={newProject.supervision_weeks}
                    onChangeText={(text) => setNewProject(prev => ({ ...prev, supervision_weeks: text }))}
                    keyboardType="numeric"
                  />
                )}
                {newProject.supervision_weeks && parseFloat(newProject.supervision_weeks) > 0 && (
                  <View style={styles.calculatedAmount}>
                    <Text style={styles.calculatedAmountLabel}>Supervision Fee:</Text>
                    <Text style={styles.calculatedAmountValue}>
                      ${((newProject.supervision_type === 'full-time' ? 1450 : newProject.supervision_type === 'part-time' ? 725 : 0) * parseFloat(newProject.supervision_weeks)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    value={newProject.discount}
                    onChange={(e) => setNewProject(prev => ({ ...prev, discount: e.target.value }))}
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
                  style={styles.input}
                    placeholder="Enter discount amount"
                    value={newProject.discount}
                    onChangeText={(text) => setNewProject(prev => ({ ...prev, discount: text }))}
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
                value={newProject.project_description}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, project_description: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Budget</Text>
              <TextInput
                style={[styles.input, styles.totalBudgetInput]}
                placeholder="Auto-calculated from work titles, general conditions, supervision fee, and discount"
                value={newProject.total_budget ? `$${parseFloat(newProject.total_budget).toLocaleString()}` : ''}
                editable={false}
              />
            </View>

            {/* Admin Budget Settings */}
            {userRole === 'admin' && (
              <View style={styles.inputGroup}>
                <Text style={styles.sectionTitle}>Assign to PMs & Budget Settings</Text>
                
                <View style={styles.commissionSection}>
                  <Text style={styles.commissionLabel}>Budget Rate (%)</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="28.5"
                      value={grossProfitRateText}
                      onChange={(e) => {
                        const text = e.target.value;
                        const cleanedText = text.replace(/[^0-9.]/g, '');
                        const parts = cleanedText.split('.');
                        const validText = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('')
                          : cleanedText;
                        
                        setGrossProfitRateText(validText);
                        
                        const rate = parseFloat(validText);
                        if (!isNaN(rate)) {
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
                          setGrossProfitRate(0);
                        }
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
                      style={styles.commissionInput}
                      value={grossProfitRateText}
                      onChangeText={(text) => {
                        const cleanedText = text.replace(/[^0-9.]/g, '');
                        const parts = cleanedText.split('.');
                        const validText = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('')
                          : cleanedText;
                        
                        setGrossProfitRateText(validText);
                        
                        const rate = parseFloat(validText);
                        if (!isNaN(rate)) {
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
                          setGrossProfitRate(0);
                        }
                      }}
                      keyboardType="decimal-pad"
                      placeholder="28.5"
                    />
                  )}
                </View>

                <View style={styles.budgetCalculation}>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Internal Budget:</Text>
                    <Text style={styles.budgetValue}>
                      {newProject.total_budget ? `$${parseFloat(newProject.total_budget).toLocaleString()}` : '$0'}
                    </Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Company Profit ({grossProfitRate}%):</Text>
                    <Text style={styles.budgetValue}>
                      {newProject.total_budget ? `$${((parseFloat(newProject.total_budget) * grossProfitRate) / 100).toLocaleString()}` : '$0'}
                    </Text>
                  </View>
                  <View style={[styles.budgetRow, styles.pmBudgetRow]}>
                    <Text style={styles.pmBudgetLabel}>PM Budget:</Text>
                    <Text style={styles.pmBudgetValue}>
                      ${pmBudget.toLocaleString()}
                    </Text>
                  </View>
                </View>
                
                {availablePMs.length > 0 && (
                  <>
                    <Text style={styles.label}>Select PMs (Optional)</Text>
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
                    {selectedPMs.length > 0 && (
                      <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Budget per PM:</Text>
                        <Text style={styles.budgetValue}>
                          ${(pmBudget / selectedPMs.length).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            <View style={styles.modalActionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCloseCreateModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreateProject}>
                <Text style={styles.submitButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Work Title Selection Modal */}
      <Modal
        visible={showWorkTitleModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Work Title</Text>
              <TouchableOpacity onPress={() => {
                setShowWorkTitleModal(false);
                if (selectedWorkTitleFromList !== 'New') {
                  setSelectedWorkTitleFromList('');
                }
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.categoryList}
              contentContainerStyle={styles.categoryListContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {predefinedWorkTitles.map((title) => (
                <TouchableOpacity
                  key={title}
                  style={[
                    styles.categoryOption,
                    selectedWorkTitleFromList === title && styles.selectedCategory
                  ]}
                  onPress={() => {
                    if (title === 'New') {
                      setSelectedWorkTitleFromList('New');
                      setNewWorkTitle(prev => ({ ...prev, name: '' }));
                      setShowWorkTitleModal(false);
                    } else {
                      setSelectedWorkTitleFromList(title);
                      setNewWorkTitle(prev => ({ ...prev, name: title }));
                      setShowWorkTitleModal(false);
                    }
                  }}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedWorkTitleFromList === title && styles.selectedCategoryText
                  ]}>
                    {title}
                  </Text>
                  {selectedWorkTitleFromList === title && title !== 'New' && (
                    <View style={styles.selectedIndicatorDot} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    newProject.category === category && styles.selectedCategory
                  ]}
                  onPress={() => {
                    setNewProject(prev => ({ ...prev, category }));
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryText,
                    newProject.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                  {newProject.category === category && (
                    <View style={styles.selectedIndicatorDot} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>


      {/* Client Selection Modal */}
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
                autoCapitalize="none"
              />
            </View>
            
            <ScrollView 
              style={styles.categoryList}
              contentContainerStyle={styles.categoryListContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {/* New Client Option - Always at top */}
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  styles.addClientButton
                ]}
                onPress={() => {
                  setShowClientSelectModal(false);
                  setShowNewClientModal(true);
                  setClientSearchQuery('');
                }}
              >
                <View style={styles.clientOptionContent}>
                  <Plus size={20} color="#236ecf" />
                  <Text style={[styles.addClientText, { marginLeft: 8 }]}>
                    New Client
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Existing Clients - Filtered and sorted */}
              {clients
                .filter(client => 
                  client.name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                  client.email?.toLowerCase().includes(clientSearchQuery.toLowerCase())
                )
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map((client) => {
                  const isSelected = selectedClients.some(c => c.id === client.id);
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
                          const newSelected = selectedClients.filter(c => c.id !== client.id);
                          setSelectedClients(newSelected);
                          if (newSelected.length > 0) {
                            setNewProject(prev => ({
                              ...prev,
                              client_id: newSelected[0].id,
                              client_name: newSelected[0].name
                            }));
                          } else {
                            setNewProject(prev => ({
                              ...prev,
                              client_id: '',
                              client_name: ''
                            }));
                          }
                        } else {
                          // Add client
                          const newSelected = [...selectedClients, { id: client.id, name: client.name }];
                          setSelectedClients(newSelected);
                          setNewProject(prev => ({
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
              style={[styles.doneButton, selectedClients.length === 0 && styles.doneButtonDisabled]}
              onPress={() => {
                if (selectedClients.length > 0) {
                  setShowClientSelectModal(false);
                  setClientSearchQuery('');
                }
              }}
              disabled={selectedClients.length === 0}
            >
              <Text style={[styles.doneButtonText, selectedClients.length === 0 && styles.doneButtonTextDisabled]}>
                Done ({selectedClients.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Client Modal */}
      <Modal
        visible={showNewClientModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Client</Text>
            <TouchableOpacity onPress={() => {
              setShowNewClientModal(false);
              setNewClient({ name: '', email: '', phone: '', temporaryPassword: '' });
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newClient.name}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, name: text }))}
                placeholder="Enter client name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={newClient.email}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, email: text }))}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={newClient.phone}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Temporary Password *</Text>
                <View style={styles.passwordActions}>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => setNewClient(prev => ({ ...prev, temporaryPassword: generateTempPassword() }))}
                  >
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                  {Platform.OS === 'web' && newClient.temporaryPassword && (
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(newClient.temporaryPassword);
                          Alert.alert('Copied', 'Password copied to clipboard');
                        }
                      }}
                    >
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={newClient.temporaryPassword}
                onChangeText={(text) => setNewClient(prev => ({ ...prev, temporaryPassword: text }))}
                placeholder="Enter temporary password (min 6 characters)"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddNewClient}>
              <Text style={styles.submitButtonText}>Add Client</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade">
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={cancelDeleteProject}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>Are you sure you want to delete this project?</Text>
            <Text style={styles.deleteMessage}>
              "{projectToDelete?.title}" will be permanently deleted. This action cannot be undone.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={cancelDeleteProject}>
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteProject}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Success Modal */}
      <Modal
        visible={showDeleteSuccessModal}
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
                setShowDeleteSuccessModal(false);
                setProjectToDelete(null);
                // Navigate to project list page
                router.push('/(tabs)/projects');
              }}>
              <Text style={styles.successButtonText}>OK</Text>
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
    backgroundColor: '#1e40af', // Darker blue header like teams
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like teams
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 28, // Increased font size like teams
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
  },
  contentActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  addButton: {
    backgroundColor: '#ffcc00', // Yellow button like teams
    width: Platform.OS === 'web' ? 40 : undefined,
    height: Platform.OS === 'web' ? 40 : undefined,
    borderRadius: Platform.OS === 'web' ? 20 : 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 0 : 16,
    paddingVertical: Platform.OS === 'web' ? 0 : 10,
    flexDirection: Platform.OS === 'web' ? 'column' : 'row',
    gap: Platform.OS === 'web' ? 0 : 6,
    alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    display: Platform.OS === 'web' ? 'none' : 'flex',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#236ecf', // Blue background like teams
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#ffcc00', // Yellow active tab like teams
    borderWidth: 1,
    borderColor: '#ffcc00',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff', // White text on blue
  },
  segmentTextActive: {
    color: '#1f2937', // Dark text on yellow
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf', // Blue background like teams
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 20 : 16, // Mobile: slightly less padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
    minHeight: Platform.OS !== 'web' ? 100 : undefined, // Mobile: minimum touch area
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  projectClient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  projectProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  sendApprovalButton: {
    backgroundColor: '#236ecf',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  sendApprovalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Mobile swipe styles
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  swipeDeleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  swipeDeleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
    borderBottomColor: '#ffcc00', // Yellow border like teams
  },
  modalTitle: {
    fontSize: 28, // Increased font size like teams
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#236ecf', // Blue background like teams
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffcc00', // Yellow text like teams
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  generateButton: {
    backgroundColor: '#236ecf',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  clientList: {
    gap: 8,
  },
  clientOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedClient: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
  },
  clientText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedClientText: {
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
  addClientButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addClientText: {
    fontSize: 16,
    color: '#236ecf',
    fontWeight: '600',
  },
  categoryModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 500,
    margin: 20,
    overflow: 'hidden',
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
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  // Client Selection Modal Styles
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
  clientOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientInfo: {
    flex: 1,
  },
  clientEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  workTitlesList: {
    marginBottom: 16,
    gap: 8,
  },
  workTitleItem: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workTitleInfo: {
    flex: 1,
  },
  workTitleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workTitleDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  workTitlePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  workTitleDetails: {
    marginTop: 8,
    gap: 4,
  },
  workTitleDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  subContractorInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#236ecf',
  },
  subContractorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  subContractorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
  },
  subContractorPrice: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
  },
  subContractorOptionContent: {
    flex: 1,
  },
  subContractorTrade: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    padding: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  quantityUnitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInputContainer: {
    flex: 1,
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
  calculatedPriceContainer: {
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
  calculatedPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  calculatedPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  removeWorkTitleButton: {
    padding: 8,
    marginLeft: 12,
  },
  addWorkTitleForm: {
    gap: 8,
    marginTop: 8,
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
  addWorkTitleButton: {
    backgroundColor: '#236ecf',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  workDescriptionsList: {
    marginTop: 8,
    marginBottom: 8,
    gap: 4,
  },
  workDescriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  removeDescriptionButton: {
    padding: 4,
    marginLeft: 8,
  },
  addDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
  },
  addDescriptionText: {
    fontSize: 14,
    color: '#236ecf',
    fontWeight: '500',
  },
  addDescriptionForm: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  descriptionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addDescButton: {
    flex: 1,
    backgroundColor: '#236ecf',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addDescButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelDescButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelDescButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  totalBudgetInput: {
    backgroundColor: '#f3f4f6',
    color: '#059669',
    fontWeight: '600',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ffcc00', // Yellow button like teams
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'web' ? 20 : 24,
    minHeight: 48,
  },
  submitButtonText: {
    color: '#1f2937', // Dark text on yellow button
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
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
    lineHeight: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
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
  selectedIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#236ecf',
  },
});
