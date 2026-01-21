import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshControl,
} from 'react-native';
import { Plus, X, CheckCircle, XCircle, Eye, FileText, DollarSign, Calendar, Trash, Download, Receipt, ArrowLeft, User, UserCheck, BarChart3, MessageSquare, Building2, Send, Edit } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Proposal, Invoice, Comment } from '@/types';
import { ProposalService } from '@/services/proposalService';
import { InvoiceService } from '@/services/invoiceService';
import { UserService } from '@/services/userService';
import { ProjectService } from '@/services/projectService';
import { PermissionService } from '@/services/permissionService';
import { usePagePermission } from '@/hooks/usePagePermission';
import { CommentService } from '@/services/commentService';
import HamburgerMenu from '@/components/HamburgerMenu';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, signInWithEmailAndPassword } from 'firebase/auth';

export default function ProposalsScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { canEdit: canEditProposals } = usePagePermission('proposals', userRole as 'admin' | 'pm' | 'sales' | 'office' | 'client');
  const [viewMode, setViewMode] = useState<'select' | 'project' | 'proposal-approval' | 'proposal-approval-project' | 'proposal-approval-sales' | 'invoice-approval' | 'invoice-approval-project' | 'invoice-approval-sales'>('project');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingProposals, setPendingProposals] = useState<Proposal[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupervisionTypeModal, setShowSupervisionTypeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [relatedProject, setRelatedProject] = useState<{ id: string; title: string } | null>(null);
  const [showInvoiceCheckModal, setShowInvoiceCheckModal] = useState(false);
  const [relatedInvoice, setRelatedInvoice] = useState<Invoice | null>(null);
  
  const [newProposal, setNewProposal] = useState({
    client_id: '',
    client_name: '',
    client_email: '',
    client_address: '',
    client_street: '',
    client_city: '',
    client_state: '',
    client_zip: '',
    category: '',
    general_conditions_percentage: '18.5',
    supervision_fee: '',
    supervision_type: 'part-time' as 'full-time' | 'part-time' | 'none',
    supervision_weeks: '',
    discount: '',
    description: '',
    proposal_date: '',
  });
  const [showProposalDatePicker, setShowProposalDatePicker] = useState(false);
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    temporaryPassword: '',
  });
  
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
  const [workTitles, setWorkTitles] = useState<Array<{ name: string; descriptions: string[]; quantity: string; unit_price: string; price: string }>>([]);
  const [newWorkTitle, setNewWorkTitle] = useState({ name: '', descriptions: [] as string[], quantity: '', unit_price: '', price: '' });
  const [editingWorkTitleIndex, setEditingWorkTitleIndex] = useState<number | null>(null);
  const [newDescription, setNewDescription] = useState('');
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

  const loadData = async () => {
    try {
      setLoading(true);
      await loadProposals();
      if (canEditProposals || userRole === 'admin' || userRole === 'sales') {
        await loadClients();
        await loadInvoices();
      } else if (userRole === 'client') {
        // Client can also see invoices related to their proposals
        await loadInvoices();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  // Load related project when proposal is selected
  useEffect(() => {
    if (selectedProposal && showDetailModal) {
      loadRelatedProject(selectedProposal.id);
      loadComments();
    }
  }, [selectedProposal?.id, showDetailModal]);

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    if (viewMode === 'proposal-approval-project' || viewMode === 'proposal-approval-sales' || 
        viewMode === 'invoice-approval-project' || viewMode === 'invoice-approval-sales') {
      loadPendingItems();
    }
  }, [viewMode]);

  useEffect(() => {
    if (selectedProposal) {
      loadComments();
    } else {
      setComments([]);
      setNewComment('');
    }
  }, [selectedProposal]);

  // Add CSS to hide number input spinners on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'no-spinner-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          input[type="number"].no-spinner::-webkit-inner-spin-button,
          input[type="number"].no-spinner::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"].no-spinner {
            -moz-appearance: textfield;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  // Calculate total cost - this is used in the form display
  const totalCost = useMemo(() => {
    const workTitlesTotal = workTitles.reduce((sum, workTitle) => {
      const quantity = parseFloat(workTitle.quantity) || 0;
      const unitPrice = parseFloat(workTitle.unit_price) || 0;
      const price = quantity * unitPrice;
      return sum + price;
    }, 0);
    
    // Add current work title being entered (if valid)
    const currentWorkTitleTotal = (() => {
      const quantity = parseFloat(newWorkTitle.quantity) || 0;
      const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
      if (quantity > 0 && unitPrice > 0) {
        return quantity * unitPrice;
      }
      return 0;
    })();
    
    const totalWorkTitles = workTitlesTotal + currentWorkTitleTotal;
    // Calculate supervision fee based on type and weeks
    const supervisionWeeks = parseFloat(newProposal.supervision_weeks) || 0;
    const supervisionRate = newProposal.supervision_type === 'full-time' ? 1450 : newProposal.supervision_type === 'part-time' ? 725 : 0;
    const supervisionFee = (supervisionWeeks > 0 && newProposal.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
    const generalConditionsPercentageInput = newProposal.general_conditions_percentage.trim();
    const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
    const generalConditions = ((totalWorkTitles + supervisionFee) * generalConditionsPercentage) / 100;
    const discount = parseFloat(newProposal.discount) || 0;
    const total = totalWorkTitles + generalConditions + supervisionFee - discount;
    return total;
  }, [workTitles, newWorkTitle.quantity, newWorkTitle.unit_price, newProposal.supervision_weeks, newProposal.supervision_type, newProposal.general_conditions_percentage, newProposal.discount]);

  const loadProposals = async () => {
    try {
      const allProposals = await ProposalService.getProposals();
      // Filter based on user role
      if (userRole === 'client') {
        // Clients see only their proposals (sent to them for approval)
        // Match by client_name, client_id, or client_email
        const clientProposals = allProposals.filter(p => {
          const matchesName = p.client_name === user?.name;
          const matchesId = p.client_id === user?.id;
          const matchesEmail = p.client_email && user?.email && p.client_email.toLowerCase() === user.email.toLowerCase();
          
          return (matchesName || matchesId || matchesEmail) &&
            p.management_approval === 'approved' && // Only show proposals approved by management
            (p.client_approval === 'pending' || p.client_approval === 'request_changes' || p.client_approval === 'approved' || p.client_approval === 'rejected');
        });
        setProposals(clientProposals);
      } else {
        setProposals(allProposals);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      Alert.alert('Error', 'Failed to load proposals');
      throw error;
    }
  };

  const loadClients = async () => {
    try {
      const allUsers = await UserService.getAllUsers();
      const clientUsers = allUsers.filter(u => u.role === 'client');
      setClients(clientUsers);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const allInvoices = await InvoiceService.getInvoices();
      // Filter invoices for clients - only show invoices related to their proposals
      if (userRole === 'client') {
        const clientInvoices = allInvoices.filter(inv => 
          inv.client_id === user?.id || inv.client_name === user?.name
        );
        setInvoices(clientInvoices);
      } else {
        setInvoices(allInvoices);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const loadPendingItems = async () => {
    try {
      // Load proposals waiting for management approval
      const allProposals = await ProposalService.getProposals();
      const pending = allProposals.filter(p => p.management_approval === 'pending');
      setPendingProposals(pending);

      // Load invoices waiting for approval
      const allInvoices = await InvoiceService.getInvoices();
      const pendingInvs = allInvoices.filter(i => i.status === 'pending');
      setPendingInvoices(pendingInvs);
    } catch (error) {
      console.error('Error loading pending items:', error);
    }
  };

  const loadComments = async () => {
    if (!selectedProposal) return;
    try {
      const proposalComments = await CommentService.getCommentsByProposalId(selectedProposal.id);
      setComments(proposalComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadRelatedProject = async (proposalId: string) => {
    try {
      const allProjects = await ProjectService.getProjects();
      const project = allProjects.find(p => p.proposal_id === proposalId);
      if (project) {
        setRelatedProject({ id: project.id, title: project.title });
      } else {
        setRelatedProject(null);
      }
      
      // Also load related invoice
      const allInvoices = await InvoiceService.getInvoices();
      const invoice = allInvoices.find(i => i.proposal_id === proposalId);
      setRelatedInvoice(invoice || null);
    } catch (error) {
      console.error('Error loading related project:', error);
      setRelatedProject(null);
      setRelatedInvoice(null);
    }
  };

  const handleAddComment = async () => {
    if (!selectedProposal || !newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      const commentData: Omit<Comment, 'id'> = {
        proposal_id: selectedProposal.id,
        user_id: user?.id || '',
        user_name: user?.name || 'Unknown User',
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
      };

      await CommentService.addComment(commentData);
      await loadComments();
      setNewComment('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
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
      
      await loadClients();
      
      const allUsers = await UserService.getAllUsers();
      const clientUsers = allUsers.filter(u => u.role === 'client');
      const newClientUser = clientUsers.find(u => u.email === newClient.email);
      
      if (newClientUser) {
        setNewProposal(prev => ({
          ...prev,
          client_id: newClientUser.id,
          client_name: newClientUser.name,
          client_email: newClientUser.email || '',
        }));
      }

      const tempPassword = newClient.temporaryPassword; // Save before clearing
      
      setShowNewClientModal(false);
      setNewClient({ name: '', email: '', phone: '', temporaryPassword: '' });
      
      // Generate login URL
      const appUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://bluecrew-app.netlify.app';
      const loginUrl = `${appUrl}/auth/login`;
      
      Alert.alert(
        'Success',
        `Client added successfully!\n\nEmail: ${newClient.email}\nTemporary Password: ${tempPassword}\n\nLogin URL: ${loginUrl}\n\nPlease share these credentials with the client.`,
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
      console.error('Error adding client:', error);
      Alert.alert('Error', error.message || 'Failed to add client');
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
    
    setWorkTitles(prev => [...prev, { ...newWorkTitle, price: calculatedPrice }]);
    setNewWorkTitle({ name: '', descriptions: [], quantity: '', unit_price: '', price: '' });
    setSelectedWorkTitleFromList('');
    setNewDescription('');
  };

  const handleAddDescription = () => {
    if (!newDescription.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    // No limit on descriptions - users can add as many as needed
    setNewWorkTitle(prev => ({
      ...prev,
      descriptions: [...prev.descriptions, newDescription.trim()]
    }));
    setNewDescription('');
  };

  const handleRemoveDescription = (index: number) => {
    setNewWorkTitle(prev => ({
      ...prev,
      descriptions: prev.descriptions.filter((_, i) => i !== index)
    }));
  };

  const handleEditWorkTitle = (index: number) => {
    const workTitle = workTitles[index];
    setNewWorkTitle({
      name: workTitle.name,
      descriptions: workTitle.descriptions || [],
      quantity: workTitle.quantity,
      unit_price: workTitle.unit_price,
      price: workTitle.price,
    });
    setEditingWorkTitleIndex(index);
    setSelectedWorkTitleFromList('');
  };

  const handleUpdateWorkTitle = () => {
    if (!newWorkTitle.name || !newWorkTitle.quantity || !newWorkTitle.unit_price) {
      Alert.alert('Error', 'Please fill in work title name, quantity, and unit price');
      return;
    }
    
    if (editingWorkTitleIndex === null) return;
    
    const quantity = parseFloat(newWorkTitle.quantity) || 0;
    const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
    const calculatedPrice = (quantity * unitPrice).toString();
    
    setWorkTitles(prev => prev.map((wt, i) => 
      i === editingWorkTitleIndex 
        ? { ...newWorkTitle, price: calculatedPrice }
        : wt
    ));
    setNewWorkTitle({ name: '', descriptions: [], quantity: '', unit_price: '', price: '' });
    setEditingWorkTitleIndex(null);
    setSelectedWorkTitleFromList('');
    setNewDescription('');
  };

  const handleRemoveWorkTitle = (index: number) => {
    setWorkTitles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProposal = async () => {
    console.log('handleCreateProposal called');
    console.log('workTitles:', workTitles);
    console.log('newWorkTitle:', newWorkTitle);
    console.log('newProposal:', newProposal);
    
    // Check if there's a work title in the form that hasn't been added yet
    let finalWorkTitles = [...workTitles];
    if (newWorkTitle.name && newWorkTitle.quantity && newWorkTitle.unit_price && editingWorkTitleIndex === null) {
      // Auto-add the current work title if it's valid
      const quantity = parseFloat(newWorkTitle.quantity) || 0;
      const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
      if (quantity > 0 && unitPrice > 0) {
        const calculatedPrice = (quantity * unitPrice).toString();
        finalWorkTitles.push({
          name: newWorkTitle.name,
          descriptions: newWorkTitle.descriptions || [],
          quantity: newWorkTitle.quantity,
          unit_price: newWorkTitle.unit_price,
          price: calculatedPrice,
        });
      }
    }
    
    // Collect all missing required fields
    const missingFields: string[] = [];
    
    if (finalWorkTitles.length === 0) {
      missingFields.push('Work Titles (at least one required)');
    }
    if (!newProposal.client_name || !newProposal.client_name.trim()) {
      missingFields.push('Client Name');
    }
    if (!newProposal.client_street || !newProposal.client_street.trim()) {
      missingFields.push('Street Address');
    }
    if (!newProposal.client_city || !newProposal.client_city.trim()) {
      missingFields.push('City');
    }
    if (!newProposal.client_state || !newProposal.client_state.trim()) {
      missingFields.push('State');
    }
    if (!newProposal.client_zip || !newProposal.client_zip.trim()) {
      missingFields.push('ZIP Code');
    }
    if (!newProposal.category) {
      missingFields.push('Category');
    }
    if (!newProposal.proposal_date) {
      missingFields.push('Proposal Date');
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

    try {
      const workTitlesTotal = finalWorkTitles.reduce((sum, workTitle) => {
        const quantity = parseFloat(workTitle.quantity) || 0;
        const unitPrice = parseFloat(workTitle.unit_price) || 0;
        const price = quantity * unitPrice;
        return sum + price;
      }, 0);
      // Calculate supervision fee based on type and weeks
      const supervisionWeeks = parseFloat(newProposal.supervision_weeks) || 0;
      const supervisionRate = newProposal.supervision_type === 'full-time' ? 1450 : newProposal.supervision_type === 'part-time' ? 725 : 0;
      const supervisionFee = (supervisionWeeks > 0 && newProposal.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
      const generalConditionsPercentageInput = newProposal.general_conditions_percentage.trim();
      const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
      const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
      const discount = parseFloat(newProposal.discount) || 0;
      const proposalTotalCost = workTitlesTotal + generalConditions + supervisionFee - discount;

      // Only generate new proposal number if creating new proposal
      const proposalNumber = editingProposal ? editingProposal.proposal_number : await ProposalService.generateProposalNumber();
      
      // Preserve proposal_date when editing - use existing if form is empty
      let proposalDate: string;
      if (editingProposal) {
        proposalDate = newProposal.proposal_date && newProposal.proposal_date.trim() 
          ? new Date(newProposal.proposal_date).toISOString() 
          : editingProposal.proposal_date || editingProposal.created_at;
      } else {
        proposalDate = newProposal.proposal_date ? new Date(newProposal.proposal_date).toISOString() : new Date().toISOString();
      }
      
      // Preserve address fields when editing - use existing if form is empty
      let clientStreet = newProposal.client_street?.trim() || '';
      let clientCity = newProposal.client_city?.trim() || '';
      let clientState = newProposal.client_state?.trim() || '';
      let clientZip = newProposal.client_zip?.trim() || '';
      
      if (editingProposal) {
        // If editing and form fields are empty, use existing values
        if (!clientStreet && editingProposal.client_street) {
          clientStreet = editingProposal.client_street;
        }
        if (!clientCity && editingProposal.client_city) {
          clientCity = editingProposal.client_city;
        }
        if (!clientState && editingProposal.client_state) {
          clientState = editingProposal.client_state;
        }
        if (!clientZip && editingProposal.client_zip) {
          clientZip = editingProposal.client_zip;
        }
      }
      
      // Build full address string for backward compatibility
      const fullAddress = `${clientStreet}, ${clientCity}, ${clientState} ${clientZip}`;
      
      // Build proposal data object, filtering out undefined values
      const proposalDataRaw: any = {
        proposal_number: proposalNumber,
        client_name: newProposal.client_name,
        client_address: fullAddress, // Full address for backward compatibility
        client_street: clientStreet,
        client_city: clientCity,
        client_state: clientState,
        client_zip: clientZip,
        category: newProposal.category,
        work_titles: finalWorkTitles.map(wt => {
          const quantity = parseFloat(wt.quantity) || 0;
          const unitPrice = parseFloat(wt.unit_price) || 0;
          const calculatedPrice = quantity * unitPrice;
          const workTitle: any = {
            name: wt.name,
            quantity: quantity,
            unit: '', // Unit field removed
            unit_price: unitPrice,
            price: calculatedPrice,
          };
          // Add descriptions array if it has values
          if (wt.descriptions && wt.descriptions.length > 0) {
            workTitle.descriptions = wt.descriptions.filter(d => d && d.trim());
          }
          // Legacy support - if single description exists, convert to array
          if ((wt as any).description && (wt as any).description.trim()) {
            if (!workTitle.descriptions) {
              workTitle.descriptions = [];
            }
            workTitle.descriptions.push((wt as any).description.trim());
          }
          return workTitle;
        }),
        general_conditions: generalConditions,
        supervision_fee: supervisionFee,
        total_cost: proposalTotalCost,
        management_approval: 'pending',
        client_approval: null, // Not sent to client until admin approves
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
        proposal_date: proposalDate,
      };
      
      // Only add optional fields if they have values
      if (newProposal.client_id) {
        proposalDataRaw.client_id = newProposal.client_id;
      }
      if (newProposal.client_email && newProposal.client_email.trim()) {
        proposalDataRaw.client_email = newProposal.client_email.trim();
      }
      if (discount > 0) {
        proposalDataRaw.discount = discount;
      }
      if (newProposal.description && newProposal.description.trim()) {
        proposalDataRaw.description = newProposal.description.trim();
      }
      
      const proposalData = proposalDataRaw as Omit<Proposal, 'id' | 'created_at'>;

      if (editingProposal) {
        // Update existing proposal
        await ProposalService.updateProposal(editingProposal.id, proposalData);
        Alert.alert('Success', 'Proposal updated successfully');
        setEditingProposal(null);
      } else {
        // Create new proposal
        await ProposalService.createProposal(proposalData);
        Alert.alert('Success', 'Proposal created successfully');
      }
      
      await loadProposals();
      setShowCreateModal(false);
      setShowClientDropdown(false);
      setClientSearchQuery('');
      setNewProposal({
        client_id: '',
        client_name: '',
        client_email: '',
        client_address: '',
        client_street: '',
        client_city: '',
        client_state: '',
        client_zip: '',
        category: '',
        general_conditions_percentage: '18.5',
        supervision_fee: '',
        supervision_type: 'part-time',
        supervision_weeks: '',
        discount: '',
        description: '',
        proposal_date: '',
      });
      setShowProposalDatePicker(false);
      setWorkTitles([]);
      setNewWorkTitle({ name: '', descriptions: [], quantity: '', unit_price: '', price: '' });
      setNewDescription('');
    } catch (error) {
      console.error('Error creating proposal:', error);
      Alert.alert('Error', 'Failed to create proposal');
    }
  };

  const handleApproveByManagement = async (proposal: Proposal) => {
    try {
      await ProposalService.approveProposalByManagement(
        proposal.id,
        user?.id || '',
        user?.name || 'Unknown User'
      );
      
      // Automatically create invoice when both approvals are done
      // Check if client approval is already approved (management is the second approval)
      if (proposal.client_approval === 'approved') {
        try {
          // Reload proposal to get latest data
          const updatedProposal = await ProposalService.getProposalById(proposal.id);
          
          // Double check both approvals are done
          if (updatedProposal && updatedProposal.management_approval === 'approved' && updatedProposal.client_approval === 'approved') {
            const invoiceNumber = await InvoiceService.generateInvoiceNumber();
            const invoiceData: Omit<Invoice, 'id' | 'created_at'> = {
              invoice_number: invoiceNumber,
              proposal_id: updatedProposal.id,
              client_id: updatedProposal.client_id || undefined,
              client_name: updatedProposal.client_name,
              client_email: updatedProposal.client_email || undefined,
              client_address: updatedProposal.client_address,
              work_titles: updatedProposal.work_titles,
              general_conditions: updatedProposal.general_conditions,
              supervision_fee: updatedProposal.supervision_fee,
              total_cost: updatedProposal.total_cost,
              status: 'pending',
              created_by: user?.id || '',
              created_by_name: user?.name || 'Unknown User',
              invoice_date: new Date().toISOString(),
            };
            
            await InvoiceService.createInvoice(invoiceData);
            
            await loadProposals();
            setShowDetailModal(false);
            Alert.alert('Success', 'Proposal approved and invoice created automatically');
            return;
          }
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
          // Don't fail the approval if invoice creation fails
          Alert.alert('Warning', 'Proposal approved but invoice creation failed. Please create invoice manually.');
        }
      }
      
      await loadProposals();
      setShowDetailModal(false);
      Alert.alert('Success', 'Proposal approved by management');
    } catch (error) {
      console.error('Error approving proposal:', error);
      Alert.alert('Error', 'Failed to approve proposal');
    }
  };

  const handleRejectByManagement = async () => {
    if (!selectedProposal || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      await ProposalService.rejectProposalByManagement(
        selectedProposal.id,
        user?.id || '',
        user?.name || 'Unknown User',
        rejectionReason
      );
      await loadProposals();
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      Alert.alert('Success', 'Proposal rejected by management');
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      Alert.alert('Error', 'Failed to reject proposal');
    }
  };

  const handleApproveByClient = async (proposal: Proposal) => {
    try {
      await ProposalService.approveProposalByClient(proposal.id);
      
      // Automatically create invoice when both approvals are done
      // Check if management approval is already approved (client is the second approval)
      if (proposal.management_approval === 'approved') {
        try {
          // Reload proposal to get latest data
          const updatedProposal = await ProposalService.getProposalById(proposal.id);
          
          // Double check both approvals are done
          if (updatedProposal && updatedProposal.management_approval === 'approved' && updatedProposal.client_approval === 'approved') {
            const invoiceNumber = await InvoiceService.generateInvoiceNumber();
            const invoiceData: Omit<Invoice, 'id' | 'created_at'> = {
              invoice_number: invoiceNumber,
              proposal_id: updatedProposal.id,
              client_id: updatedProposal.client_id || undefined,
              client_name: updatedProposal.client_name,
              client_email: updatedProposal.client_email || undefined,
              client_address: updatedProposal.client_address,
              work_titles: updatedProposal.work_titles,
              general_conditions: updatedProposal.general_conditions,
              supervision_fee: updatedProposal.supervision_fee,
              total_cost: updatedProposal.total_cost,
              status: 'pending',
              created_by: user?.id || '',
              created_by_name: user?.name || 'Unknown User',
              invoice_date: new Date().toISOString(),
            };
            
            await InvoiceService.createInvoice(invoiceData);
            
            await loadProposals();
            setShowDetailModal(false);
            Alert.alert('Success', 'Proposal approved and invoice created automatically');
            return;
          }
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
          // Don't fail the approval if invoice creation fails
          Alert.alert('Warning', 'Proposal approved but invoice creation failed. Please create invoice manually.');
        }
      }
      
      await loadProposals();
      setShowDetailModal(false);
      Alert.alert('Success', 'Proposal approved');
    } catch (error) {
      console.error('Error approving proposal:', error);
      Alert.alert('Error', 'Failed to approve proposal');
    }
  };

  const handleRejectByClient = async () => {
    if (!selectedProposal || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      await ProposalService.rejectProposalByClient(selectedProposal.id, rejectionReason);
      await loadProposals();
      setShowDetailModal(false);
      setShowRejectModal(false);
      setRejectionReason('');
      Alert.alert('Success', 'Proposal rejected');
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      Alert.alert('Error', 'Failed to reject proposal');
    }
  };

  const handleDeleteProposal = async () => {
    if (!selectedProposal) return;

    try {
      await ProposalService.deleteProposal(selectedProposal.id);
      await loadProposals();
      setShowDetailModal(false);
      setShowDeleteModal(false);
      Alert.alert('Success', 'Proposal deleted successfully');
    } catch (error) {
      console.error('Error deleting proposal:', error);
      Alert.alert('Error', 'Failed to delete proposal');
    }
  };

  const handleUpdateReview = async (proposalId: string) => {
    try {
      // Find the proposal first
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) {
        Alert.alert('Error', 'Proposal not found');
        return;
      }

      // Use deleteField to remove sent_for_approval fields (Firestore doesn't accept null)
      // Update proposal - remove sent_for_approval fields so sales can edit again
      const proposalDocRef = doc(db, 'proposals', proposalId);
      await updateDoc(proposalDocRef, {
        sent_for_approval_at: deleteField(),
        sent_for_approval_by: deleteField(),
        sent_for_approval_by_name: deleteField(),
        management_approval: 'pending', // Keep as pending
      });

      // Create notification for the proposal creator (sales)
      try {
        const { NotificationService } = await import('@/services/notificationService');
        if (proposal.created_by) {
          await NotificationService.createNotification({
            user_id: proposal.created_by,
            type: 'proposal',
            title: 'Proposal Needs Update',
            message: `${proposal.proposal_number}: Admin requested updates. Please review and resubmit.`,
            related_id: proposalId,
            related_type: 'proposal',
            sender_id: user?.id || '',
            sender_name: user?.name || 'Admin',
            is_read: false,
          });
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the update if notification fails
      }

      // Reload proposals and update selected proposal
      await loadProposals();
      
      // Update selected proposal if it's the same one (don't close modal so user can see the change)
      if (selectedProposal && selectedProposal.id === proposalId) {
        const updatedProposal = await ProposalService.getProposalById(proposalId);
        if (updatedProposal) {
          setSelectedProposal(updatedProposal);
        }
      }
      
      // Don't close modal - let user see the change
      Alert.alert('Success', 'Proposal sent back for review. Sales can now update and resubmit.');
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert('Error', 'Failed to send proposal back for review');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateForAgreement = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} of ${month}, ${year}`;
  };

  const getApprovalStatus = (proposal: Proposal) => {
    if (proposal.management_approval === 'approved' && proposal.client_approval === 'approved') {
      return { text: 'Both Approved', color: '#059669' };
    }
    if (proposal.management_approval === 'rejected' || proposal.client_approval === 'rejected') {
      return { text: 'Rejected', color: '#ef4444' };
    }
    if (proposal.management_approval === 'approved') {
      return { text: 'Management Approved', color: '#10b981' };
    }
    if (proposal.client_approval === 'approved') {
      return { text: 'Client Approved', color: '#10b981' };
    }
    return { text: 'Pending', color: '#f59e0b' };
  };

  const handleSendProposalForApproval = async (proposalId: string) => {
    try {
      // Find the proposal
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) {
        Alert.alert('Error', 'Proposal not found');
        return;
      }

      // Update proposal to mark it as sent for approval
      await ProposalService.updateProposal(proposalId, {
        sent_for_approval_at: new Date().toISOString(),
        sent_for_approval_by: user?.id || '',
        sent_for_approval_by_name: user?.name || 'Unknown User',
      });

      // Create notification for admins
      try {
        const { NotificationService } = await import('@/services/notificationService');
        const { UserService } = await import('@/services/userService');
        const allUsers = await UserService.getAllUsers();
        const adminUsers = allUsers.filter(u => u.role === 'admin');
        const adminIds = adminUsers.map(admin => admin.id);

        if (adminIds.length > 0) {
          await NotificationService.createNotification({
            user_id: adminIds[0], // Send to first admin, or we could send to all
            type: 'proposal',
            title: 'New Proposal Pending Approval',
            message: `${proposal.proposal_number}: Proposal from ${proposal.client_name} is pending your approval`,
            related_id: proposalId,
            related_type: 'proposal',
            sender_id: user?.id || '',
            sender_name: user?.name || 'Unknown User',
            is_read: false,
          });

          // Send to all admins
          for (let i = 1; i < adminIds.length; i++) {
            await NotificationService.createNotification({
              user_id: adminIds[i],
              type: 'proposal',
              title: 'New Proposal Pending Approval',
              message: `${proposal.proposal_number}: Proposal from ${proposal.client_name} is pending your approval`,
              related_id: proposalId,
              related_type: 'proposal',
              sender_id: user?.id || '',
              sender_name: user?.name || 'Unknown User',
              is_read: false,
            });
          }
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the send for approval if notification fails
      }

      // Reload proposals to show updated status
      await loadProposals();
      Alert.alert('Success', 'Proposal sent for admin approval');
    } catch (error) {
      console.error('Error sending proposal for approval:', error);
      Alert.alert('Error', 'Failed to send proposal for approval');
    }
  };

  const handleExportPDF = async (proposal: Proposal) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Info', 'PDF export is only available on web');
      return;
    }

    try {
      let logoBase64 = '';
      try {
        const logoPath = '/assets/images/logo.png';
        const response = await fetch(logoPath);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          logoBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (error) {
        console.log('Logo not found, continuing without logo');
      }

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Proposal ${proposal.proposal_number}</title>
  <style>
    @media print { body { margin: 0; padding: 20px; } }
    body { font-family: 'Arial', 'Helvetica', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #236ecf; }
    .logo { max-width: 200px; max-height: 80px; object-fit: contain; }
    .proposal-title { font-size: 36px; font-weight: bold; color: #236ecf; margin: 0 0 10px 0; }
    .proposal-number { font-size: 18px; color: #666; margin: 0; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-box { flex: 1; padding: 15px; background-color: #f9fafb; border-radius: 8px; margin-right: 15px; }
    .info-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .info-value { font-size: 16px; font-weight: 600; color: #1f2937; }
    .section-title { font-size: 20px; font-weight: bold; color: #1f2937; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fff; }
    .table thead { background-color: #236ecf; color: #fff; }
    .table th { padding: 12px; text-align: left; font-weight: 600; font-size: 14px; }
    .table th.text-right { text-align: right; }
    .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .table tbody tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .work-item-name { font-weight: 600; color: #1f2937; margin-bottom: 4px; }
    .work-item-desc { font-size: 12px; color: #6b7280; font-style: italic; }
    .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #236ecf; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; font-size: 18px; font-weight: bold; }
    .total-label { color: #1f2937; }
    .total-value { color: #059669; font-size: 24px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo">` : ''}
    </div>
    <div class="header-info">
      <div class="proposal-title">PROPOSAL</div>
      <div class="proposal-number">${proposal.proposal_number}</div>
    </div>
  </div>
  <div class="info-section">
    <div class="info-box">
      <div class="info-label">Client</div>
      <div class="info-value">${proposal.client_name}</div>
      ${proposal.client_email ? `<div style="font-size: 14px; color: #6b7280; margin-top: 4px;">${proposal.client_email}</div>` : ''}
      <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">${proposal.client_address}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Proposal Date</div>
      <div class="info-value">${new Date(proposal.proposal_date).toLocaleDateString()}</div>
    </div>
  </div>
  <div class="section-title">Work Items</div>
  <table class="table">
    <thead>
      <tr>
        <th>Items</th>
        <th>Description</th>
        <th class="text-right">Qty/Unit</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Price</th>
      </tr>
    </thead>
    <tbody>
      ${proposal.work_titles.map(wt => `
        <tr>
          <td style="font-weight: 600; color: #1f2937; vertical-align: top; padding-top: 16px;">
            ${wt.name}
          </td>
          <td style="vertical-align: top; padding-top: 16px;">
            ${(wt.descriptions && wt.descriptions.length > 0) 
              ? wt.descriptions.map(desc => `<div style="margin-bottom: 8px; line-height: 1.5;">${desc}</div>`).join('')
              : (wt.description ? `<div style="line-height: 1.5;">${wt.description}</div>` : '')}
          </td>
          <td class="text-right" style="vertical-align: top; padding-top: 16px;">${wt.quantity || 0} ${wt.unit || ''}</td>
          <td class="text-right" style="vertical-align: top; padding-top: 16px;">${formatCurrency(wt.unit_price || 0)}</td>
          <td class="text-right" style="vertical-align: top; padding-top: 16px;">${formatCurrency(wt.price)}</td>
        </tr>
      `).join('')}
      <tr>
        <td style="font-weight: 600; color: #1f2937;">General Conditions</td>
        <td></td>
        <td class="text-right"></td>
        <td class="text-right"></td>
        <td class="text-right">${formatCurrency(proposal.general_conditions)}</td>
      </tr>
      ${proposal.supervision_fee > 0 ? `
      <tr>
        <td style="font-weight: 600; color: #1f2937;">Supervision Fee</td>
        <td></td>
        <td class="text-right"></td>
        <td class="text-right"></td>
        <td class="text-right">${formatCurrency(proposal.supervision_fee)}</td>
      </tr>
      ` : ''}
    </tbody>
  </table>
  <div class="total-section">
    <div class="total-row">
      <span class="total-label">Total Cost:</span>
      <span class="total-value">${formatCurrency(proposal.total_cost)}</span>
    </div>
  </div>

  <div style="page-break-before: always; margin-top: 50px; margin-bottom: 40px;">
    <h1 style="text-align: center; font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 30px;">CONSTRUCTION AGREEMENT</h1>
    
    <div style="margin-bottom: 30px; line-height: 1.8;">
      <p style="text-align: justify; margin-bottom: 20px;">
        THIS CONSTRUCTION AGREEMENT (the "Agreement") is made and entered into this 
        <strong>${formatDateForAgreement(proposal.proposal_date || proposal.created_at)}</strong>, 
        by and between:
      </p>
      
      <div style="margin-left: 20px; margin-bottom: 20px;">
        <p style="margin-bottom: 10px;"><strong>Owner:</strong></p>
        <p style="margin-left: 20px; margin-bottom: 15px;">
          <strong>${proposal.client_name}</strong><br/>
          (Hereinafter referred to as "Owner")
        </p>
        
        <p style="margin-bottom: 10px;"><strong>General Contractor:</strong></p>
        <p style="margin-left: 20px; margin-bottom: 15px;">
          <strong>Blue Crew Contractors LLC</strong><br/>
          (Hereinafter referred to as "Contractor")
        </p>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">RECITALS</h2>
      <div style="line-height: 1.8;">
        <p style="margin-bottom: 15px; text-align: justify;">
          WHEREAS, the Owner intends to construct improvements on the property located at 
          <strong>${proposal.client_address}</strong> (the "Property");
        </p>
        <p style="margin-bottom: 15px; text-align: justify;">
          WHEREAS, the Contractor is duly licensed and qualified to perform construction services in the state of Florida;
        </p>
        <p style="margin-bottom: 15px; text-align: justify;">
          WHEREAS, the Owner desires to engage the Contractor to perform the construction services described herein, and the Contractor agrees to provide such services under the terms and conditions set forth in this Agreement.
        </p>
      </div>
    </div>
  </div>

  <div class="section-title" style="margin-top: 30px;">1. SCOPE OF WORK</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>1.1</strong> This Construction Agreement ("Agreement") is entered into between <strong>${proposal.client_name}</strong> (the "Owner") and <strong>BLUE CREW</strong> (the "Contractor") for the construction project described in this proposal (the "Project").</p>
    <p><strong>1.2</strong> The Contractor agrees to perform the work in a professional manner and in accordance with the plans and specifications provided by the Owner or their designated representative.</p>
  </div>

  <div class="section-title">2. CONTRACT PRICE</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>2.1</strong> The Owner agrees to pay the Contractor a total sum of <strong>$${proposal.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (the "Contract Price") for the completion of the Project.</p>
    <p><strong>2.2</strong> Payment shall be made according to the payment schedule set forth below:</p>
    <ul style="margin-left: 20px; margin-top: 10px; margin-bottom: 10px;">
      <li>20% upon invoice approval</li>
      <li>20% upon permit approval</li>
      <li>20% upon wood delivery</li>
      <li>20% upon all exterior work complete</li>
      <li>10% upon completion of wall paint repair of structure complete</li>
      <li>5% upon completion of all tile work</li>
      <li>5% upon passing all inspections</li>
    </ul>
    <p><strong>2.3</strong> All payments shall be made in accordance with the terms specified and shall be subject to the Contractor's submission of appropriate invoices and lien waivers.</p>
  </div>

  <div class="section-title">3. CHANGES IN WORK</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>3.1</strong> The Owner may make changes in the Project by written change order. Changes may affect the Contract Price and/or time of completion. The Contractor shall promptly provide a written estimate of the cost and time impact of such changes.</p>
    <p><strong>3.2</strong> No change in the scope of work shall be valid unless made in writing and signed by both parties.</p>
  </div>

  <div class="section-title">4. WARRANTIES</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>4.1</strong> The Contractor warrants that all work performed under this Agreement will be of good quality, free from defects, and performed in accordance with applicable laws, codes, and standards.</p>
    <p><strong>4.2</strong> The Contractor shall correct any work not in accordance with this Agreement and shall remedy any defects in materials or workmanship for a period of 2 years from the date of final completion.</p>
  </div>

  <div class="section-title">5. INSURANCE AND BONDS</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>5.1</strong> The Contractor shall maintain adequate insurance coverage, including general liability insurance, workers' compensation insurance, and any other insurance required by law or deemed necessary by the Owner.</p>
    <p><strong>5.2</strong> The Contractor shall provide the Owner with certificates of insurance and performance and payment bonds, if required, prior to commencing work.</p>
  </div>

  <div class="section-title">6. INDEMNIFICATION</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>6.1</strong> The Contractor agrees to indemnify and hold harmless the Owner, its agents, and employees from any claims, damages, losses, or expenses arising out of or related to the Contractor's performance of the work, except to the extent caused by the Owner's own negligence or willful misconduct.</p>
  </div>

  <div class="section-title">7. TERMINATION</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>7.1</strong> Either party may terminate this Agreement for cause if the other party fails to perform its obligations and does not cure such failure within 14 days after written notice.</p>
    <p><strong>7.2</strong> The Owner may terminate this Agreement for convenience upon 14 days written notice. In such case, the Contractor shall be paid for all work completed to the date of termination.</p>
  </div>

  <div class="section-title">8. DISPUTE RESOLUTION</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>8.1</strong> Any disputes arising under this Agreement shall be resolved through mediation. If mediation fails, disputes may be resolved through arbitration in accordance with the rules of the American Arbitration Association.</p>
  </div>

  <div class="section-title">9. GOVERNING LAW</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>9.1</strong> This Agreement shall be governed by and construed in accordance with the laws of the State of Florida.</p>
  </div>

  <div class="section-title">10. ENTIRE AGREEMENT</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>10.1</strong> This Agreement, including all Exhibits and attachments, constitutes the entire agreement between the parties and supersedes all prior agreements or understandings, whether written or oral.</p>
  </div>

  <div class="section-title">11. FORCE MAJEURE</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p><strong>11.1</strong> Neither party shall be liable for delays or failures in performance due to events beyond their reasonable control, including but not limited to, acts of God, war, or labor disputes.</p>
  </div>

  <div class="section-title">GENERAL CONDITIONS AND FEES (18.5%)</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <p>The General Conditions and Fees (18.5%) include:</p>
    <ul style="margin-left: 20px; margin-top: 10px; margin-bottom: 10px;">
      <li>Contractor fees</li>
      <li>Coordination fee for third parties</li>
      <li>Emails to the client, designers and city as necessary</li>
      <li>Updates and follow ups</li>
      <li>Paperwork revisions</li>
      <li>Quality control</li>
      <li>Administration fees</li>
      <li>One of our project managers will be in charge of your apartment and responsible for part-time supervision.</li>
      <li>Project manager will schedule workers, inspections and deliveries</li>
      <li>Project manager will be attending inspections</li>
    </ul>
  </div>

  <div class="section-title">NOTES</div>
  <div style="margin-bottom: 20px; line-height: 1.6;">
    <ul style="margin-left: 20px; margin-top: 10px; margin-bottom: 10px;">
      <li>Architectural drawings and design services are not included.</li>
      <li>Final finishes excluded: decorative lighting, final painting, millwork/casework, and final flooring materials.</li>
      <li>Roofing upgrades or replacement are excluded.</li>
      <li>MEP final fixtures and specialty equipment are not included unless otherwise noted.</li>
      <li>Permit fees and review costs are excluded under this scope (covered under Master Permit).</li>
      <li>Landscaping and irrigation are not included in this proposal.</li>
      <li>Any unforeseen conditions or additional requirements will be handled by change order.</li>
    </ul>
  </div>

  <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #236ecf;">
    <div style="margin-top: 40px; margin-bottom: 30px;">
      <p style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">Wire instructions:</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>BLUE CREW</strong></p>
      <p style="margin: 5px 0; font-size: 14px;">1111 PARK CENTRE BLVD #201</p>
      <p style="margin: 5px 0; font-size: 14px;">MIAMI GARDENS FL 33169</p>
      <p style="margin: 5px 0; font-size: 14px;">&gt;ACC# 5125962927</p>
      <p style="margin: 5px 0; font-size: 14px;">&gt;ROUTING# 121000248 ( DOMESTIC )</p>
      <p style="margin: 5px 0; font-size: 14px;">&gt;SWIFT: WFBIUS6S ( INTERNATIONAL )</p>
      <p style="margin: 5px 0; font-size: 14px;">&gt;WELLS FARGO BANK, N.A</p>
      <p style="margin: 5px 0; font-size: 14px;">&gt;444 Miami Gardens</p>
      <p style="margin: 5px 0; font-size: 14px;">&gt;Miami FL 33169</p>
    </div>

    <!-- Disclaimer Section -->
    <div style="margin-top: 50px; padding: 20px; background-color: #f9fafb; border-left: 4px solid #236ecf; border-radius: 4px;">
      <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">DISCLAIMER</h3>
      <p style="font-size: 12px; color: #6b7280; line-height: 1.6; margin-bottom: 10px;">
        I understand that my name, email address and limited information will be used to complete the signature process and to enhance the user experience. 
        By signing this document with an electronic signature, I agree that such signature will be as valid as handwritten signatures and considered originals 
        to the extent allowed by applicable law. This electronic signature represents my intent to sign this proposal and indicates my agreement to the terms 
        and conditions set forth herein.
      </p>
      <p style="font-size: 12px; color: #6b7280; line-height: 1.6;">
        The parties acknowledge that this proposal, when signed electronically, shall have the same legal effect as if signed in ink. 
        This proposal is subject to the terms and conditions outlined above and becomes binding upon acceptance by both parties.
      </p>
    </div>

    <!-- Signature Section -->
    <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #236ecf;">
      <p style="margin-bottom: 30px; line-height: 1.6; font-size: 14px;">
        <strong>IN WITNESS WHEREOF</strong>, the parties hereto have executed this Proposal as of the day and year first above written.
      </p>
      
      <!-- Certified Checkbox -->
      <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="width: 20px; height: 20px; border: 2px solid #236ecf; border-radius: 4px; margin-top: 2px; flex-shrink: 0;"></div>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1f2937;">
            <strong>I certify</strong> that I have read and understood all terms and conditions of this proposal, 
            and I agree to be bound by them. I confirm that the information provided is accurate and complete.
          </p>
        </div>
      </div>
      
      <!-- Signature Fields -->
      <div style="margin-top: 40px;">
        <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px;">
          <div style="flex: 1;">
            <div style="border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; min-height: 50px;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1f2937;">Signature</p>
          </div>
          <div style="flex: 1;">
            <div style="border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; min-height: 50px;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1f2937;">Date</p>
          </div>
          <div style="flex: 1;">
            <div style="border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; min-height: 50px;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1f2937;">Print Name</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">${proposal.client_name}</p>
          </div>
        </div>
      </div>

      <!-- Contractor Signature -->
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <div style="flex: 1;">
            <div style="border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; min-height: 50px;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1f2937;">Contractor Signature</p>
          </div>
          <div style="flex: 1;">
            <div style="border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; min-height: 50px;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1f2937;">Date</p>
          </div>
          <div style="flex: 1;">
            <div style="border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; min-height: 50px;"></div>
            <p style="margin: 0; font-weight: bold; font-size: 14px; color: #1f2937;">Print Name</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Blue Crew Contractors LLC</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This is a proposal document. Please review and approve.</p>
    <p>Management Approval: ${proposal.management_approval === 'approved' ? '✓ Approved' : proposal.management_approval === 'rejected' ? '✗ Rejected' : 'Pending'}</p>
    <p>Client Approval: ${proposal.client_approval === 'approved' ? '✓ Approved' : proposal.client_approval === 'rejected' ? '✗ Rejected' : 'Pending'}</p>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proposal_${proposal.proposal_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF');
    }
  };

  const handleCreateInvoice = async (proposal: Proposal) => {
    if (proposal.management_approval !== 'approved' || proposal.client_approval !== 'approved') {
      Alert.alert('Error', 'Both management and client must approve the proposal before creating an invoice');
      return;
    }

    // Navigate to invoices page with proposal data
    router.push(`/(tabs)/invoices?fromProposal=${proposal.id}`);
  };

  const workTitlesTotal = workTitles.reduce((sum, wt) => {
    const quantity = parseFloat(wt.quantity) || 0;
    const unitPrice = parseFloat(wt.unit_price) || 0;
    return sum + (quantity * unitPrice);
  }, 0);
  const supervisionFee = parseFloat(newProposal.supervision_fee) || 0;
  const generalConditionsPercentageInput = newProposal.general_conditions_percentage.trim();
  const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
  const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
  const discount = parseFloat(newProposal.discount) || 0;
  const displayTotalCost = workTitlesTotal + generalConditions + supervisionFee - discount;


  // Show Proposal Approval selection screen (Project/Sales)
  if (viewMode === 'proposal-approval') {
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
              <Text style={styles.title}>Proposal Approval</Text>
              <Text style={styles.subtitle}>Choose category</Text>
            </View>
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
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('proposal-approval-project')}
              >
                <FileText size={48} color="#236ecf" />
                <Text style={styles.selectionTitle}>Project</Text>
                <Text style={styles.selectionDescription}>
                  Review project-related proposals
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('proposal-approval-sales')}
              >
                <BarChart3 size={48} color="#8b5cf6" />
                <Text style={styles.selectionTitle}>Sales</Text>
                <Text style={styles.selectionDescription}>
                  Review sales-related proposals
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  // Show Invoice Approval selection screen (Project/Sales)
  if (viewMode === 'invoice-approval') {
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
              <Text style={styles.title}>Invoice Approval</Text>
              <Text style={styles.subtitle}>Choose category</Text>
            </View>
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
            <View style={styles.selectionContainer}>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('invoice-approval-project')}
              >
                <FileText size={48} color="#236ecf" />
                <Text style={styles.selectionTitle}>Project</Text>
                <Text style={styles.selectionDescription}>
                  Review project-related invoices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectionCard}
                onPress={() => setViewMode('invoice-approval-sales')}
              >
                <BarChart3 size={48} color="#8b5cf6" />
                <Text style={styles.selectionTitle}>Sales</Text>
                <Text style={styles.selectionDescription}>
                  Review sales-related invoices
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
              if (viewMode === 'proposal-approval-project' || viewMode === 'proposal-approval-sales') {
                setViewMode('proposal-approval');
              } else if (viewMode === 'invoice-approval-project' || viewMode === 'invoice-approval-sales') {
                setViewMode('invoice-approval');
              } else {
                router.push('/sales');
              }
            }} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <View style={styles.headerTop}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {viewMode === 'proposal-approval-project' 
                  ? 'Proposal Approval - Project' 
                  : viewMode === 'proposal-approval-sales'
                  ? 'Proposal Approval - Sales'
                  : viewMode === 'invoice-approval-project'
                  ? 'Invoice Approval - Project'
                  : viewMode === 'invoice-approval-sales'
                  ? 'Invoice Approval - Sales'
                  : 'Proposals'}
              </Text>
              <Text style={styles.subtitle}>
                {viewMode === 'proposal-approval-project' || viewMode === 'proposal-approval-sales'
                  ? `Review and approve pending proposals (${pendingProposals.length})`
                  : viewMode === 'invoice-approval-project' || viewMode === 'invoice-approval-sales'
                  ? `Review and approve pending invoices (${pendingInvoices.length})`
                  : `${proposals.length} total proposals`}
              </Text>
            </View>
            {viewMode === 'project' && userRole !== 'client' && (canEditProposals || userRole === 'admin' || userRole === 'sales') && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateModal(true)}>
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {viewMode === 'proposal-approval-project' || viewMode === 'proposal-approval-sales' ? (
            // Proposal Approval View (Project or Sales)
            pendingProposals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending proposals</Text>
              </View>
            ) : (
              pendingProposals.map((proposal) => (
                <TouchableOpacity
                  key={proposal.id}
                  style={styles.proposalCard}
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
                    <Text style={styles.totalAmount}>{formatCurrency(proposal.total_cost)}</Text>
                    <Text style={styles.dateText}>
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : viewMode === 'invoice-approval-project' || viewMode === 'invoice-approval-sales' ? (
            // Invoice Approval View (Project or Sales)
            pendingInvoices.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending invoices</Text>
              </View>
            ) : (
              pendingInvoices.map((invoice) => (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.proposalCard}
                  onPress={() => {
                    // Navigate to invoice detail or show modal
                    router.push(`/invoices`);
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{invoice.invoice_number}</Text>
                      <Text style={styles.cardSubtitle}>Client: {invoice.client_name}</Text>
                      <Text style={styles.cardSubtitle}>Created by: {invoice.created_by_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                      <Text style={styles.statusText}>Pending</Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.totalAmount}>{formatCurrency(invoice.total_cost)}</Text>
                    <Text style={styles.dateText}>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )
          ) : (
            // Project View (existing)
            proposals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No proposals found</Text>
              </View>
            ) : (
              proposals.map((proposal) => {
                const status = getApprovalStatus(proposal);
                return (
                  <TouchableOpacity
                    key={proposal.id}
                    style={styles.proposalCard}
                    onPress={() => {
                      setSelectedProposal(proposal);
                      setShowDetailModal(true);
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{proposal.proposal_number}</Text>
                        <Text style={styles.cardSubtitle}>Client: {proposal.client_name}</Text>
                        {proposal.proposal_date && (
                          <Text style={styles.cardSubtitle}>
                            Date: {new Date(proposal.proposal_date).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.text}</Text>
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.totalAmount}>{formatCurrency(proposal.total_cost)}</Text>
                      <Text style={styles.dateText}>
                        Created: {new Date(proposal.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {(userRole === 'sales' || userRole === 'pm') && proposal.management_approval === 'pending' && !(proposal as any).sent_for_approval_at && (
                      <TouchableOpacity
                        style={styles.sendApprovalButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleSendProposalForApproval(proposal.id);
                        }}>
                        <Send size={16} color="#ffffff" />
                        <Text style={styles.sendApprovalButtonText}>Send for Approval</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })
            )
          )}
        </ScrollView>

        {/* Create/Edit Proposal Modal - Similar to Create Invoice Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProposal ? 'Edit Proposal' : 'Create Proposal'}</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
      setShowClientDropdown(false);
      setClientSearchQuery('');
                setEditingProposal(null);
                setWorkTitles([]);
                setNewWorkTitle({ name: '', descriptions: [], quantity: '', unit_price: '', price: '' });
      setNewDescription('');
                setShowProposalDatePicker(false);
                setShowClientDropdown(false);
                setClientSearchQuery('');
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Similar form fields to invoices */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Client *</Text>
                  <TouchableOpacity
                    style={styles.addClientButton}
                    onPress={() => setShowNewClientModal(true)}
                  >
                    <Plus size={16} color="#236ecf" />
                    <Text style={styles.addClientButtonText}>Add New Client</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.clientDropdownButton}
                  onPress={() => setShowClientDropdown(!showClientDropdown)}
                >
                  <Text style={[
                    styles.clientDropdownButtonText,
                    !newProposal.client_name && styles.clientDropdownPlaceholder
                  ]}>
                    {newProposal.client_name || 'Select Client'}
                  </Text>
                  <Text style={styles.clientDropdownArrow}>
                    {showClientDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {showClientDropdown && (
                  <View style={styles.clientDropdown}>
                    <View style={styles.clientSearchContainer}>
                      <TextInput
                        style={styles.clientSearchInput}
                        placeholder="Search clients..."
                        value={clientSearchQuery}
                        onChangeText={setClientSearchQuery}
                        autoFocus={Platform.OS === 'web'}
                      />
                    </View>
                    <ScrollView style={styles.clientDropdownList} nestedScrollEnabled>
                      {clients
                        .filter(client => 
                          client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                          (client.email && client.email.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                        )
                        .map((client) => (
                          <TouchableOpacity
                            key={client.id}
                            style={[
                              styles.clientDropdownOption,
                              newProposal.client_id === client.id && styles.selectedClientDropdownOption
                            ]}
                            onPress={() => {
                              setNewProposal(prev => ({
                                ...prev,
                                client_id: client.id,
                                client_name: client.name,
                                client_email: client.email || ''
                              }));
                              setShowClientDropdown(false);
                              setClientSearchQuery('');
                            }}
                          >
                            <View>
                              <Text style={[
                                styles.clientDropdownOptionText,
                                newProposal.client_id === client.id && styles.selectedClientDropdownOptionText
                              ]}>
                                {client.name}
                              </Text>
                              {client.email && (
                                <Text style={styles.clientDropdownOptionEmail}>
                                  {client.email}
                                </Text>
                              )}
                            </View>
                            {newProposal.client_id === client.id && (
                              <CheckCircle size={20} color="#236ecf" />
                            )}
                          </TouchableOpacity>
                        ))}
                      {clients.filter(client => 
                        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                        (client.email && client.email.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                      ).length === 0 && (
                        <View style={styles.clientDropdownEmpty}>
                          <Text style={styles.clientDropdownEmptyText}>No clients found</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter street address"
                  value={newProposal.client_street}
                  onChangeText={(text) => setNewProposal(prev => ({ ...prev, client_street: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  value={newProposal.client_city}
                  onChangeText={(text) => setNewProposal(prev => ({ ...prev, client_city: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter state"
                  value={newProposal.client_state}
                  onChangeText={(text) => setNewProposal(prev => ({ ...prev, client_state: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ZIP Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter ZIP code"
                  value={newProposal.client_zip}
                  onChangeText={(text) => setNewProposal(prev => ({ ...prev, client_zip: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                  style={styles.categorySelectButton}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={[
                    styles.categorySelectButtonText,
                    !newProposal.category && styles.categorySelectPlaceholder
                  ]}>
                    {newProposal.category || 'Select Category'}
                  </Text>
                  <Text style={styles.categorySelectArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Proposal Date *</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={newProposal.proposal_date}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, proposal_date: e.target.value }))}
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
                      style={styles.input}
                      onPress={() => setShowProposalDatePicker(true)}
                    >
                      <View style={styles.dateInputContainer}>
                        <Calendar size={18} color="#6b7280" />
                        <Text style={[styles.dateInputText, !newProposal.proposal_date && styles.dateInputPlaceholder]}>
                          {newProposal.proposal_date 
                            ? new Date(newProposal.proposal_date).toLocaleDateString()
                            : 'Select Proposal Date'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {showProposalDatePicker && (
                      <DateTimePicker
                        value={newProposal.proposal_date ? new Date(newProposal.proposal_date) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                          setShowProposalDatePicker(Platform.OS === 'ios');
                          if (date) {
                            const formattedDate = date.toISOString().split('T')[0];
                            setNewProposal(prev => ({ ...prev, proposal_date: formattedDate }));
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Work Titles Section - Same as invoices */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Work Titles *</Text>
                <Text style={styles.helperText}>At least one work title is required</Text>
                
                {workTitles.length > 0 && (
                  <View style={styles.workTitlesList}>
                    {workTitles.map((workTitle, index) => (
                      <View key={index} style={styles.workTitleItem}>
                        <View style={styles.workTitleNumber}>
                          <Text style={styles.workTitleNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.workTitleInfo}>
                          <View style={styles.workTitleHeader}>
                            <Text style={styles.workTitleName}>{workTitle.name}</Text>
                            <View style={styles.workTitleActions}>
                              <TouchableOpacity
                                style={styles.editWorkTitleButton}
                                onPress={() => handleEditWorkTitle(index)}
                              >
                                <Edit size={16} color="#236ecf" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.removeWorkTitleButton}
                                onPress={() => handleRemoveWorkTitle(index)}
                              >
                                <Trash size={18} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          {(workTitle.descriptions && workTitle.descriptions.length > 0) && (
                            <View style={styles.descriptionsList}>
                              {workTitle.descriptions.map((desc, descIndex) => (
                                <View key={descIndex} style={styles.descriptionItem}>
                                  <Text style={styles.descriptionText}>• {desc}</Text>
                                </View>
                              ))}
                            </View>
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
                      </View>
                    ))}
                  </View>
                )}

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
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Work Descriptions</Text>
                      <Text style={styles.descriptionCount}>
                        {newWorkTitle.descriptions.length}/5
                      </Text>
                    </View>
                    
                    {newWorkTitle.descriptions.length > 0 && (
                      <View style={styles.descriptionsList}>
                        {newWorkTitle.descriptions.map((desc, index) => (
                          <View key={index} style={styles.descriptionItem}>
                            <Text style={styles.descriptionText}>• {desc}</Text>
                            <TouchableOpacity
                              style={styles.removeDescriptionButton}
                              onPress={() => handleRemoveDescription(index)}
                            >
                              <X size={14} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {newWorkTitle.descriptions.length < 5 && (
                      <View style={styles.addDescriptionContainer}>
                        <TextInput
                          style={[styles.input, styles.textArea]}
                          placeholder="Enter work description"
                          value={newDescription}
                          onChangeText={setNewDescription}
                          multiline
                          numberOfLines={2}
                        />
                        <TouchableOpacity
                          style={styles.addDescriptionButton}
                          onPress={handleAddDescription}
                        >
                          <Plus size={16} color="#236ecf" />
                          <Text style={styles.addDescriptionButtonText}>Add Description</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    
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
                    <TouchableOpacity
                      style={styles.addWorkTitleButton}
                      onPress={editingWorkTitleIndex !== null ? handleUpdateWorkTitle : handleAddWorkTitle}
                    >
                      {editingWorkTitleIndex !== null ? (
                        <Text style={styles.addWorkTitleButtonText}>Update</Text>
                      ) : (
                        <Plus size={18} color="#ffffff" />
                      )}
                    </TouchableOpacity>
                    {editingWorkTitleIndex !== null && (
                      <TouchableOpacity
                        style={styles.cancelEditButton}
                        onPress={() => {
                          setNewWorkTitle({ name: '', descriptions: [], quantity: '', unit_price: '', price: '' });
                          setEditingWorkTitleIndex(null);
                          setSelectedWorkTitleFromList('');
                          setNewDescription('');
                        }}
                      >
                        <Text style={styles.cancelEditButtonText}>Cancel</Text>
                      </TouchableOpacity>
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
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>General Conditions</Text>
                <View style={styles.percentageInputRow}>
                  {Platform.OS === 'web' ? (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="18.5"
                      value={newProposal.general_conditions_percentage}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, general_conditions_percentage: e.target.value }))}
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
                      value={newProposal.general_conditions_percentage}
                      onChangeText={(text) => setNewProposal(prev => ({ ...prev, general_conditions_percentage: text }))}
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
                  const totalWorkTitles = workTitlesTotal + currentWorkTitleTotal;
                  const supervisionWeeks = parseFloat(newProposal.supervision_weeks) || 0;
                  const supervisionRate = newProposal.supervision_type === 'full-time' ? 1450 : newProposal.supervision_type === 'part-time' ? 725 : 0;
                  const calculatedSupervisionFee = (supervisionWeeks > 0 && newProposal.supervision_type !== 'none') ? supervisionRate * supervisionWeeks : 0;
                  const discount = parseFloat(newProposal.discount) || 0;
                  const generalConditionsPercentageInput = newProposal.general_conditions_percentage.trim();
                  const generalConditionsPercentageCalc = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
                  const generalConditionsAmount = ((totalWorkTitles + calculatedSupervisionFee) * generalConditionsPercentageCalc) / 100;
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
                <TouchableOpacity
                  style={styles.categorySelectButton}
                  onPress={() => setShowSupervisionTypeModal(true)}
                >
                  <Text style={[
                    styles.categorySelectButtonText,
                    newProposal.supervision_type === 'none' && styles.categorySelectPlaceholder
                  ]}>
                    {newProposal.supervision_type === 'none' 
                      ? 'None' 
                      : newProposal.supervision_type === 'full-time' 
                        ? 'Full-Time ($1,450/week)' 
                        : 'Part-Time ($725/week)'}
                  </Text>
                  <Text style={styles.categorySelectArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {newProposal.supervision_type !== 'none' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Number of Weeks *</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="number"
                      placeholder="Enter number of weeks"
                      value={newProposal.supervision_weeks}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, supervision_weeks: e.target.value }))}
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
                      value={newProposal.supervision_weeks}
                      onChangeText={(text) => setNewProposal(prev => ({ ...prev, supervision_weeks: text }))}
                      keyboardType="numeric"
                    />
                  )}
                  {newProposal.supervision_weeks && parseFloat(newProposal.supervision_weeks) > 0 && (
                    <View style={styles.calculatedAmount}>
                      <Text style={styles.calculatedAmountLabel}>Supervision Fee:</Text>
                      <Text style={styles.calculatedAmountValue}>
                        ${((newProposal.supervision_type === 'full-time' ? 1450 : newProposal.supervision_type === 'part-time' ? 725 : 0) * parseFloat(newProposal.supervision_weeks)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      value={newProposal.discount}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, discount: e.target.value }))}
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
                      value={newProposal.discount}
                      onChangeText={(text) => setNewProposal(prev => ({ ...prev, discount: text }))}
                      keyboardType="numeric"
                    />
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter proposal description or notes"
                  value={newProposal.description}
                  onChangeText={(text) => setNewProposal(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Cost</Text>
                <TextInput
                  style={[styles.input, styles.totalBudgetInput]}
                  placeholder="Auto-calculated"
                  value={totalCost > 0 ? `$${totalCost.toLocaleString()}` : ''}
                  editable={false}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreateProposal}>
                <Text style={styles.submitButtonText}>{editingProposal ? 'Update Proposal' : 'Create Proposal'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Proposal Detail Modal */}
        <Modal
          visible={showDetailModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Proposal Details</Text>
              <TouchableOpacity onPress={() => {
                setShowDetailModal(false);
                setSelectedProposal(null);
                setComments([]);
                setNewComment('');
                setRelatedProject(null);
                setRelatedInvoice(null);
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedProposal && (
                <>
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Text style={styles.detailTitle}>{selectedProposal.proposal_number}</Text>
                      {Platform.OS === 'web' && (
                        <TouchableOpacity
                          style={styles.downloadButton}
                          onPress={() => handleExportPDF(selectedProposal)}
                        >
                          <Download size={18} color="#236ecf" />
                          <Text style={styles.downloadButtonText}>Download PDF</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Client:</Text>
                      <Text style={styles.detailValue}>{selectedProposal.client_name}</Text>
                    </View>
                    {selectedProposal.client_email && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Client Email:</Text>
                        <Text style={styles.detailValue}>{selectedProposal.client_email}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address:</Text>
                      <Text style={styles.detailValue}>{selectedProposal.client_address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Proposal Date:</Text>
                      <Text style={styles.detailValue}>
                        {selectedProposal.proposal_date 
                          ? new Date(selectedProposal.proposal_date).toLocaleDateString()
                          : new Date(selectedProposal.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Management Approval:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: selectedProposal.management_approval === 'approved' ? '#059669' : selectedProposal.management_approval === 'rejected' ? '#ef4444' : '#f59e0b' }]}>
                        <Text style={styles.statusText}>
                          {selectedProposal.management_approval === 'approved' ? 'Approved' : selectedProposal.management_approval === 'rejected' ? 'Rejected' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Client Approval:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: selectedProposal.client_approval === 'approved' ? '#059669' : selectedProposal.client_approval === 'rejected' ? '#ef4444' : '#f59e0b' }]}>
                        <Text style={styles.statusText}>
                          {selectedProposal.client_approval === 'approved' ? 'Approved' : selectedProposal.client_approval === 'rejected' ? 'Rejected' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created by:</Text>
                      <Text style={styles.detailValue}>{selectedProposal.created_by_name}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Work Titles</Text>
                    {selectedProposal.work_titles.map((workTitle, index) => (
                      <View key={index} style={styles.workTitleDetailItem}>
                        <View style={styles.workTitleDetailHeader}>
                          <Text style={styles.workTitleDetailNumber}>{index + 1}.</Text>
                          <Text style={styles.workTitleDetailName}>{workTitle.name}</Text>
                        </View>
                        {(workTitle.descriptions && workTitle.descriptions.length > 0) && (
                          <View style={styles.workTitleDetailDescriptions}>
                            {workTitle.descriptions.map((desc, descIndex) => (
                              <Text key={descIndex} style={styles.workTitleDetailDescription}>
                                • {desc}
                              </Text>
                            ))}
                          </View>
                        )}
                        {/* Legacy support - show single description if exists */}
                        {(!workTitle.descriptions || workTitle.descriptions.length === 0) && workTitle.description && (
                          <Text style={styles.workTitleDetailDescription}>{workTitle.description}</Text>
                        )}
                        <View style={styles.workTitleDetailInfo}>
                          <Text style={styles.workTitleDetailInfoText}>
                            Quantity: {workTitle.quantity || 0}
                          </Text>
                          <Text style={styles.workTitleDetailInfoText}>
                            Unit Price: {formatCurrency(workTitle.unit_price || 0)}
                          </Text>
                          <Text style={styles.workTitleDetailPrice}>
                            Total: {formatCurrency(workTitle.price)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Additional Costs</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>General Conditions:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(selectedProposal.general_conditions)}</Text>
                    </View>
                    {selectedProposal.supervision_fee > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Supervision Fee:</Text>
                        <Text style={styles.detailValue}>{formatCurrency(selectedProposal.supervision_fee)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.totalCostRow}>
                      <Text style={styles.totalCostLabel}>Total Cost:</Text>
                      <Text style={styles.totalCostValue}>{formatCurrency(selectedProposal.total_cost)}</Text>
                    </View>
                  </View>

                  {/* Comments Section */}
                  <View style={styles.detailSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Comments</Text>
                      {(canEditProposals || userRole === 'admin' || userRole === 'sales') && (
                        <TouchableOpacity
                          style={styles.addCommentButton}
                          onPress={() => {
                            // Show comment input
                          }}
                        >
                          <MessageSquare size={18} color="#236ecf" />
                          <Text style={styles.addCommentButtonText}>Add Comment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Comment Input */}
                    {(canEditProposals || userRole === 'admin' || userRole === 'sales') && (
                      <View style={styles.commentInputContainer}>
                        <TextInput
                          style={styles.commentInput}
                          placeholder="Add a comment..."
                          value={newComment}
                          onChangeText={setNewComment}
                          multiline
                          numberOfLines={3}
                        />
                        <TouchableOpacity
                          style={styles.sendCommentButton}
                          onPress={handleAddComment}
                        >
                          <Text style={styles.sendCommentButtonText}>Send</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Comments List */}
                    {comments.length === 0 ? (
                      <Text style={styles.noCommentsText}>No comments yet</Text>
                    ) : (
                      comments.map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                            <Text style={styles.commentDate}>
                              {new Date(comment.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                          <Text style={styles.commentText}>{comment.comment}</Text>
                        </View>
                      ))
                    )}
                  </View>

                  {/* Sales can edit proposal before sending for approval */}
                  {selectedProposal.management_approval === 'pending' && userRole === 'sales' && !(selectedProposal as any).sent_for_approval_at && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          // Load proposal data into edit form
                          setEditingProposal(selectedProposal);
                          // Format proposal_date for HTML date input (YYYY-MM-DD)
                          const proposalDateValue = selectedProposal.proposal_date || selectedProposal.created_at;
                          const formattedProposalDate = proposalDateValue ? new Date(proposalDateValue).toISOString().split('T')[0] : '';
                          
                          setNewProposal({
                            client_id: selectedProposal.client_id || '',
                            client_name: selectedProposal.client_name,
                            client_email: selectedProposal.client_email || '',
                            client_address: selectedProposal.client_address,
                            client_street: selectedProposal.client_street || '',
                            client_city: selectedProposal.client_city || '',
                            client_state: selectedProposal.client_state || '',
                            client_zip: selectedProposal.client_zip || '',
                            category: selectedProposal.category,
                            general_conditions_percentage: '18.5', // Default, will be recalculated
                            supervision_fee: selectedProposal.supervision_fee.toString(),
                            supervision_type: 'part-time', // Default, will be recalculated
                            supervision_weeks: '',
                            discount: selectedProposal.discount?.toString() || '',
                            description: selectedProposal.description || '',
                            proposal_date: formattedProposalDate,
                          });
                          // Load work titles
                          const proposalWorkTitles = selectedProposal.work_titles.map(wt => ({
                            name: wt.name,
                            descriptions: wt.descriptions || (wt.description ? [wt.description] : []),
                            quantity: wt.quantity.toString(),
                            unit_price: wt.unit_price.toString(),
                            price: wt.price.toString(),
                          }));
                          setWorkTitles(proposalWorkTitles);
                          // Close detail modal and open create/edit modal
                          setShowDetailModal(false);
                          setShowCreateModal(true);
                        }}>
                        <Text style={styles.editButtonText}>Edit Proposal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.sendApprovalButton}
                        onPress={() => {
                          handleSendProposalForApproval(selectedProposal.id);
                          setShowDetailModal(false);
                        }}>
                        <Send size={20} color="#ffffff" />
                        <Text style={styles.sendApprovalButtonText}>Send for Approval</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Admin can approve/reject/update review proposals */}
                  {selectedProposal.management_approval === 'pending' && userRole === 'admin' && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => {
                          setShowRejectModal(true);
                        }}>
                        <XCircle size={20} color="#ffffff" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveByManagement(selectedProposal)}>
                        <CheckCircle size={20} color="#ffffff" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.updateReviewButton}
                        onPress={() => {
                          handleUpdateReview(selectedProposal.id);
                        }}>
                        <Text style={styles.updateReviewButtonText}>Update Review</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Admin can delete proposals that are not approved */}
                  {userRole === 'admin' && selectedProposal.management_approval !== 'approved' && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          setShowDeleteModal(true);
                        }}>
                        <Trash size={20} color="#ffffff" />
                        <Text style={styles.deleteButtonText}>Delete Proposal</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedProposal.client_approval === 'pending' && userRole === 'client' && (
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => {
                          setShowRejectModal(true);
                        }}>
                        <XCircle size={20} color="#ffffff" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveByClient(selectedProposal)}>
                        <CheckCircle size={20} color="#ffffff" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Create Project Button or Related Project Info - Not for clients */}
                  {selectedProposal.management_approval === 'approved' && 
                   selectedProposal.client_approval === 'approved' && 
                   userRole !== 'client' &&
                   (canEditProposals || userRole === 'admin' || userRole === 'sales') && (
                    <View style={styles.modalActions}>
                      {relatedProject ? (
                        // Show related project info if project exists
                        <View style={styles.relatedProjectInfo}>
                          <Text style={styles.relatedProjectLabel}>Related Project:</Text>
                          <TouchableOpacity
                            style={styles.relatedProjectLink}
                            onPress={() => {
                              setShowDetailModal(false);
                              router.push(`/(tabs)/project/${relatedProject.id}`);
                            }}>
                            <Building2 size={18} color="#236ecf" />
                            <Text style={styles.relatedProjectText}>{relatedProject.title}</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        // Show Create Project button if no project exists
                        <TouchableOpacity
                          style={styles.createProjectButton}
                          onPress={() => {
                            // Check if invoice is paid before allowing project creation
                            if (relatedInvoice) {
                              if (relatedInvoice.status === 'paid' || relatedInvoice.status === 'partial-paid') {
                                // Invoice is paid, proceed to create project
                                router.push(`/projects?fromProposal=${selectedProposal.id}`);
                                setShowDetailModal(false);
                              } else {
                                // Invoice not paid, show warning modal
                                setShowInvoiceCheckModal(true);
                              }
                            } else {
                              // No invoice found, show warning
                              Alert.alert('Warning', 'No invoice found for this proposal. Please create an invoice first.');
                            }
                          }}>
                          <Building2 size={20} color="#ffffff" />
                          <Text style={styles.createProjectButtonText}>Create Project</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </>
              )}
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
              <Text style={styles.rejectModalTitle}>Reject Proposal</Text>
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
                    if (userRole === 'admin') {
                      handleRejectByManagement();
                    } else if (userRole === 'client') {
                      handleRejectByClient();
                    }
                  }}>
                  <Text style={styles.confirmRejectText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Proposal Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.rejectModal}>
              <Text style={styles.rejectModalTitle}>Delete Proposal</Text>
              <Text style={styles.rejectModalMessage}>
                Are you sure you want to delete this proposal? This action cannot be undone.
                {selectedProposal && (
                  <Text style={{ fontWeight: 'bold' }}>{'\n\nProposal: ' + selectedProposal.proposal_number}</Text>
                )}
              </Text>
              
              <View style={styles.rejectModalActions}>
                <TouchableOpacity
                  style={styles.cancelRejectButton}
                  onPress={() => {
                    setShowDeleteModal(false);
                  }}>
                  <Text style={styles.cancelRejectText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.confirmRejectButton, { backgroundColor: '#ef4444' }]}
                  onPress={handleDeleteProposal}>
                  <Text style={styles.confirmRejectText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Invoice Payment Check Modal */}
        <Modal
          visible={showInvoiceCheckModal}
          transparent={true}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.invoiceCheckModal}>
              <View style={styles.invoiceCheckIcon}>
                <Receipt size={48} color="#f59e0b" />
              </View>
              <Text style={styles.invoiceCheckTitle}>Invoice Not Paid</Text>
              <Text style={styles.invoiceCheckMessage}>
                The invoice for this proposal has not been paid yet.
                {'\n\n'}
                <Text style={{ fontWeight: 'bold' }}>Invoice Status: </Text>
                <Text style={{ color: relatedInvoice?.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                  {relatedInvoice?.status === 'pending' ? 'Pending' : 
                   relatedInvoice?.status === 'overdue' ? 'Overdue' : 
                   relatedInvoice?.status === 'cancelled' ? 'Cancelled' : 
                   relatedInvoice?.status || 'Unknown'}
                </Text>
                {'\n\n'}
                To create a project, the invoice must be at least <Text style={{ fontWeight: 'bold', color: '#059669' }}>Partial Paid</Text>.
              </Text>
              
              <View style={styles.invoiceCheckActions}>
                <TouchableOpacity
                  style={styles.invoiceCheckCancelButton}
                  onPress={() => setShowInvoiceCheckModal(false)}>
                  <Text style={styles.invoiceCheckCancelText}>Close</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.invoiceCheckViewButton}
                  onPress={() => {
                    setShowInvoiceCheckModal(false);
                    setShowDetailModal(false);
                    router.push('/invoices');
                  }}>
                  <Receipt size={18} color="#ffffff" />
                  <Text style={styles.invoiceCheckViewText}>Go to Invoices</Text>
                </TouchableOpacity>
              </View>
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
              <ScrollView 
                style={styles.categoryList}
                contentContainerStyle={styles.categoryListContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {['Residential', 'Commercial'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newProposal.category === category && styles.selectedCategory
                    ]}
                    onPress={() => {
                      setNewProposal(prev => ({ ...prev, category }));
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={[
                      styles.categoryText,
                      newProposal.category === category && styles.selectedCategoryText
                    ]}>
                      {category}
                    </Text>
                    {newProposal.category === category && (
                      <CheckCircle size={20} color="#236ecf" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Supervision Type Selection Modal */}
        <Modal
          visible={showSupervisionTypeModal}
          transparent={true}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.categoryModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Supervision Type</Text>
                <TouchableOpacity onPress={() => setShowSupervisionTypeModal(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={styles.categoryList}
                contentContainerStyle={styles.categoryListContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {[
                  { value: 'none', label: 'None', description: 'No supervision required' },
                  { value: 'full-time', label: 'Full-Time', description: '$1,450/week' },
                  { value: 'part-time', label: 'Part-Time', description: '$725/week' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryOption,
                      newProposal.supervision_type === option.value && styles.selectedCategory
                    ]}
                    onPress={() => {
                      if (option.value === 'none') {
                        setNewProposal(prev => ({ ...prev, supervision_type: option.value as 'none', supervision_weeks: '' }));
                      } else {
                        setNewProposal(prev => ({ ...prev, supervision_type: option.value as 'full-time' | 'part-time' }));
                      }
                      setShowSupervisionTypeModal(false);
                    }}
                  >
                    <View style={styles.supervisionOptionContent}>
                      <Text style={[
                        styles.categoryText,
                        newProposal.supervision_type === option.value && styles.selectedCategoryText
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.supervisionOptionDescription}>
                        {option.description}
                      </Text>
                    </View>
                    {newProposal.supervision_type === option.value && (
                      <CheckCircle size={20} color="#236ecf" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add New Client Modal */}
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

        {/* Bottom Menu - Sales Navigation (not for clients) */}
        {(canEditProposals || userRole === 'admin' || userRole === 'sales') && (
          <View style={styles.bottomMenu}>
            <View style={styles.bottomMenuContainer}>
              <TouchableOpacity
                style={styles.bottomMenuItem}
                onPress={() => router.push('/clients')}
              >
                <UserCheck size={24} color="#059669" />
                <Text style={styles.bottomMenuText}>Clients</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomMenuItem}
                onPress={() => router.push('/leads')}
              >
                <User size={24} color="#3b82f6" />
                <Text style={styles.bottomMenuText}>Leads</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomMenuItem, styles.activeMenuItem]}
                onPress={() => router.push('/proposals')}
              >
                <FileText size={24} color="#f59e0b" />
                <Text style={[styles.bottomMenuText, styles.activeMenuText]}>Proposals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomMenuItem}
                onPress={() => router.push('/invoices')}
              >
                <Receipt size={24} color="#ef4444" />
                <Text style={styles.bottomMenuText}>Invoices</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomMenuItem}
                onPress={() => router.push('/sales-report')}
              >
                <BarChart3 size={24} color="#8b5cf6" />
                <Text style={styles.bottomMenuText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
      </View>
    </>
  );
}

// Styles - Similar to invoices.tsx styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24',
  },
  addButton: {
    backgroundColor: '#ffcc00',
    width: Platform.OS === 'web' ? 40 : 44,
    height: Platform.OS === 'web' ? 40 : 44,
    borderRadius: Platform.OS === 'web' ? 20 : 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 0 : 12,
    paddingVertical: Platform.OS === 'web' ? 0 : 12,
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
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 20, // No extra padding for clients (no bottom menu)
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
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  proposalCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
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
    marginTop: 8,
  },
  sendApprovalButtonText: {
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
  inputGroup: {
    marginBottom: 20,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  addClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addClientButtonText: {
    color: '#236ecf',
    fontSize: 14,
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
  textArea: {
    height: 80,
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
  clientDropdownButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  clientDropdownButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  clientDropdownPlaceholder: {
    color: '#9ca3af',
  },
  clientDropdownArrow: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  clientDropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  clientSearchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  clientSearchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  clientDropdownList: {
    maxHeight: 250,
  },
  clientDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedClientDropdownOption: {
    backgroundColor: '#eff6ff',
  },
  clientDropdownOptionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  selectedClientDropdownOptionText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  clientDropdownOptionEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  clientDropdownEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  clientDropdownEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
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
  categorySelectButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  categorySelectButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  categorySelectPlaceholder: {
    color: '#9ca3af',
  },
  categorySelectArrow: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  selectedCategory: {
    borderColor: '#236ecf',
    backgroundColor: '#eff6ff',
  },
  categoryText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  selectedCategoryText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  supervisionOptionContent: {
    flex: 1,
  },
  supervisionOptionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 12,
  },
  workTitleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  workTitleNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  workTitleInfo: {
    flex: 1,
  },
  workTitleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workTitleActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editWorkTitleButton: {
    padding: 4,
  },
  workTitleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  descriptionsList: {
    marginTop: 8,
    marginBottom: 8,
    gap: 4,
  },
  descriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  removeDescriptionButton: {
    padding: 4,
    marginLeft: 8,
  },
  addDescriptionContainer: {
    gap: 8,
  },
  addDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  addDescriptionButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  maxDescriptionsText: {
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  descriptionCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  cancelEditButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
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
  removeWorkTitleButton: {
    padding: 8,
    marginLeft: 12,
  },
  addWorkTitleForm: {
    gap: 8,
    marginTop: 8,
  },
  quantityUnitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInputContainer: {
    flex: 1,
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
    color: '#374151',
    minWidth: 30,
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
    color: '#1e40af',
  },
  calculatedAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
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
    color: '#1e40af',
  },
  calculatedPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  addWorkTitleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  totalBudgetInput: {
    backgroundColor: '#f3f4f6',
    color: '#059669',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ffcc00',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'web' ? 20 : 24,
    minHeight: 48,
  },
  submitButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  workTitleDetailItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  workTitleDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  workTitleDetailNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
  },
  workTitleDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  workTitleDetailDescriptions: {
    marginTop: 8,
    marginBottom: 8,
    gap: 4,
  },
  workTitleDetailDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  workTitleDetailInfo: {
    marginTop: 8,
    gap: 4,
  },
  workTitleDetailInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  workTitleDetailPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalCostValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
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
  updateReviewButton: {
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
  updateReviewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
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
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
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
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  createProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  createProjectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  relatedProjectInfo: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginTop: 16,
  },
  relatedProjectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  relatedProjectLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relatedProjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#236ecf',
    textDecorationLine: 'underline',
  },
  createInvoiceButton: {
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
  createInvoiceButtonText: {
    color: '#ffffff',
    fontSize: 14,
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
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  rejectModalMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  rejectInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  rejectModalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelRejectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelRejectText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmRejectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  confirmRejectText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceCheckModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  invoiceCheckIcon: {
    marginBottom: 16,
  },
  invoiceCheckTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  invoiceCheckMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  invoiceCheckActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  invoiceCheckCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  invoiceCheckCancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceCheckViewButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#236ecf',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  invoiceCheckViewText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#236ecf',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  commentInputContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  sendCommentButton: {
    backgroundColor: '#236ecf',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  sendCommentButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
    color: '#374151',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addCommentButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dateInputPlaceholder: {
    color: '#9ca3af',
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
  activeMenuItem: {
    backgroundColor: '#f3f4f6',
  },
  activeMenuText: {
    color: '#1f2937',
    fontWeight: '700',
  },
});

