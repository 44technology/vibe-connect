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
  RefreshControl,
} from 'react-native';
import { Plus, X, Eye, FileText, DollarSign, Calendar, Trash, Download, ArrowLeft, User, UserCheck, Receipt, BarChart3, MessageSquare, Filter, Search, Building2, CheckCircle, Circle, Upload, Paperclip } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Comment, Proposal, ExpensePayment, ExpenseDocument } from '@/types';
import { InvoiceService } from '@/services/invoiceService';
import { UserService } from '@/services/userService';
import { ProposalService } from '@/services/proposalService';
import { usePagePermission } from '@/hooks/usePagePermission';
import { CommentService } from '@/services/commentService';
import HamburgerMenu from '@/components/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function InvoicesScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { canEdit: canEditInvoices } = usePagePermission('invoices', userRole as 'admin' | 'pm' | 'sales' | 'office' | 'client');
  const params = useLocalSearchParams();
  const [isMobileWeb, setIsMobileWeb] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [showProposalSelect, setShowProposalSelect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showPartialPaidModal, setShowPartialPaidModal] = useState(false);
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [invoiceToPay, setInvoiceToPay] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ExpensePayment | null>(null);
  const [paymentDocuments, setPaymentDocuments] = useState<ExpenseDocument[]>([]);
  const [uploadingPaymentDocument, setUploadingPaymentDocument] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    client_name: '',
    client_email: '',
    client_address: '',
    general_conditions_percentage: '18.5', // Percentage for general conditions
    supervision_fee: '',
    due_date: '',
  });
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    temporaryPassword: '',
  });
  const [workTitles, setWorkTitles] = useState<Array<{ name: string; description: string; quantity: string; unit: string; unit_price: string; price: string }>>([]);
  const [newWorkTitle, setNewWorkTitle] = useState({ name: '', description: '', quantity: '', unit: '', unit_price: '', price: '' });
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

  const loadProposals = async () => {
    try {
      const allProposals = await ProposalService.getProposals();
      // Only show approved proposals that don't have an invoice yet
      const approvedProposals = allProposals.filter(p => 
        p.management_approval === 'approved' && 
        p.client_approval === 'approved'
      );
      setProposals(approvedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const loadData = async () => {
    await loadInvoices();
    if (canEditInvoices || userRole === 'admin' || userRole === 'sales') {
      await loadClients();
      await loadProposals();
    }
    
    // Check if coming from client detail page
    if (params.fromClient && params.clientName) {
      setNewInvoice(prev => ({
        ...prev,
        client_id: params.fromClient as string,
        client_name: decodeURIComponent(params.clientName as string),
        client_email: params.clientEmail ? decodeURIComponent(params.clientEmail as string) : '',
      }));
      setShowCreateModal(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  // Mobile web detection (to avoid colliding with HamburgerMenu absolute button)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const compute = () => {
      const isMobileWidth = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobileWeb(isMobileWidth || isMobileUA);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    if (selectedInvoice) {
      loadInvoiceComments();
    }
  }, [selectedInvoice]);

  // Calculate total cost from work titles, general conditions, and supervision fee
  // General conditions = (work titles total + supervision fee) * percentage / 100
  useEffect(() => {
    const workTitlesTotal = workTitles.reduce((sum, workTitle) => {
      // Calculate price from quantity and unit_price
      const quantity = parseFloat(workTitle.quantity) || 0;
      const unitPrice = parseFloat(workTitle.unit_price) || 0;
      const price = quantity * unitPrice;
      return sum + price;
    }, 0);
    const supervisionFee = parseFloat(newInvoice.supervision_fee) || 0;
    const generalConditionsPercentageInput = newInvoice.general_conditions_percentage.trim();
    const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
    const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
    const total = workTitlesTotal + generalConditions + supervisionFee;
    // Total will be set when creating invoice
  }, [workTitles, newInvoice.general_conditions_percentage, newInvoice.supervision_fee]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const allInvoices = await InvoiceService.getInvoices();
      
      // Auto-update overdue invoices
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updatePromises = allInvoices.map(async (invoice) => {
        // Check if invoice should be marked as overdue
        if (invoice.due_date && 
            invoice.status === 'pending' && 
            new Date(invoice.due_date) < today) {
          try {
            await InvoiceService.updateInvoice(invoice.id, {
              status: 'overdue'
            });
            invoice.status = 'overdue';
          } catch (error) {
            console.error(`Error updating invoice ${invoice.id} to overdue:`, error);
          }
        }
        return invoice;
      });
      
      await Promise.all(updatePromises);
      
      // Reload invoices after updates
      const updatedInvoices = await InvoiceService.getInvoices();
      
      // Filter invoices for client role - show only their invoices
      if (userRole === 'client') {
        const clientInvoices = updatedInvoices.filter(inv => {
          const matchesName = inv.client_name === user?.name;
          const matchesId = inv.client_id === user?.id;
          const matchesEmail = inv.client_email && user?.email && inv.client_email.toLowerCase() === user.email.toLowerCase();
          return matchesName || matchesId || matchesEmail;
        });
        setInvoices(clientInvoices);
      } else {
        setInvoices(updatedInvoices);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const loadInvoiceComments = async () => {
    if (!selectedInvoice) return;
    try {
      const invoiceComments = await CommentService.getCommentsByInvoiceId(selectedInvoice.id);
      setComments(invoiceComments);
    } catch (error) {
      console.error('Error loading invoice comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedInvoice || !newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      const commentData = {
        invoice_id: selectedInvoice.id,
        user_id: user?.id || '',
        user_name: user?.name || 'Unknown User',
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
      };

      await CommentService.addComment(commentData);
      await loadInvoiceComments();
      setNewComment('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  // Load payment documents when payment is selected
  useEffect(() => {
    if (selectedPayment && selectedPayment.documents) {
      setPaymentDocuments(selectedPayment.documents);
    } else {
      setPaymentDocuments([]);
    }
  }, [selectedPayment]);

  const handlePickPaymentImage = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadPaymentDocument(file);
          }
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };
        window.document.body.appendChild(input);
        input.click();
        return;
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Please grant camera roll permissions');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const fileName = asset.uri.split('/').pop() || 'image.jpg';
          await uploadPaymentDocument(blob, fileName);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setUploadingPaymentDocument(false);
    }
  };

  const handlePickPaymentDocument = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
        input.style.display = 'none';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadPaymentDocument(file);
          }
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };
        window.document.body.appendChild(input);
        input.click();
        return;
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          await uploadPaymentDocument(blob, asset.name);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
      setUploadingPaymentDocument(false);
    }
  };

  const uploadPaymentDocument = async (file: File | Blob, fileName?: string) => {
    if (!selectedPayment || !selectedInvoice) return;
    
    try {
      setUploadingPaymentDocument(true);
      
      const name = fileName || (file instanceof File ? file.name : 'document');
      const fileType = name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document';
      
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      
      const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `invoices/payments/${selectedInvoice.id}/${selectedPayment.id}/${Date.now()}_${sanitizedName}`);
      
      let fileToUpload: File | Blob = file;
      if (file instanceof Blob && !(file instanceof File)) {
        fileToUpload = new File([file], name, { type: file.type || 'application/octet-stream' });
      }
      
      await uploadBytes(storageRef, fileToUpload);
      const fileUrl = await getDownloadURL(storageRef);

      const document: ExpenseDocument = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        file_url: fileUrl,
        file_type: fileType,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user?.id || '',
        uploaded_by_name: user?.name || 'Unknown User',
      };

      // Add document to payment
      const updatedDocuments = [...paymentDocuments, document];
      setPaymentDocuments(updatedDocuments);

      // Update payment in invoice
      const invoice = invoices.find(i => i.id === selectedInvoice.id);
      if (invoice && invoice.payments) {
        const paymentIndex = invoice.payments.findIndex(p => p.id === selectedPayment.id);
        if (paymentIndex !== -1) {
          const updatedPayments = [...invoice.payments];
          updatedPayments[paymentIndex] = {
            ...updatedPayments[paymentIndex],
            documents: updatedDocuments,
          };
          
          // Update invoice in Firestore
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const invoiceRef = doc(db, 'invoices', invoice.id);
          await updateDoc(invoiceRef, {
            payments: updatedPayments,
            updated_at: new Date().toISOString(),
          });

          // Update local state
          await loadInvoices();
          if (selectedInvoice) {
            const updatedInvoice = invoices.find(i => i.id === selectedInvoice.id);
            if (updatedInvoice) {
              setSelectedInvoice(updatedInvoice);
              const updatedPayment = updatedInvoice.payments?.find(p => p.id === selectedPayment.id);
              if (updatedPayment) {
                setSelectedPayment(updatedPayment);
              }
            }
          }
        }
      }

      Alert.alert('Success', 'Document uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading payment document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploadingPaymentDocument(false);
    }
  };

  const removePaymentDocument = async (documentId: string) => {
    if (!selectedPayment || !selectedInvoice) return;

    try {
      const updatedDocuments = paymentDocuments.filter(doc => doc.id !== documentId);
      setPaymentDocuments(updatedDocuments);

      const invoice = invoices.find(i => i.id === selectedInvoice.id);
      if (invoice && invoice.payments) {
        const paymentIndex = invoice.payments.findIndex(p => p.id === selectedPayment.id);
        if (paymentIndex !== -1) {
          const updatedPayments = [...invoice.payments];
          updatedPayments[paymentIndex] = {
            ...updatedPayments[paymentIndex],
            documents: updatedDocuments,
          };
          
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const invoiceRef = doc(db, 'invoices', invoice.id);
          await updateDoc(invoiceRef, {
            payments: updatedPayments,
            updated_at: new Date().toISOString(),
          });

          await loadInvoices();
          if (selectedInvoice) {
            const updatedInvoice = invoices.find(i => i.id === selectedInvoice.id);
            if (updatedInvoice) {
              setSelectedInvoice(updatedInvoice);
              const updatedPayment = updatedInvoice.payments?.find(p => p.id === selectedPayment.id);
              if (updatedPayment) {
                setSelectedPayment(updatedPayment);
              }
            }
          }
        }
      }

      Alert.alert('Success', 'Document removed successfully');
    } catch (error) {
      console.error('Error removing payment document:', error);
      Alert.alert('Error', 'Failed to remove document');
    }
  };

  const handlePay = async () => {
    if (!invoiceToPay || !payAmount.trim()) {
      Alert.alert('Error', 'Please enter a payment amount');
      return;
    }

    const paymentAmount = parseFloat(payAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    const currentPaid = invoiceToPay.paid_amount || 0;
    const remainingAmount = invoiceToPay.total_cost - currentPaid;
    
    if (paymentAmount > remainingAmount) {
      Alert.alert('Error', `Payment amount cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`);
      return;
    }

    try {
      const newPaidAmount = currentPaid + paymentAmount;
      const isFullyPaid = newPaidAmount >= invoiceToPay.total_cost;
      
      // Create payment record
      const paymentData: Omit<ExpensePayment, 'id' | 'created_at'> = {
        amount: paymentAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'other' as 'check' | 'wire' | 'ach' | 'credit_card' | 'cash' | 'other',
        paid_by: user?.id || '',
        paid_by_name: user?.name || 'Unknown User',
      };

      // Get existing payments or create new array
      const existingPayments = invoiceToPay.payments || [];
      const newPayment: ExpensePayment = {
        ...paymentData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      const updatedPayments = [...existingPayments, newPayment];
      
      await InvoiceService.updateInvoice(invoiceToPay.id, {
        status: isFullyPaid ? 'paid' : 'partial-paid',
        paid_amount: isFullyPaid ? invoiceToPay.total_cost : newPaidAmount,
        payments: updatedPayments,
        total_paid: newPaidAmount,
      });
      
      await loadInvoices();
      setShowPayModal(false);
      setPayAmount('');
      setInvoiceToPay(null);
      
      // Close detail modal if it was open
      if (showDetailModal && selectedInvoice?.id === invoiceToPay.id) {
        setShowDetailModal(false);
      }
      
      if (Platform.OS === 'web') {
        alert(isFullyPaid ? 'Invoice marked as fully paid' : `Payment of ${formatCurrency(paymentAmount)} recorded`);
      } else {
        Alert.alert('Success', isFullyPaid ? 'Invoice marked as fully paid' : `Payment of ${formatCurrency(paymentAmount)} recorded`);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      if (Platform.OS === 'web') {
        alert('Failed to record payment');
      } else {
        Alert.alert('Error', 'Failed to record payment');
      }
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

      // Reload clients
      await loadClients();
      
      // Select the newly created client
      const allUsers = await UserService.getAllUsers();
      const clientUsers = allUsers.filter(u => u.role === 'client');
      const newClientUser = clientUsers.find(u => u.email === newClient.email);
      
      if (newClientUser) {
        setNewInvoice(prev => ({
          ...prev,
          client_id: newClientUser.id,
          client_name: newClientUser.name,
          client_email: newClientUser.email || '',
        }));
      }

      const tempPassword = newClient.temporaryPassword; // Save before clearing
      
      // Close modal and reset form
      setShowNewClientModal(false);
      setNewClient({ name: '', email: '', phone: '', temporaryPassword: '' });
      Alert.alert('Success', `Client added successfully!\n\nTemporary password: ${tempPassword}\n\nPlease share this password with the client.`);
    } catch (error: any) {
      console.error('Error adding client:', error);
      Alert.alert('Error', error.message || 'Failed to add client');
    }
  };

  const handleAddWorkTitle = () => {
    if (!newWorkTitle.name || !newWorkTitle.quantity || !newWorkTitle.unit || !newWorkTitle.unit_price) {
      Alert.alert('Error', 'Please fill in work title name, quantity, unit, and unit price');
      return;
    }
    
    // Calculate price: quantity * unit_price
    const quantity = parseFloat(newWorkTitle.quantity) || 0;
    const unitPrice = parseFloat(newWorkTitle.unit_price) || 0;
    const calculatedPrice = (quantity * unitPrice).toString();
    
    setWorkTitles(prev => [...prev, { ...newWorkTitle, price: calculatedPrice }]);
    setNewWorkTitle({ name: '', description: '', quantity: '', unit: '', unit_price: '', price: '' });
  };

  const handleRemoveWorkTitle = (index: number) => {
    setWorkTitles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectProposal = async (proposalId: string) => {
    try {
      // Check if invoice already exists for this proposal
      const existingInvoice = invoices.find(inv => inv.proposal_id === proposalId);
      if (existingInvoice) {
        Alert.alert('Invoice Exists', `An invoice already exists for this proposal: ${existingInvoice.invoice_number}`);
        return;
      }

      const proposal = await ProposalService.getProposalById(proposalId);
      if (!proposal) {
        Alert.alert('Error', 'Proposal not found');
        return;
      }

      // Pre-fill invoice data from proposal
      setSelectedProposalId(proposalId);
      setNewInvoice(prev => ({
        ...prev,
        client_id: proposal.client_id || '',
        client_name: proposal.client_name,
        client_email: proposal.client_email || '',
        client_address: proposal.client_address || '',
      }));

      // Convert proposal work_titles to invoice work_titles format
      const invoiceWorkTitles = proposal.work_titles.map(wt => ({
        name: wt.name,
        description: wt.descriptions && wt.descriptions.length > 0 
          ? wt.descriptions.join(', ') 
          : (wt.description || ''),
        quantity: (wt.quantity || 0).toString(),
        unit: '',
        unit_price: (wt.unit_price || 0).toString(),
        price: (wt.price || 0).toString(),
      }));
      setWorkTitles(invoiceWorkTitles);

      // Set supervision fee
      setNewInvoice(prev => ({
        ...prev,
        supervision_fee: proposal.supervision_fee.toString(),
      }));

      setShowProposalSelect(false);
      Alert.alert('Success', 'Proposal data loaded. You can review and create the invoice.');
    } catch (error) {
      console.error('Error loading proposal:', error);
      Alert.alert('Error', 'Failed to load proposal data');
    }
  };

  const handleCreateInvoice = async () => {
    // Collect all missing required fields
    const missingFields: string[] = [];
    
    if (workTitles.length === 0) {
      missingFields.push('Work Titles (at least one required)');
    }
    if (!newInvoice.client_name || !newInvoice.client_name.trim()) {
      missingFields.push('Client Name');
    }
    if (!newInvoice.due_date || !newInvoice.due_date.trim()) {
      missingFields.push('Due Date');
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
      const workTitlesTotal = workTitles.reduce((sum, workTitle) => {
        // Calculate price from quantity and unit_price
        const quantity = parseFloat(workTitle.quantity) || 0;
        const unitPrice = parseFloat(workTitle.unit_price) || 0;
        const price = quantity * unitPrice;
        return sum + price;
      }, 0);
      const supervisionFee = parseFloat(newInvoice.supervision_fee) || 0;
      const generalConditionsPercentageInput = newInvoice.general_conditions_percentage.trim();
      const generalConditionsPercentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
      const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
      const totalCost = workTitlesTotal + generalConditions + supervisionFee;

      const invoiceNumber = await InvoiceService.generateInvoiceNumber();
      const invoiceDate = new Date().toISOString();
      
      const invoiceData: Omit<Invoice, 'id' | 'created_at'> = {
        invoice_number: invoiceNumber,
        proposal_id: selectedProposalId || undefined, // Add proposal_id if selected
        client_id: newInvoice.client_id,
        client_name: newInvoice.client_name,
        client_email: newInvoice.client_email || undefined,
        client_address: newInvoice.client_address || undefined,
        work_titles: workTitles.map(wt => {
          const quantity = parseFloat(wt.quantity) || 0;
          const unitPrice = parseFloat(wt.unit_price) || 0;
          const calculatedPrice = quantity * unitPrice;
          return {
            name: wt.name,
            description: wt.description || undefined,
            quantity: quantity,
            unit: wt.unit,
            unit_price: unitPrice,
            price: calculatedPrice,
          };
        }),
        general_conditions: generalConditions,
        supervision_fee: supervisionFee,
        total_cost: totalCost,
        status: 'pending',
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
        invoice_date: invoiceDate,
        due_date: newInvoice.due_date,
      };

      await InvoiceService.createInvoice(invoiceData);
      await loadInvoices();
      setShowCreateModal(false);
      setNewInvoice({
        client_id: '',
        client_name: '',
        client_email: '',
        client_address: '',
        general_conditions_percentage: '18.5',
        supervision_fee: '',
        due_date: '',
      });
      setWorkTitles([]);
      setNewWorkTitle({ name: '', description: '', quantity: '', unit: '', unit_price: '', price: '' });
      setSelectedProposalId('');
      Alert.alert('Success', 'Invoice created successfully');
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  const handleUpdateInvoiceStatus = async (invoice: Invoice, newStatus: 'paid' | 'pending' | 'overdue' | 'partial-paid' | 'cancelled') => {
    try {
      // If partial-paid, show modal to enter amount
      if (newStatus === 'partial-paid') {
        setSelectedInvoice(invoice);
        setPartialPaidAmount(invoice.paid_amount?.toString() || '');
        setShowPartialPaidModal(true);
        return;
      }

      await InvoiceService.updateInvoice(invoice.id, {
        status: newStatus,
        ...(newStatus === 'paid' && { paid_amount: invoice.total_cost }),
      });
      await loadInvoices();
      setShowDetailModal(false);
      Alert.alert('Success', `Invoice status updated to ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      Alert.alert('Error', 'Failed to update invoice status');
    }
  };

  const handleConfirmPartialPaid = async () => {
    if (!selectedInvoice) return;

    const amount = parseFloat(partialPaidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount >= selectedInvoice.total_cost) {
      Alert.alert('Error', 'Paid amount cannot be greater than or equal to total cost. Use "Paid" status instead.');
      return;
    }

    try {
      await InvoiceService.updateInvoice(selectedInvoice.id, {
        status: 'partial-paid',
        paid_amount: amount,
      });
      await loadInvoices();
      setShowPartialPaidModal(false);
      setShowDetailModal(false);
      setPartialPaidAmount('');
      Alert.alert('Success', `Invoice status updated to Partial Paid ($${amount.toLocaleString()})`);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      Alert.alert('Error', 'Failed to update invoice status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#059669';
      case 'overdue': return '#ef4444';
      case 'partial-paid': return '#f59e0b';
      case 'pending': return '#3b82f6';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'partial-paid': return 'Partial Paid';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Calculate open balance
  const calculateOpenBalance = (invoice: Invoice): number => {
    if (invoice.status === 'paid') {
      // Only return 0 if paid_amount equals total_cost
      if (invoice.paid_amount !== undefined && invoice.paid_amount >= invoice.total_cost) {
        return 0;
      }
      // If status is paid but paid_amount is less than total, there's still a balance
      return invoice.total_cost - (invoice.paid_amount || 0);
    }
    if (invoice.status === 'partial-paid') {
      // Use paid_amount field if available
      const paid = invoice.paid_amount || 0;
      return invoice.total_cost - paid;
    }
    if (invoice.status === 'cancelled') return 0;
    // For pending, overdue, or any other status, return total_cost if no payment has been made
    if (invoice.paid_amount === undefined || invoice.paid_amount === 0) {
      return invoice.total_cost;
    }
    // If there's a paid_amount but status is not partial-paid or paid, still show remaining balance
    return invoice.total_cost - invoice.paid_amount;
  };

  // Categorize invoices by status
  const categorizeInvoices = () => {
    const pending: Invoice[] = [];
    const overdue: Invoice[] = [];
    const partialPaid: Invoice[] = [];
    const paid: Invoice[] = [];
    const cancelled: Invoice[] = [];

    invoices.forEach(invoice => {
      if (invoice.status === 'cancelled') {
        cancelled.push(invoice);
      } else if (invoice.status === 'pending') {
        pending.push(invoice);
      } else if (invoice.status === 'overdue') {
        overdue.push(invoice);
      } else if (invoice.status === 'partial-paid') {
        partialPaid.push(invoice);
      } else if (invoice.status === 'paid') {
        paid.push(invoice);
      }
    });

    return { pending, overdue, partialPaid, paid, cancelled };
  };

  // Filter invoices
  const filterInvoices = (invoiceList: Invoice[]) => {
    if (!filterQuery) return invoiceList;
    
    const query = filterQuery.toLowerCase();
    return invoiceList.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.client_name.toLowerCase().includes(query) ||
      (invoice.invoice_date && new Date(invoice.invoice_date).toLocaleDateString().toLowerCase().includes(query)) ||
      formatCurrency(invoice.total_cost).toLowerCase().includes(query) ||
      formatCurrency(calculateOpenBalance(invoice)).toLowerCase().includes(query)
    );
  };

  const { pending, overdue, partialPaid, paid, cancelled } = categorizeInvoices();
  
  // Get invoices to display based on filter
  const getDisplayedInvoices = (status: 'pending' | 'overdue' | 'partial-paid' | 'paid' | 'cancelled') => {
    let list: Invoice[] = [];
    if (status === 'pending') list = pending;
    else if (status === 'overdue') list = overdue;
    else if (status === 'partial-paid') list = partialPaid;
    else if (status === 'paid') list = paid;
    else if (status === 'cancelled') list = cancelled;
    
    return filterInvoices(list);
  };

  const handleExportPDF = async (invoice: Invoice) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Info', 'PDF export is only available on web');
      return;
    }

    try {
      // Convert logo to base64
      let logoBase64 = '';
      const logoPaths = [
        '/assets/images/logo.png',
        './assets/images/logo.png',
        'assets/images/logo.png',
        '/logo.png',
        window.location.origin + '/assets/images/logo.png',
      ];
      
      for (const logoPath of logoPaths) {
        try {
          const response = await fetch(logoPath);
          if (response.ok) {
            const blob = await response.blob();
            if (blob.type.startsWith('image/')) {
              const reader = new FileReader();
              logoBase64 = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              if (logoBase64) {
                console.log('Logo loaded from:', logoPath);
                break;
              }
            }
          }
        } catch (error) {
          // Try next path
        }
      }
      
      if (!logoBase64) {
        console.log('Logo not found in any path, using text fallback');
      }

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
            }
            body { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto;
              color: #333;
            }
            .header { 
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #236ecf;
            }
            .logo-container {
              flex: 1;
            }
            .logo {
              max-width: 200px;
              max-height: 80px;
            }
            .company-name-fallback {
              font-size: 28px;
              font-weight: bold;
              color: #236ecf;
              object-fit: contain;
            }
            .header-info {
              flex: 1;
              text-align: right;
            }
            .invoice-title {
              font-size: 36px;
              font-weight: bold;
              color: #236ecf;
              margin: 0 0 10px 0;
            }
            .invoice-number {
              font-size: 18px;
              color: #666;
              margin: 0;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-box {
              flex: 1;
              padding: 15px;
              background-color: #f9fafb;
              border-radius: 8px;
              margin-right: 15px;
            }
            .info-box:last-child {
              margin-right: 0;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin: 30px 0 15px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background-color: #fff;
            }
            .table thead {
              background-color: #236ecf;
              color: #fff;
            }
            .table th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            .table th.text-right {
              text-align: right;
            }
            .table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .table tbody tr:hover {
              background-color: #f9fafb;
            }
            .table tbody tr:last-child td {
              border-bottom: none;
            }
            .text-right {
              text-align: right;
            }
            .work-item-name {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 4px;
            }
            .work-item-desc {
              font-size: 12px;
              color: #6b7280;
              font-style: italic;
            }
            .total-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #236ecf;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 0;
              font-size: 18px;
              font-weight: bold;
            }
            .total-label {
              color: #1f2937;
            }
            .total-value {
              color: #059669;
              font-size: 24px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .footer p {
              margin: 5px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-pending {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-overdue {
              background-color: #fee2e2;
              color: #991b1b;
            }
            .status-partial-paid {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-cancelled {
              background-color: #f3f4f6;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo" />` : '<div class="company-name-fallback">BLUECREW</div>'}
            </div>
            <div class="header-info">
              <h1 class="invoice-title">INVOICE</h1>
              <p class="invoice-number">${invoice.invoice_number}</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <div class="info-label">Bill To</div>
              <div class="info-value">${invoice.client_name}</div>
              ${invoice.client_email ? `<div style="font-size: 14px; color: #6b7280; margin-top: 5px;">${invoice.client_email}</div>` : ''}
              ${invoice.client_address ? `<div style="font-size: 14px; color: #6b7280; margin-top: 5px;">${invoice.client_address}</div>` : ''}
            </div>
            <div class="info-box">
              <div class="info-label">Invoice Date</div>
              <div class="info-value">${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <div class="section-title">Work Items</div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.work_titles.map(wt => `
                <tr>
                  <td>
                    <div class="work-item-name">${wt.name}</div>
                    ${wt.description ? `<div class="work-item-desc">${wt.description}</div>` : ''}
                  </td>
                  <td class="text-right">${wt.quantity || 0}</td>
                  <td class="text-right">${wt.unit || ''}</td>
                  <td class="text-right">${formatCurrency(wt.unit_price || 0)}</td>
                  <td class="text-right">${formatCurrency(wt.price)}</td>
                </tr>
              `).join('')}
              <tr>
                <td><strong>General Conditions</strong></td>
                <td class="text-right"></td>
                <td class="text-right"></td>
                <td class="text-right"></td>
                <td class="text-right">${formatCurrency(invoice.general_conditions)}</td>
              </tr>
              ${invoice.supervision_fee > 0 ? `
              <tr>
                <td><strong>Supervision Fee</strong></td>
                <td class="text-right"></td>
                <td class="text-right"></td>
                <td class="text-right"></td>
                <td class="text-right">${formatCurrency(invoice.supervision_fee)}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">TOTAL</span>
              <span class="total-value">${formatCurrency(invoice.total_cost)}</span>
            </div>
            ${invoice.status === 'partial-paid' ? `
            <div class="total-row" style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
              <span class="total-label" style="color: #059669;">Paid Amount</span>
              <span class="total-value" style="color: #059669; font-size: 20px;">${formatCurrency(invoice.paid_amount || 0)}</span>
            </div>
            <div class="total-row" style="padding-top: 10px;">
              <span class="total-label" style="color: #dc2626; font-size: 20px;">Balance Due</span>
              <span class="total-value" style="color: #dc2626; font-size: 24px;">${formatCurrency(invoice.total_cost - (invoice.paid_amount || 0))}</span>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p><strong>Status:</strong> <span class="status-badge status-${invoice.status}">${getStatusText(invoice.status)}</span></p>
            <p>Created by: ${invoice.created_by_name}</p>
            <p>Created on: ${new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.invoice_number}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Also try to print
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  const workTitlesTotal = workTitles.reduce((sum, wt) => sum + (parseFloat(wt.price) || 0), 0);
  const supervisionFee = parseFloat(newInvoice.supervision_fee) || 0;
  const generalConditionsPercentage = parseFloat(newInvoice.general_conditions_percentage) || 18.5;
  const generalConditions = ((workTitlesTotal + supervisionFee) * generalConditionsPercentage) / 100;
  const totalCost = workTitlesTotal + generalConditions + supervisionFee;

  // Render invoice card for kanban board
  const renderInvoiceCard = (invoice: Invoice) => {
    const openBalance = calculateOpenBalance(invoice);
    return (
      <View key={invoice.id} style={styles.kanbanCard}>
        <View style={styles.kanbanCardHeader}>
          <Text style={styles.kanbanCardInvoiceNumber}>{invoice.invoice_number}</Text>
        </View>
        <View style={styles.kanbanCardBody}>
          <Text style={styles.kanbanCardClientName}>{invoice.client_name}</Text>
          {invoice.invoice_date && (
            <Text style={styles.kanbanCardDate}>
              Date: {new Date(invoice.invoice_date).toLocaleDateString()}
            </Text>
          )}
          {invoice.due_date && (
            <Text style={[styles.kanbanCardDate, { color: invoice.status === 'overdue' ? '#ef4444' : '#6b7280' }]}>
              Due: {new Date(invoice.due_date).toLocaleDateString()}
            </Text>
          )}
          <View style={styles.kanbanCardAmounts}>
            <View style={styles.kanbanCardAmountRow}>
              <Text style={styles.kanbanCardLabel}>Total:</Text>
              <Text style={styles.kanbanCardValue}>{formatCurrency(invoice.total_cost)}</Text>
            </View>
            {invoice.status === 'partial-paid' && invoice.paid_amount !== undefined && (
              <View style={styles.kanbanCardAmountRow}>
                <Text style={styles.kanbanCardLabel}>Paid:</Text>
                <Text style={[styles.kanbanCardValue, styles.kanbanCardPaidAmount]}>
                  {formatCurrency(invoice.paid_amount)}
                </Text>
              </View>
            )}
            <View style={styles.kanbanCardAmountRow}>
              <Text style={styles.kanbanCardLabel}>Balance:</Text>
              <Text style={[styles.kanbanCardValue, styles.kanbanCardOpenBalance]}>
                {formatCurrency(openBalance)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.kanbanCardActions}>
          <TouchableOpacity
            style={styles.kanbanCardActionButton}
            onPress={() => {
              setSelectedInvoice(invoice);
              setShowDetailModal(true);
            }}
          >
            <Eye size={16} color="#236ecf" />
            <Text style={styles.kanbanCardActionText}>View</Text>
          </TouchableOpacity>
          {((invoice.status === 'pending' || invoice.status === 'overdue') || 
            (invoice.status === 'partial-paid' && invoice.paid_amount !== undefined && invoice.paid_amount < invoice.total_cost)) && (
            <TouchableOpacity
              style={[styles.kanbanCardActionButton, styles.kanbanCardPayButton]}
              onPress={() => {
                setInvoiceToPay(invoice);
                setPayAmount('');
                setShowPayModal(true);
              }}
            >
              <DollarSign size={16} color="#ffffff" />
              <Text style={[styles.kanbanCardActionText, styles.kanbanCardPayButtonText]}>Pay</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.kanbanCardActionButton}
            onPress={() => handleExportPDF(invoice)}
          >
            <Download size={16} color="#059669" />
            <Text style={styles.kanbanCardActionText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render kanban column
  const renderKanbanColumn = (title: string, status: 'pending' | 'overdue' | 'partial-paid' | 'paid' | 'cancelled', color: string) => {
    const displayedInvoices = getDisplayedInvoices(status);
    return (
      <View style={styles.kanbanColumn}>
        <View style={[styles.kanbanColumnHeader, { borderTopColor: color }]}>
          <Text style={styles.kanbanColumnTitle}>{title}</Text>
          <View style={[styles.kanbanColumnBadge, { backgroundColor: color }]}>
            <Text style={styles.kanbanColumnBadgeText}>{displayedInvoices.length}</Text>
          </View>
        </View>
        <ScrollView 
          style={styles.kanbanColumnContent}
          contentContainerStyle={styles.kanbanColumnContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {displayedInvoices.length === 0 ? (
            <View style={styles.kanbanEmptyState}>
              <Text style={styles.kanbanEmptyText}>No invoices</Text>
            </View>
          ) : (
            displayedInvoices.map(invoice => renderInvoiceCard(invoice))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/sales')} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <View style={styles.headerTop}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Invoices</Text>
              <Text style={styles.subtitle}>{invoices.length} total invoices</Text>
            </View>
            {Platform.OS === 'web' && (
              <View style={[styles.headerActions, isMobileWeb && styles.headerActionsMobileWeb]}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilter(!showFilter)}
                >
                  <Filter size={20} color="#236ecf" />
                  <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
                {(canEditInvoices || userRole === 'admin' || userRole === 'sales') && userRole !== 'client' && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowCreateModal(true)}
                  >
                    <Plus size={20} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Filter Section - Web Only */}
        {Platform.OS === 'web' && showFilter && (
          <View style={styles.filterSection}>
            <View style={styles.filterInputContainer}>
              <Search size={20} color="#6b7280" />
              <TextInput
                style={styles.filterInput}
                placeholder="Search by invoice number, client name, date, amount..."
                value={filterQuery}
                onChangeText={setFilterQuery}
              />
              {filterQuery ? (
                <TouchableOpacity onPress={() => setFilterQuery('')}>
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* Mobile View - Keep existing card layout */}
        {Platform.OS !== 'web' ? (
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
            {invoices.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No invoices found</Text>
              </View>
            ) : (
              invoices.map((invoice) => (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.invoiceCard}
                  onPress={() => {
                    setSelectedInvoice(invoice);
                    setShowDetailModal(true);
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{invoice.invoice_number}</Text>
                      {invoice.project_name && (
                        <Text style={styles.cardSubtitle}>Project: {invoice.project_name}</Text>
                      )}
                      <Text style={styles.cardSubtitle}>Client: {invoice.client_name}</Text>
                      {invoice.invoice_date && (
                        <Text style={styles.cardSubtitle}>
                          Date: {new Date(invoice.invoice_date).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(invoice.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.totalAmount}>{formatCurrency(invoice.total_cost)}</Text>
                      {invoice.status === 'partial-paid' && invoice.paid_amount !== undefined && (
                        <View style={styles.cardPaymentInfo}>
                          <Text style={styles.cardPaidText}>Paid: {formatCurrency(invoice.paid_amount)}</Text>
                          <Text style={styles.cardBalanceText}>Balance: {formatCurrency(invoice.total_cost - invoice.paid_amount)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.dateText}>
                      Created: {new Date(invoice.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          /* Web View - Kanban Board */
          <View style={styles.kanbanBoard}>
            {renderKanbanColumn('Pending', 'pending', '#3b82f6')}
            {renderKanbanColumn('Overdue', 'overdue', '#ef4444')}
            {renderKanbanColumn('Partial Paid', 'partial-paid', '#f59e0b')}
            {renderKanbanColumn('Paid', 'paid', '#059669')}
            {renderKanbanColumn('Cancelled', 'cancelled', '#6b7280')}
          </View>
        )}

        {/* Create Invoice Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Invoice</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                setWorkTitles([]);
                setNewWorkTitle({ name: '', description: '', quantity: '', unit: '', unit_price: '', price: '' });
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Proposal Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Proposal (Optional)</Text>
                <Text style={styles.helperText}>
                  Select an approved proposal to automatically fill invoice data. If no invoice exists for the proposal, it will be created.
                </Text>
                <TouchableOpacity
                  style={styles.proposalSelectButton}
                  onPress={() => setShowProposalSelect(true)}
                >
                  <FileText size={18} color="#236ecf" />
                  <Text style={styles.proposalSelectButtonText}>
                    {selectedProposalId 
                      ? proposals.find(p => p.id === selectedProposalId)?.proposal_number || 'Select Proposal'
                      : 'Select Proposal'}
                  </Text>
                  {selectedProposalId && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedProposalId('');
                        setNewInvoice({
                          client_id: '',
                          client_name: '',
                          client_email: '',
                          client_address: '',
                          general_conditions_percentage: '18.5',
                          supervision_fee: '',
                          due_date: '',
                        });
                        setWorkTitles([]);
                      }}
                      style={styles.clearProposalButton}
                    >
                      <X size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>

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
                <View style={styles.clientList}>
                  {clients.map((client) => (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.clientOption,
                        newInvoice.client_id === client.id && styles.selectedClient
                      ]}
                      onPress={() => setNewInvoice(prev => ({
                        ...prev,
                        client_id: client.id,
                        client_name: client.name,
                        client_email: client.email || ''
                      }))}
                    >
                      <Text style={[
                        styles.clientText,
                        newInvoice.client_id === client.id && styles.selectedClientText
                      ]}>
                        {client.name}
                      </Text>
                      {newInvoice.client_id === client.id && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter client address"
                  value={newInvoice.client_address}
                  onChangeText={(text) => setNewInvoice(prev => ({ ...prev, client_address: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Due Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Due Date *</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={newInvoice.due_date || ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setNewInvoice(prev => ({ ...prev, due_date: e.target.value }));
                    }}
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
                      onPress={() => setShowDueDatePicker(true)}
                    >
                      <Text style={[styles.inputText, !newInvoice.due_date && styles.placeholderText]}>
                        {newInvoice.due_date 
                          ? new Date(newInvoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'Select due date'}
                      </Text>
                      <Calendar size={20} color="#6b7280" />
                    </TouchableOpacity>
                    {showDueDatePicker && (
                      <DateTimePicker
                        value={newInvoice.due_date ? new Date(newInvoice.due_date) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDueDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            setNewInvoice(prev => ({ ...prev, due_date: selectedDate.toISOString().split('T')[0] }));
                          }
                          if (Platform.OS === 'android') {
                            setShowDueDatePicker(false);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Work Titles Section */}
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
                          <Text style={styles.workTitleName}>{workTitle.name}</Text>
                          {workTitle.description && (
                            <Text style={styles.workTitleDescription}>{workTitle.description}</Text>
                          )}
                          <View style={styles.workTitleDetails}>
                            <Text style={styles.workTitleDetailText}>
                              Qty: {workTitle.quantity} {workTitle.unit}
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
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Work Description (optional)"
                    value={newWorkTitle.description}
                    onChangeText={(text) => setNewWorkTitle(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={2}
                  />
                  <View style={styles.quantityUnitRow}>
                    <View style={styles.quantityInputContainer}>
                      <Text style={styles.label}>Quantity *</Text>
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
                    </View>
                    <View style={styles.unitInputContainer}>
                      <Text style={styles.label}>Unit *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g., sq ft, hours"
                        value={newWorkTitle.unit}
                        onChangeText={(text) => setNewWorkTitle(prev => ({ ...prev, unit: text }))}
                      />
                    </View>
                  </View>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceLabel}>$</Text>
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
                    <TouchableOpacity
                      style={styles.addWorkTitleButton}
                      onPress={handleAddWorkTitle}
                    >
                      <Plus size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  {newWorkTitle.quantity && newWorkTitle.unit_price && (
                    <View style={styles.calculatedPriceContainer}>
                      <Text style={styles.calculatedPriceLabel}>Total Price:</Text>
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
                  <TextInput
                    style={[styles.input, styles.percentageInput]}
                    placeholder="18.5"
                    value={newInvoice.general_conditions_percentage}
                    onChangeText={(text) => setNewInvoice(prev => ({ ...prev, general_conditions_percentage: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={styles.percentageLabel}>%</Text>
                </View>
                {(() => {
                  const workTitlesTotal = workTitles.reduce((sum, wt) => sum + (parseFloat(wt.price) || 0), 0);
                  const supervisionFee = parseFloat(newInvoice.supervision_fee) || 0;
                  const generalConditionsPercentageInput = newInvoice.general_conditions_percentage.trim();
                  const percentage = generalConditionsPercentageInput === '' ? 18.5 : (isNaN(parseFloat(generalConditionsPercentageInput)) ? 18.5 : parseFloat(generalConditionsPercentageInput));
                  const generalConditionsAmount = ((workTitlesTotal + supervisionFee) * percentage) / 100;
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
                <Text style={styles.label}>Supervision Fee</Text>
                <View style={styles.priceInputRow}>
                  <Text style={styles.priceLabel}>$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter supervision fee amount"
                    value={newInvoice.supervision_fee}
                    onChangeText={(text) => setNewInvoice(prev => ({ ...prev, supervision_fee: text }))}
                    keyboardType="numeric"
                  />
                </View>
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

              <TouchableOpacity style={styles.submitButton} onPress={handleCreateInvoice}>
                <Text style={styles.submitButtonText}>Create Invoice</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Invoice Detail Modal */}
        <Modal
          visible={showDetailModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <TouchableOpacity onPress={() => {
                setShowDetailModal(false);
                setSelectedInvoice(null);
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedInvoice && (
                <>
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <Text style={styles.detailTitle}>{selectedInvoice.invoice_number}</Text>
                      {Platform.OS === 'web' && (
                        <TouchableOpacity
                          style={styles.downloadButton}
                          onPress={() => handleExportPDF(selectedInvoice)}
                        >
                          <Download size={18} color="#236ecf" />
                          <Text style={styles.downloadButtonText}>Download PDF</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {selectedInvoice.project_name && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Project:</Text>
                        <Text style={styles.detailValue}>{selectedInvoice.project_name}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Client:</Text>
                      <Text style={styles.detailValue}>{selectedInvoice.client_name}</Text>
                    </View>
                    {selectedInvoice.client_email && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Client Email:</Text>
                        <Text style={styles.detailValue}>{selectedInvoice.client_email}</Text>
                      </View>
                    )}
                    {selectedInvoice.client_address && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Address:</Text>
                        <Text style={styles.detailValue}>{selectedInvoice.client_address}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Invoice Date:</Text>
                      <Text style={styles.detailValue}>
                        {selectedInvoice.invoice_date 
                          ? new Date(selectedInvoice.invoice_date).toLocaleDateString()
                          : new Date(selectedInvoice.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedInvoice.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(selectedInvoice.status)}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created by:</Text>
                      <Text style={styles.detailValue}>{selectedInvoice.created_by_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created at:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedInvoice.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Work Titles</Text>
                    {selectedInvoice.work_titles.map((workTitle, index) => (
                      <View key={index} style={styles.workTitleDetailItem}>
                        <View style={styles.workTitleDetailHeader}>
                          <Text style={styles.workTitleDetailNumber}>{index + 1}.</Text>
                          <Text style={styles.workTitleDetailName}>{workTitle.name}</Text>
                        </View>
                        {workTitle.description && (
                          <Text style={styles.workTitleDetailDescription}>{workTitle.description}</Text>
                        )}
                        <View style={styles.workTitleDetailInfo}>
                          <Text style={styles.workTitleDetailInfoText}>
                            Quantity: {workTitle.quantity || 0} {workTitle.unit || ''}
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
                      <Text style={styles.detailValue}>{formatCurrency(selectedInvoice.general_conditions)}</Text>
                    </View>
                    {selectedInvoice.supervision_fee > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Supervision Fee:</Text>
                        <Text style={styles.detailValue}>{formatCurrency(selectedInvoice.supervision_fee)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.totalCostRow}>
                      <Text style={styles.totalCostLabel}>Total Cost:</Text>
                      <Text style={styles.totalCostValue}>{formatCurrency(selectedInvoice.total_cost)}</Text>
                    </View>
                  </View>

                  {/* Payment History Section */}
                  {(selectedInvoice.status === 'partial-paid' || selectedInvoice.status === 'paid') && (
                    <View style={styles.detailSection}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Payment History</Text>
                      </View>
                      
                      {/* Payment Summary for Partial Paid invoices */}
                      {selectedInvoice.status === 'partial-paid' && (
                        <View style={styles.paymentSummaryContainer}>
                          <View style={styles.paymentSummaryRow}>
                            <Text style={styles.paymentSummaryLabel}>Paid Amount:</Text>
                            <Text style={styles.paymentSummaryPaid}>
                              {formatCurrency(selectedInvoice.paid_amount || 0)}
                            </Text>
                          </View>
                          <View style={styles.paymentSummaryRow}>
                            <Text style={styles.paymentSummaryLabel}>Balance Due:</Text>
                            <Text style={styles.paymentSummaryBalance}>
                              {formatCurrency(selectedInvoice.total_cost - (selectedInvoice.paid_amount || 0))}
                            </Text>
                          </View>
                        </View>
                      )}
                      
                      {/* Show Paid label for fully paid invoices */}
                      {selectedInvoice.status === 'paid' && (
                        <View style={styles.paymentSummaryContainer}>
                          <View style={styles.paymentSummaryRow}>
                            <Text style={styles.paymentSummaryLabel}>Paid Amount:</Text>
                            <Text style={styles.paymentSummaryPaid}>
                              {formatCurrency(selectedInvoice.paid_amount || selectedInvoice.total_cost)}
                            </Text>
                          </View>
                          {selectedInvoice.paid_amount && selectedInvoice.paid_amount < selectedInvoice.total_cost && (
                            <View style={styles.paymentSummaryRow}>
                              <Text style={styles.paymentSummaryLabel}>Balance Due:</Text>
                              <Text style={styles.paymentSummaryBalance}>
                                {formatCurrency(selectedInvoice.total_cost - selectedInvoice.paid_amount)}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Payment History Cards */}
                      {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Payment History</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentHistoryScroll}>
                            <View style={styles.paymentHistoryRow}>
                              {selectedInvoice.payments
                                .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                                .map((payment, index) => (
                                  <TouchableOpacity
                                    key={payment.id}
                                    style={styles.paymentHistoryItem}
                                    onPress={() => {
                                      setSelectedPayment(payment);
                                      setShowPaymentDetailModal(true);
                                    }}
                                  >
                                    <Text style={styles.paymentHistoryDate}>
                                      {new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Text>
                                    <Text style={styles.paymentHistoryAmount}>
                                      ${payment.amount.toLocaleString()}
                                    </Text>
                                    <Text style={styles.paymentHistoryMethod}>
                                      {payment.payment_method.toUpperCase().replace('_', ' ')}
                                      {payment.check_number && ` #${payment.check_number}`}
                                      {payment.reference_number && ` (${payment.reference_number})`}
                                    </Text>
                                    <Text style={styles.paymentHistoryPaidBy} numberOfLines={1}>
                                      {payment.paid_by_name}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                            </View>
                          </ScrollView>
                          <View style={styles.paymentHistoryFooter}>
                            <Text style={styles.paymentHistoryFooterLabel}>Total Paid:</Text>
                            <Text style={styles.paymentHistoryFooterAmount}>
                              ${(selectedInvoice.total_paid || selectedInvoice.paid_amount || 0).toLocaleString()} / ${selectedInvoice.total_cost.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Client Approval Section - Only for client role */}
                  {userRole === 'client' && (
                    <View style={styles.detailSection}>
                      <View style={styles.clientApprovalContainer}>
                        <TouchableOpacity
                          style={styles.clientApprovalCheckbox}
                          onPress={async () => {
                            if (!selectedInvoice) return;
                            try {
                              const newApprovalStatus = !selectedInvoice.client_approved;
                              await InvoiceService.updateInvoice(selectedInvoice.id, {
                                client_approved: newApprovalStatus,
                                client_approved_at: newApprovalStatus ? new Date().toISOString() : undefined,
                                client_approved_by: newApprovalStatus ? (user?.id || '') : undefined,
                                client_approved_by_name: newApprovalStatus ? (user?.name || 'Unknown') : undefined,
                              });
                              // Reload invoice
                              const updatedInvoice = await InvoiceService.getInvoiceById(selectedInvoice.id);
                              if (updatedInvoice) {
                                setSelectedInvoice(updatedInvoice);
                                // Reload invoices list
                                loadInvoices();
                              }
                            } catch (error) {
                              console.error('Error updating client approval:', error);
                              Alert.alert('Error', 'Failed to update approval status');
                            }
                          }}
                        >
                          {selectedInvoice.client_approved ? (
                            <CheckCircle size={24} color="#10b981" />
                          ) : (
                            <Circle size={24} color="#6b7280" />
                          )}
                        </TouchableOpacity>
                        <View style={styles.clientApprovalTextContainer}>
                          <Text style={styles.clientApprovalLabel}>
                            I approve this invoice
                          </Text>
                          {selectedInvoice.client_approved && selectedInvoice.client_approved_at && (
                            <Text style={styles.clientApprovalDate}>
                              Approved on {new Date(selectedInvoice.client_approved_at).toLocaleDateString()}
                              {selectedInvoice.client_approved_by_name && ` by ${selectedInvoice.client_approved_by_name}`}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Client Approval Status - For non-client roles */}
                  {userRole !== 'client' && selectedInvoice.client_approved && (
                    <View style={styles.detailSection}>
                      <View style={styles.clientApprovalStatusContainer}>
                        <CheckCircle size={20} color="#10b981" />
                        <Text style={styles.clientApprovalStatusText}>
                          Client approved on {new Date(selectedInvoice.client_approved_at || '').toLocaleDateString()}
                          {selectedInvoice.client_approved_by_name && ` by ${selectedInvoice.client_approved_by_name}`}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Comments Section */}
                  <View style={styles.detailSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Comments</Text>
                      {(canEditInvoices || userRole === 'admin' || userRole === 'sales') && (
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
                    {(canEditInvoices || userRole === 'admin' || userRole === 'sales') && (
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

                  {/* Pay Button for Pending, Overdue, and Partial Paid invoices */}
                  {((selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') || 
                    (selectedInvoice.status === 'partial-paid' && selectedInvoice.paid_amount !== undefined && selectedInvoice.paid_amount < selectedInvoice.total_cost)) && (
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => {
                        setInvoiceToPay(selectedInvoice);
                        setPayAmount('');
                        setShowPayModal(true);
                      }}
                    >
                      <DollarSign size={20} color="#ffffff" />
                      <Text style={styles.payButtonText}>
                        {selectedInvoice.status === 'partial-paid' 
                          ? `Pay Remaining ${formatCurrency(selectedInvoice.total_cost - (selectedInvoice.paid_amount || 0))}`
                          : `Pay ${formatCurrency(selectedInvoice.total_cost)}`}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Create Project Button removed - Project creation is only available from Proposals */}
                </>
              )}
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
              <ScrollView style={styles.categoryList}>
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

        {/* Partial Paid Amount Modal */}
        <Modal
          visible={showPartialPaidModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Paid Amount</Text>
              <TouchableOpacity onPress={() => {
                setShowPartialPaidModal(false);
                setPartialPaidAmount('');
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedInvoice && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Total Invoice Amount</Text>
                    <Text style={[styles.input, { backgroundColor: '#f3f4f6', color: '#6b7280' }]}>
                      {formatCurrency(selectedInvoice.total_cost)}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Paid Amount *</Text>
                    <TextInput
                      style={styles.input}
                      value={partialPaidAmount}
                      onChangeText={(text) => {
                        // Only allow numbers and decimal point
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        setPartialPaidAmount(cleaned);
                      }}
                      placeholder="Enter amount paid"
                      keyboardType="numeric"
                    />
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      Enter the amount the client has paid (must be less than total)
                    </Text>
                  </View>

                  {partialPaidAmount && !isNaN(parseFloat(partialPaidAmount)) && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Remaining Balance</Text>
                      <Text style={[styles.input, { backgroundColor: '#fef2f2', color: '#ef4444', fontWeight: '600' }]}>
                        {formatCurrency(selectedInvoice.total_cost - parseFloat(partialPaidAmount))}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleConfirmPartialPaid}
                  >
                    <Text style={styles.submitButtonText}>Update Status</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Pay Modal */}
        <Modal
          visible={showPayModal}
          transparent={true}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.categoryModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Record Payment</Text>
                <TouchableOpacity onPress={() => {
                  setShowPayModal(false);
                  setPayAmount('');
                  setInvoiceToPay(null);
                }}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                {invoiceToPay && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Total Invoice Amount</Text>
                      <Text style={[styles.input, { backgroundColor: '#f3f4f6', color: '#6b7280' }]}>
                        {formatCurrency(invoiceToPay.total_cost)}
                      </Text>
                    </View>

                    {(invoiceToPay.paid_amount !== undefined && invoiceToPay.paid_amount > 0) && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Paid Amount</Text>
                        <Text style={[styles.input, { backgroundColor: '#f3f4f6', color: '#6b7280' }]}>
                          {formatCurrency(invoiceToPay.paid_amount)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Remaining Balance</Text>
                      <Text style={[styles.input, { backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '600' }]}>
                        {formatCurrency(invoiceToPay.total_cost - (invoiceToPay.paid_amount || 0))}
                      </Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Payment Amount *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter payment amount"
                        placeholderTextColor="#9ca3af"
                        value={payAmount}
                        onChangeText={setPayAmount}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.helperText}>
                        Maximum: {formatCurrency(invoiceToPay.total_cost - (invoiceToPay.paid_amount || 0))}
                      </Text>
                    </View>

                    <View style={styles.modalActionButtons}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setShowPayModal(false);
                          setPayAmount('');
                          setInvoiceToPay(null);
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.submitButton, styles.modalPrimaryButton]}
                        onPress={handlePay}
                      >
                        <DollarSign size={18} color="#1f2937" />
                        <Text style={styles.submitButtonText}>Record Payment</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Payment Detail Modal - Small Popup */}
        <Modal
          visible={showPaymentDetailModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.paymentDetailOverlay}>
            <View style={styles.paymentDetailModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Payment Details</Text>
                <TouchableOpacity onPress={() => {
                  setShowPaymentDetailModal(false);
                  setSelectedPayment(null);
                }}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.paymentDetailBody}>
                {selectedPayment && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={[styles.detailValue, { color: '#10b981', fontWeight: 'bold', fontSize: 18 }]}>
                        ${selectedPayment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Date:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedPayment.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Method:</Text>
                      <Text style={styles.detailValue}>
                        {selectedPayment.payment_method.toUpperCase().replace('_', ' ')}
                      </Text>
                    </View>
                    {selectedPayment.check_number && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Check Number:</Text>
                        <Text style={styles.detailValue}>{selectedPayment.check_number}</Text>
                      </View>
                    )}
                    {selectedPayment.reference_number && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Reference Number:</Text>
                        <Text style={styles.detailValue}>{selectedPayment.reference_number}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Paid By:</Text>
                      <Text style={styles.detailValue}>{selectedPayment.paid_by_name}</Text>
                    </View>
                    {selectedPayment.notes && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notes:</Text>
                        <Text style={styles.detailValue}>{selectedPayment.notes}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Created At:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedPayment.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    {/* Payment Documents Section */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Documents (Optional)</Text>
                      <View style={styles.documentButtons}>
                        <TouchableOpacity
                          style={[styles.documentButton, uploadingPaymentDocument && styles.documentButtonDisabled]}
                          onPress={handlePickPaymentImage}
                          disabled={uploadingPaymentDocument}
                        >
                          <Paperclip size={18} color="#236ecf" />
                          <Text style={styles.documentButtonText}>Add Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.documentButton, uploadingPaymentDocument && styles.documentButtonDisabled]}
                          onPress={handlePickPaymentDocument}
                          disabled={uploadingPaymentDocument}
                        >
                          <FileText size={18} color="#236ecf" />
                          <Text style={styles.documentButtonText}>Add Document</Text>
                        </TouchableOpacity>
                      </View>
                      {uploadingPaymentDocument && (
                        <View style={styles.uploadingContainer}>
                          <ActivityIndicator size="small" color="#236ecf" />
                          <Text style={styles.uploadingText}>Uploading...</Text>
                        </View>
                      )}
                      {paymentDocuments.length > 0 && (
                        <View style={styles.documentsList}>
                          {paymentDocuments.map((doc) => (
                            <View key={doc.id} style={styles.documentItem}>
                              <FileText size={16} color="#6b7280" />
                              <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                              <TouchableOpacity
                                onPress={() => {
                                  if (doc.file_url) {
                                    window.open(doc.file_url, '_blank');
                                  }
                                }}
                                style={styles.viewDocumentButton}
                              >
                                <Eye size={16} color="#236ecf" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.removeDocumentButton}
                                onPress={() => removePaymentDocument(doc.id)}
                              >
                                <X size={16} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                )}
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
              <ScrollView style={styles.categoryList}>
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
                <Text style={styles.label}>Temporary Password *</Text>
                <TextInput
                  style={styles.input}
                  value={newClient.temporaryPassword}
                  onChangeText={(text) => setNewClient(prev => ({ ...prev, temporaryPassword: text }))}
                  placeholder="Enter temporary password (min 6 characters)"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Client will use this password to login
                </Text>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddNewClient}>
                <Text style={styles.submitButtonText}>Add Client</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Proposal Selection Modal */}
        <Modal
          visible={showProposalSelect}
          transparent={true}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Proposal</Text>
              <TouchableOpacity onPress={() => setShowProposalSelect(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.helperText}>
                Select an approved proposal to automatically fill invoice data. Only proposals that don't have an invoice yet are shown.
              </Text>
              
              {proposals.length === 0 ? (
                <View style={styles.emptyState}>
                  <FileText size={48} color="#9ca3af" />
                  <Text style={styles.emptyText}>No approved proposals available</Text>
                  <Text style={styles.emptySubtext}>All approved proposals already have invoices</Text>
                </View>
              ) : (
                proposals
                  .filter(p => !invoices.find(inv => inv.proposal_id === p.id)) // Filter out proposals that already have invoices
                  .map((proposal) => (
                    <TouchableOpacity
                      key={proposal.id}
                      style={[
                        styles.proposalOption,
                        selectedProposalId === proposal.id && styles.selectedProposal
                      ]}
                      onPress={() => handleSelectProposal(proposal.id)}
                    >
                      <View style={styles.proposalOptionContent}>
                        <Text style={styles.proposalOptionNumber}>{proposal.proposal_number}</Text>
                        <Text style={styles.proposalOptionClient}>Client: {proposal.client_name}</Text>
                        <Text style={styles.proposalOptionDate}>
                          Date: {new Date(proposal.proposal_date || proposal.created_at).toLocaleDateString()}
                        </Text>
                        <Text style={styles.proposalOptionTotal}>
                          Total: ${proposal.total_cost.toLocaleString()}
                        </Text>
                      </View>
                      {selectedProposalId === proposal.id && (
                        <View style={styles.selectedIndicator}>
                          <CheckCircle size={20} color="#059669" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Bottom Menu - Sales Navigation (not for clients) */}
        {userRole !== 'client' && (
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
                style={styles.bottomMenuItem}
                onPress={() => router.push('/proposals')}
              >
                <FileText size={24} color="#f59e0b" />
                <Text style={styles.bottomMenuText}>Proposals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomMenuItem, styles.activeMenuItem]}
                onPress={() => router.push('/invoices')}
              >
                <Receipt size={24} color="#ef4444" />
                <Text style={[styles.bottomMenuText, styles.activeMenuText]}>Invoices</Text>
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerActionsMobileWeb: {
    // Reserve space for the HamburgerMenu button on the far right (mobile web)
    paddingRight: 56,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  filterButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#ffcc00',
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
  filterSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  filterInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  filterToggle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filterToggleActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterToggleTextActive: {
    color: '#ffffff',
  },
  // Kanban Board Styles
  kanbanBoard: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    ...(Platform.OS === 'web' ? {
      overflowX: 'auto' as any,
      overflowY: 'hidden' as any,
      minHeight: 0,
      paddingBottom: 40,
    } : {}),
  },
  kanbanColumn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    ...(Platform.OS === 'web' ? {
      height: '100%',
      minHeight: 0,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' as any,
    } : {}),
  },
  kanbanColumnHeader: {
    padding: 16,
    borderTopWidth: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kanbanColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  kanbanColumnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kanbanColumnBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  kanbanColumnContent: {
    flex: 1,
    padding: 12,
    ...(Platform.OS === 'web' ? {
      overflowY: 'auto' as any,
      minHeight: 0,
    } : {}),
  },
  kanbanColumnContentContainer: {
    gap: 12,
    paddingBottom: 12,
    ...(Platform.OS === 'web' ? {
      paddingBottom: 20,
    } : {}),
  },
  kanbanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' as any,
      marginBottom: 12,
    } : {}),
  },
  kanbanCardHeader: {
    marginBottom: 8,
  },
  kanbanCardInvoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#236ecf',
  },
  kanbanCardBody: {
    marginBottom: 12,
  },
  kanbanCardClientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  kanbanCardDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  kanbanCardAmounts: {
    gap: 4,
  },
  kanbanCardAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kanbanCardLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  kanbanCardValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  kanbanCardOpenBalance: {
    color: '#ef4444',
  },
  kanbanCardPaidAmount: {
    color: '#10b981',
  },
  kanbanCardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  kanbanCardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    gap: 4,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer' as any,
      transition: 'all 0.2s ease' as any,
    } : {}),
  },
  kanbanCardActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  kanbanCardPayButton: {
    backgroundColor: '#10b981',
  },
  kanbanCardPayButtonText: {
    color: '#ffffff',
  },
  kanbanEmptyState: {
    padding: 20,
    alignItems: 'center',
  },
  kanbanEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
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
    ...(Platform.OS === 'web' ? {
      minHeight: 0,
      overflow: 'hidden' as any,
    } : {}),
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
  invoiceCard: {
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
  cardPaymentInfo: {
    marginTop: 4,
  },
  cardPaidText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  cardBalanceText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' ? {
      maxWidth: 800,
      alignSelf: 'center' as any,
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' as any,
    } : {}),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  projectList: {
    gap: 8,
  },
  projectOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedProject: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
  },
  projectText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedProjectText: {
    color: '#236ecf',
    fontWeight: '600',
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
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#236ecf',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#236ecf',
    fontWeight: '600',
  },
  newClientForm: {
    gap: 8,
    marginTop: 8,
  },
  selectedIndicator: {
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
  unitInputContainer: {
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
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
  },
  submitButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: Platform.OS === 'web' ? 20 : 24,
    paddingHorizontal: Platform.OS === 'web' ? 0 : 4,
  },
  modalPrimaryButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: '#374151',
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
  paymentSummaryContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  paymentSummaryPaid: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  paymentSummaryBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
  },
  rejectionReason: {
    fontSize: 14,
    color: '#6b7280',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusButtonActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  clientApprovalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  clientApprovalCheckbox: {
    padding: 4,
  },
  clientApprovalTextContainer: {
    flex: 1,
  },
  clientApprovalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  clientApprovalDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  clientApprovalStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  clientApprovalStatusText: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
  createProjectButton: {
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
  createProjectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  proposalSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  proposalSelectButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  clearProposalButton: {
    padding: 4,
  },
  proposalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  selectedProposal: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  proposalOptionContent: {
    flex: 1,
  },
  proposalOptionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  proposalOptionClient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  proposalOptionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  proposalOptionTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
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
  categoryModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    margin: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' as any,
    } : {}),
  },
  categoryList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'web' ? 20 : 24,
    maxHeight: 500,
  },
  categoryListContent: {
    padding: 16,
    paddingBottom: 24,
  },
  paymentHistoryScroll: {
    marginTop: 8,
  },
  paymentHistoryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  paymentHistoryItem: {
    minWidth: 180,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginRight: 8,
  },
  paymentHistoryDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  paymentHistoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  paymentHistoryMethod: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  paymentHistoryPaidBy: {
    fontSize: 11,
    color: '#9ca3af',
  },
  paymentHistoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentHistoryFooterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paymentHistoryFooterAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  paymentDetailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  paymentDetailModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10001,
  },
  paymentDetailBody: {
    maxHeight: 400,
  },
  documentButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  documentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentButtonDisabled: {
    opacity: 0.5,
  },
  documentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#236ecf',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: '#236ecf',
  },
  documentsList: {
    marginTop: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  viewDocumentButton: {
    padding: 4,
  },
  removeDocumentButton: {
    padding: 4,
  },
  categoryOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
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
  },
  selectedCategoryText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#236ecf',
  },
  inputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
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

