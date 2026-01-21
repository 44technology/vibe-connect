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
import { Plus, X, DollarSign, Calendar, Trash, Building2, Briefcase, Package, ShoppingCart, FileText, Filter, Upload, Paperclip, Eye, CheckCircle, XCircle, Clock, CreditCard, Search } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Expense, Project, ExpenseDocument, ExpensePayment } from '@/types';
import { ExpenseService } from '@/services/expenseService';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ProjectService } from '@/services/projectService';
import { SubContractorService } from '@/services/subContractorService';
import { VendorService } from '@/services/vendorService';
import { MaterialRequestService } from '@/services/materialRequestService';
import HamburgerMenu from '@/components/HamburgerMenu';

export default function ExpensesScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'project' | 'office'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ExpensePayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'check' as 'check' | 'wire' | 'ach' | 'credit_card' | 'cash' | 'other',
    check_number: '',
    reference_number: '',
    notes: '',
  });
  
  const [newExpense, setNewExpense] = useState({
    type: 'other' as 'subcontractor' | 'material' | 'office' | 'project' | 'other',
    category: '',
    amount: '',
    description: '',
    invoice_number: '',
    project_id: '',
    project_name: '',
    step_id: '',
    step_name: '',
    is_office: false,
    vendor_id: '',
    vendor_name: '',
    subcontractor_id: '',
    subcontractor_name: '',
    material_request_id: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [projectSteps, setProjectSteps] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<ExpenseDocument[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [paymentDocuments, setPaymentDocuments] = useState<ExpenseDocument[]>([]);
  const [uploadingPaymentDocument, setUploadingPaymentDocument] = useState(false);

  // Load payment documents when payment is selected
  useEffect(() => {
    if (selectedPayment && selectedPayment.documents) {
      setPaymentDocuments(selectedPayment.documents);
    } else {
      setPaymentDocuments([]);
    }
  }, [selectedPayment]);

  // Office expense categories
  const officeCategories = ['Book', 'Stationery', 'Kitchen', 'Office Supplies', 'Utilities', 'Rent', 'Other'];
  
  // Project expense categories
  const projectCategories = ['Toll', 'Parking', 'Permit', 'Inspection', 'Equipment Rental', 'Vehicle Gas', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  // Load project steps when project is selected
  useEffect(() => {
    const loadProjectSteps = async () => {
      if (newExpense.project_id && !newExpense.is_office) {
        try {
          setLoadingSteps(true);
          const project = await ProjectService.getProjectById(newExpense.project_id);
          if (project && project.steps) {
            // Get only parent steps (work titles)
            const parentSteps = project.steps.filter(step => step.step_type === 'parent');
            setProjectSteps(parentSteps.map(step => ({ id: step.id, name: step.name })));
          } else {
            setProjectSteps([]);
          }
        } catch (error) {
          console.error('Error loading project steps:', error);
          setProjectSteps([]);
        } finally {
          setLoadingSteps(false);
        }
      } else {
        setProjectSteps([]);
        // Reset step selection when project is cleared or office expense is selected
        setNewExpense(prev => ({ ...prev, step_id: '', step_name: '' }));
      }
    };
    loadProjectSteps();
  }, [newExpense.project_id, newExpense.is_office]);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadExpenses();
      await loadProjects();
      await loadSubcontractors();
      await loadVendors();
      await loadMaterialRequests();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadData();
  };

  const loadExpenses = async () => {
    try {
      const allExpenses = await ExpenseService.getExpenses();
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      Alert.alert('Error', 'Failed to load expenses');
    }
  };

  const loadProjects = async () => {
    try {
      const allProjects = await ProjectService.getProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadSubcontractors = async () => {
    try {
      const allSubcontractors = await SubContractorService.getSubContractors();
      setSubcontractors(allSubcontractors);
    } catch (error) {
      console.error('Error loading subcontractors:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const allVendors = await VendorService.getVendors();
      setVendors(allVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const loadMaterialRequests = async () => {
    try {
      const allRequests = await MaterialRequestService.getMaterialRequests();
      // Only show approved and delivered material requests
      const deliveredRequests = allRequests.filter(req => 
        req.status === 'approved' && req.purchase_status === 'delivered'
      );
      setMaterialRequests(deliveredRequests);
    } catch (error) {
      console.error('Error loading material requests:', error);
    }
  };

  const handleCreateExpense = async () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!newExpense.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    // Validate based on type
    if (newExpense.type === 'subcontractor' && !newExpense.subcontractor_id) {
      Alert.alert('Error', 'Please select a subcontractor');
      return;
    }

    if (newExpense.type === 'material' && !newExpense.vendor_id && !newExpense.material_request_id) {
      Alert.alert('Error', 'Please select a vendor or material request');
      return;
    }

    if (!newExpense.is_office && !newExpense.project_id) {
      Alert.alert('Error', 'Please select a project or mark as office expense');
      return;
    }

    try {
      // Build expense data object, excluding undefined values
      const expenseData: any = {
        type: newExpense.type,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description.trim(),
        is_office: newExpense.is_office,
        date: newExpense.date,
        status: 'pending',
        total_paid: 0,
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
      };

      // Only add optional fields if they have values
      if (newExpense.category && newExpense.category.trim()) {
        expenseData.category = newExpense.category.trim();
      }
      
      if (!newExpense.is_office) {
        if (newExpense.project_id && newExpense.project_id.trim()) {
          expenseData.project_id = newExpense.project_id.trim();
        }
        if (newExpense.project_name && newExpense.project_name.trim()) {
          expenseData.project_name = newExpense.project_name.trim();
        }
      }
      
      if (newExpense.vendor_id && newExpense.vendor_id.trim()) {
        expenseData.vendor_id = newExpense.vendor_id.trim();
      }
      if (newExpense.vendor_name && newExpense.vendor_name.trim()) {
        expenseData.vendor_name = newExpense.vendor_name.trim();
      }
      
      if (newExpense.subcontractor_id && newExpense.subcontractor_id.trim()) {
        expenseData.subcontractor_id = newExpense.subcontractor_id.trim();
      }
      if (newExpense.subcontractor_name && newExpense.subcontractor_name.trim()) {
        expenseData.subcontractor_name = newExpense.subcontractor_name.trim();
      }
      
      if (newExpense.material_request_id && newExpense.material_request_id.trim()) {
        expenseData.material_request_id = newExpense.material_request_id.trim();
      }
      
      if (newExpense.step_id && newExpense.step_id.trim()) {
        expenseData.step_id = newExpense.step_id.trim();
      }
      if (newExpense.step_name && newExpense.step_name.trim()) {
        expenseData.step_name = newExpense.step_name.trim();
      }
      
      if (uploadedDocuments.length > 0) {
        expenseData.documents = uploadedDocuments;
      }

      const expenseId = await ExpenseService.createExpense(expenseData);
      
      // Upload documents if any
      if (uploadedDocuments.length > 0) {
        for (const doc of uploadedDocuments) {
          // Documents are already uploaded, just need to save metadata
          // The documents array is already included in expenseData
        }
      }

      await loadExpenses();
      setShowCreateModal(false);
      resetNewExpense();
      setUploadedDocuments([]);
      Alert.alert('Success', 'Expense created successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense');
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      await ExpenseService.deleteExpense(expenseToDelete.id);
      await loadExpenses();
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      Alert.alert('Success', 'Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense');
    }
  };

  const resetNewExpense = () => {
    setNewExpense({
      type: 'other',
      category: '',
      amount: '',
      description: '',
      invoice_number: '',
      project_id: '',
      project_name: '',
      step_id: '',
      step_name: '',
      is_office: false,
      vendor_id: '',
      vendor_name: '',
      subcontractor_id: '',
      subcontractor_name: '',
      material_request_id: '',
      date: new Date().toISOString().split('T')[0],
    });
    setUploadedDocuments([]);
    setProjectSteps([]);
  };

  const handlePickDocument = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Use file input
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
        input.style.display = 'none';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadDocument(file);
          }
          // Clean up
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };
        window.document.body.appendChild(input);
        input.click();
        return;
      } else {
        // Mobile: Use document picker
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          await uploadDocument(blob, asset.name || 'document');
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
      setUploadingDocument(false);
    }
  };

  const handlePickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Use file input
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadDocument(file);
          }
          // Clean up
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };
        window.document.body.appendChild(input);
        input.click();
        return;
      } else {
        // Mobile: Use image picker
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
          await uploadDocument(blob, fileName);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setUploadingDocument(false);
    }
  };

  const uploadDocument = async (file: File | Blob, fileName?: string) => {
    try {
      setUploadingDocument(true);
      
      const name = fileName || (file instanceof File ? file.name : 'document');
      const fileType = name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document';
      
      // Upload to Firebase Storage
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      
      // Sanitize filename to avoid issues
      const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `expenses/temp/${Date.now()}_${sanitizedName}`);
      
      // Ensure we have a proper File or Blob
      let fileToUpload: File | Blob = file;
      if (file instanceof Blob && !(file instanceof File)) {
        // Convert Blob to File if needed
        fileToUpload = new File([file], name, { type: file.type || 'application/octet-stream' });
      }
      
      await uploadBytes(storageRef, fileToUpload);
      const fileUrl = await getDownloadURL(storageRef);

      // Create document object
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

      setUploadedDocuments(prev => [...prev, document]);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      let errorMessage = 'Failed to upload document';
      let errorDetails = '';
      
      if (error?.code === 'storage/unauthorized') {
        errorMessage = 'Unauthorized: Please check Firebase Storage permissions';
      } else if (error?.code === 'storage/canceled') {
        errorMessage = 'Upload canceled';
      } else if (error?.message?.includes('CORS') || error?.code === 'storage/unknown' || error?.message?.includes('blocked by CORS')) {
        errorMessage = 'CORS Error: Firebase Storage CORS settings need to be configured';
        errorDetails = 'Please configure CORS in Firebase Console:\n1. Go to Storage → Settings → CORS\n2. Add origin: https://bluecrew-app.netlify.app\n3. Allow methods: GET, POST, PUT, DELETE, HEAD, OPTIONS';
      } else if (error?.code === 'storage/quota-exceeded') {
        errorMessage = 'Storage quota exceeded';
      } else if (error?.code === 'storage/unauthenticated') {
        errorMessage = 'Please log in to upload files';
      }
      
      if (errorDetails) {
        Alert.alert('CORS Configuration Required', errorDetails);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setUploadingDocument(false);
    }
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  // Payment document upload functions
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
    if (!selectedPayment || !selectedExpense) return;
    
    try {
      setUploadingPaymentDocument(true);
      
      const name = fileName || (file instanceof File ? file.name : 'document');
      const fileType = name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document';
      
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      
      const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `expenses/payments/${selectedExpense.id}/${selectedPayment.id}/${Date.now()}_${sanitizedName}`);
      
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

      // Update payment in expense
      const expense = expenses.find(e => e.id === selectedExpense.id);
      if (expense && expense.payments) {
        const paymentIndex = expense.payments.findIndex(p => p.id === selectedPayment.id);
        if (paymentIndex !== -1) {
          const updatedPayments = [...expense.payments];
          updatedPayments[paymentIndex] = {
            ...updatedPayments[paymentIndex],
            documents: updatedDocuments,
          };
          
          // Update expense in Firestore
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const expenseRef = doc(db, 'expenses', expense.id);
          await updateDoc(expenseRef, {
            payments: updatedPayments,
            updated_at: new Date().toISOString(),
          });

          // Update local state
          await loadExpenses();
          if (selectedExpense) {
            const updatedExpense = expenses.find(e => e.id === selectedExpense.id);
            if (updatedExpense) {
              setSelectedExpense(updatedExpense);
              const updatedPayment = updatedExpense.payments?.find(p => p.id === selectedPayment.id);
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
    if (!selectedPayment || !selectedExpense) return;

    try {
      const updatedDocuments = paymentDocuments.filter(doc => doc.id !== documentId);
      setPaymentDocuments(updatedDocuments);

      const expense = expenses.find(e => e.id === selectedExpense.id);
      if (expense && expense.payments) {
        const paymentIndex = expense.payments.findIndex(p => p.id === selectedPayment.id);
        if (paymentIndex !== -1) {
          const updatedPayments = [...expense.payments];
          updatedPayments[paymentIndex] = {
            ...updatedPayments[paymentIndex],
            documents: updatedDocuments,
          };
          
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const expenseRef = doc(db, 'expenses', expense.id);
          await updateDoc(expenseRef, {
            payments: updatedPayments,
            updated_at: new Date().toISOString(),
          });

          await loadExpenses();
          if (selectedExpense) {
            const updatedExpense = expenses.find(e => e.id === selectedExpense.id);
            if (updatedExpense) {
              setSelectedExpense(updatedExpense);
              const updatedPayment = updatedExpense.payments?.find(p => p.id === selectedPayment.id);
              if (updatedPayment) {
                setSelectedPayment(updatedPayment);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error removing payment document:', error);
      Alert.alert('Error', 'Failed to remove document');
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    try {
      await ExpenseService.approveExpense(expenseId, user?.id || '', user?.name || 'Unknown User');
      await loadExpenses();
      Alert.alert('Success', 'Expense approved successfully');
    } catch (error) {
      console.error('Error approving expense:', error);
      Alert.alert('Error', 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }
    try {
      await ExpenseService.rejectExpense(expenseId, user?.id || '', user?.name || 'Unknown User', rejectionReason);
      await loadExpenses();
      setShowRejectModal(false);
      setRejectionReason('');
      Alert.alert('Success', 'Expense rejected');
    } catch (error) {
      console.error('Error rejecting expense:', error);
      Alert.alert('Error', 'Failed to reject expense');
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }
    if (!selectedExpense) return;

    const remainingAmount = (selectedExpense.total_paid || 0) + parseFloat(newPayment.amount);
    if (remainingAmount > selectedExpense.amount) {
      Alert.alert('Error', `Payment amount exceeds remaining balance. Remaining: $${(selectedExpense.amount - (selectedExpense.total_paid || 0)).toFixed(2)}`);
      return;
    }

    try {
      // Build payment data, excluding undefined values
      const paymentData: Omit<ExpensePayment, 'id' | 'created_at'> = {
        amount: parseFloat(newPayment.amount),
        payment_date: newPayment.payment_date,
        payment_method: newPayment.payment_method,
        paid_by: user?.id || '',
        paid_by_name: user?.name || 'Unknown User',
      };

      // Only add optional fields if they have values
      if (newPayment.check_number && newPayment.check_number.trim()) {
        paymentData.check_number = newPayment.check_number.trim();
      }
      if (newPayment.reference_number && newPayment.reference_number.trim()) {
        paymentData.reference_number = newPayment.reference_number.trim();
      }
      if (newPayment.notes && newPayment.notes.trim()) {
        paymentData.notes = newPayment.notes.trim();
      }

      await ExpenseService.addPayment(selectedExpense.id, paymentData);
      await loadExpenses();
      setShowPaymentModal(false);
      setNewPayment({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'check',
        check_number: '',
        reference_number: '',
        notes: '',
      });
      Alert.alert('Success', 'Payment recorded successfully');
    } catch (error) {
      console.error('Error adding payment:', error);
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'paid':
        return '#3b82f6';
      case 'partially_paid':
        return '#8b5cf6';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} color="#f59e0b" />;
      case 'approved':
        return <CheckCircle size={14} color="#10b981" />;
      case 'paid':
        return <CreditCard size={14} color="#3b82f6" />;
      case 'partially_paid':
        return <DollarSign size={14} color="#8b5cf6" />;
      case 'rejected':
        return <XCircle size={14} color="#ef4444" />;
      default:
        return null;
    }
  };

  const getExpenseTypeIcon = (type: string) => {
    switch (type) {
      case 'subcontractor':
        return <Briefcase size={20} color="#3b82f6" />;
      case 'material':
        return <Package size={20} color="#10b981" />;
      case 'office':
        return <FileText size={20} color="#f59e0b" />;
      case 'project':
        return <Building2 size={20} color="#ef4444" />;
      default:
        return <DollarSign size={20} color="#6b7280" />;
    }
  };

  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case 'subcontractor':
        return '#3b82f6';
      case 'material':
        return '#10b981';
      case 'office':
        return '#f59e0b';
      case 'project':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    // Filter by type (project/office)
    if (filterType === 'project' && expense.is_office) return false;
    if (filterType === 'office' && !expense.is_office) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && expense.status !== statusFilter) return false;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchesInvoice = expense.invoice_number?.toLowerCase().includes(query);
      const matchesDescription = expense.description?.toLowerCase().includes(query);
      const matchesAmount = expense.amount.toString().includes(query);
      const matchesVendor = expense.vendor_name?.toLowerCase().includes(query);
      const matchesSubcontractor = expense.subcontractor_name?.toLowerCase().includes(query);
      const matchesProject = expense.project_name?.toLowerCase().includes(query);
      
      if (!matchesInvoice && !matchesDescription && !matchesAmount && !matchesVendor && !matchesSubcontractor && !matchesProject) {
        return false;
      }
    }
    
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const projectExpenses = filteredExpenses.filter(e => !e.is_office).reduce((sum, e) => sum + e.amount, 0);
  const officeExpenses = filteredExpenses.filter(e => e.is_office).reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expenses</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          {Platform.OS !== 'web' && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          {Platform.OS === 'web' ? (
            <View style={styles.headerTop}>
              <View style={styles.headerContent}>
                <Text style={styles.title}>Expenses</Text>
                <Text style={styles.subtitle}>Manage all expenses</Text>
              </View>
              {userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={20} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.headerTitle}>Expenses</Text>
              {userRole === 'admin' && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by invoice number, description, amount, vendor, subcontractor, project..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClearButton}
              >
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>${totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Project Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#ef4444' }]}>${projectExpenses.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Office Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#f59e0b' }]}>${officeExpenses.toLocaleString()}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'project' && styles.filterTabActive]}
              onPress={() => setFilterType('project')}
            >
              <Text style={[styles.filterTabText, filterType === 'project' && styles.filterTabTextActive]}>Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'office' && styles.filterTabActive]}
              onPress={() => setFilterType('office')}
            >
              <Text style={[styles.filterTabText, filterType === 'office' && styles.filterTabTextActive]}>Office</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterTab, statusFilter === 'all' && styles.filterTabActive]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.filterTabText, statusFilter === 'all' && styles.filterTabTextActive]}>All Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, statusFilter === 'pending' && styles.filterTabActive]}
              onPress={() => setStatusFilter('pending')}
            >
              <Text style={[styles.filterTabText, statusFilter === 'pending' && styles.filterTabTextActive]}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, statusFilter === 'approved' && styles.filterTabActive]}
              onPress={() => setStatusFilter('approved')}
            >
              <Text style={[styles.filterTabText, statusFilter === 'approved' && styles.filterTabTextActive]}>Approved</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, statusFilter === 'paid' && styles.filterTabActive]}
              onPress={() => setStatusFilter('paid')}
            >
              <Text style={[styles.filterTabText, statusFilter === 'paid' && styles.filterTabTextActive]}>Paid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, statusFilter === 'rejected' && styles.filterTabActive]}
              onPress={() => setStatusFilter('rejected')}
            >
              <Text style={[styles.filterTabText, statusFilter === 'rejected' && styles.filterTabTextActive]}>Rejected</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView
          style={styles.content}
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
          {filteredExpenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <DollarSign size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No expenses found</Text>
            </View>
          ) : (
            filteredExpenses.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                onPress={() => {
                  setSelectedExpense(expense);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.expenseCardHeader}>
                  <View style={styles.expenseTypeContainer}>
                    {getExpenseTypeIcon(expense.type)}
                    <View style={styles.expenseInfo}>
                      <View style={styles.expenseTypeRow}>
                        <Text style={styles.expenseType}>{expense.type.toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status || 'pending') + '20' }]}>
                          {getStatusIcon(expense.status || 'pending')}
                          <Text style={[styles.statusBadgeText, { color: getStatusColor(expense.status || 'pending') }]}>
                            {(expense.status || 'pending').toUpperCase().replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      {expense.category && (
                        <Text style={styles.expenseCategory}>{expense.category}</Text>
                      )}
                      {expense.total_paid !== undefined && expense.total_paid > 0 && (
                        <View style={styles.paymentSummary}>
                          <Text style={styles.paymentSummaryText}>
                            Paid: ${expense.total_paid.toLocaleString()} / ${expense.amount.toLocaleString()}
                          </Text>
                          {expense.payments && expense.payments.length > 0 && (
                            <Text style={styles.paymentCountText}>
                              {expense.payments.length} payment{expense.payments.length > 1 ? 's' : ''}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.expenseAmountContainer}>
                    <Text style={[styles.expenseAmount, { color: getExpenseTypeColor(expense.type) }]}>
                      ${expense.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.expenseDescription} numberOfLines={2}>
                  {expense.description}
                </Text>
                {expense.invoice_number && (
                  <View style={styles.invoiceNumberContainer}>
                    <FileText size={14} color="#236ecf" />
                    <Text style={styles.invoiceNumberText}>Invoice: {expense.invoice_number}</Text>
                  </View>
                )}
                <View style={styles.expenseFooter}>
                  <View style={styles.expenseMeta}>
                    {expense.is_office ? (
                      <View style={styles.officeBadge}>
                        <Text style={styles.officeBadgeText}>OFFICE</Text>
                      </View>
                    ) : expense.project_name ? (
                      <View style={styles.projectBadge}>
                        <Building2 size={12} color="#236ecf" />
                        <Text style={styles.projectBadgeText}>{expense.project_name}</Text>
                      </View>
                    ) : null}
                    {expense.subcontractor_name && (
                      <Text style={styles.expenseMetaText}>Sub: {expense.subcontractor_name}</Text>
                    )}
                    {expense.vendor_name && (
                      <Text style={styles.expenseMetaText}>Vendor: {expense.vendor_name}</Text>
                    )}
                    {expense.step_name && (
                      <Text style={styles.expenseMetaText}>Work Title: {expense.step_name}</Text>
                    )}
                  </View>
                  <Text style={styles.expenseDate}>
                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.expenseActions}>
                  {(expense.status === 'pending' || expense.status === 'approved' || expense.status === 'partially_paid') && userRole === 'admin' && (
                    <View style={styles.actionButtons}>
                      {expense.status === 'pending' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleApproveExpense(expense.id);
                            }}
                          >
                            <CheckCircle size={16} color="#10b981" />
                            <Text style={styles.approveButtonText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={(e) => {
                              e.stopPropagation();
                              setSelectedExpense(expense);
                              setShowRejectModal(true);
                            }}
                          >
                            <XCircle size={16} color="#ef4444" />
                            <Text style={styles.rejectButtonText}>Reject</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {(expense.status === 'approved' || expense.status === 'partially_paid') && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.payButton]}
                          onPress={(e) => {
                            e.stopPropagation();
                            setSelectedExpense(expense);
                            setShowPaymentModal(true);
                          }}
                        >
                          <CreditCard size={16} color="#3b82f6" />
                          <Text style={styles.payButtonText}>Record Payment</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {userRole === 'admin' && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setExpenseToDelete(expense);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Create Expense Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Expense</Text>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              resetNewExpense();
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Expense Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expense Type *</Text>
              <View style={styles.typeButtons}>
                {['subcontractor', 'material', 'office', 'project', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newExpense.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => {
                      setNewExpense(prev => ({
                        ...prev,
                        type: type as any,
                        is_office: type === 'office',
                        project_id: type === 'office' ? '' : prev.project_id,
                        project_name: type === 'office' ? '' : prev.project_name,
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newExpense.type === type && styles.typeButtonTextActive,
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            {(newExpense.type === 'office' || newExpense.type === 'project') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {(newExpense.type === 'office' ? officeCategories : projectCategories).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        newExpense.category === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setNewExpense(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        newExpense.category === cat && styles.categoryButtonTextActive,
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount *</Text>
              <TextInput
                style={styles.input}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, amount: text }))}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newExpense.description}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, description: text }))}
                placeholder="Enter expense description"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Invoice Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Invoice/Reference Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newExpense.invoice_number}
                onChangeText={(text) => setNewExpense(prev => ({ ...prev, invoice_number: text }))}
                placeholder="Enter invoice or reference number"
              />
            </View>

            {/* Project Assignment or Office */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assignment *</Text>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setNewExpense(prev => ({ ...prev, is_office: true, project_id: '', project_name: '' }))}
              >
                <View style={styles.radioCircle}>
                  {newExpense.is_office && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Office Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setNewExpense(prev => ({ ...prev, is_office: false }))}
              >
                <View style={styles.radioCircle}>
                  {!newExpense.is_office && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Assign to Project</Text>
              </TouchableOpacity>
            </View>

            {/* Project Selection (if not office) */}
            {!newExpense.is_office && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Project *</Text>
                <ScrollView style={styles.projectList} nestedScrollEnabled>
                  {projects.map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={[
                        styles.projectOption,
                        newExpense.project_id === project.id && styles.projectOptionActive,
                      ]}
                      onPress={() => setNewExpense(prev => ({
                        ...prev,
                        project_id: project.id,
                        project_name: project.title,
                        step_id: '', // Reset step selection when project changes
                        step_name: '',
                      }))}
                    >
                      <Text style={[
                        styles.projectOptionText,
                        newExpense.project_id === project.id && styles.projectOptionTextActive,
                      ]}>
                        {project.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Work Title Selection (if project is selected and not office) */}
            {!newExpense.is_office && newExpense.project_id && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Work Title (Optional)</Text>
                {loadingSteps ? (
                  <View style={styles.loadingStepsContainer}>
                    <ActivityIndicator size="small" color="#236ecf" />
                    <Text style={styles.loadingStepsText}>Loading work titles...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.projectList} nestedScrollEnabled>
                    <TouchableOpacity
                      style={[
                        styles.projectOption,
                        !newExpense.step_id && styles.projectOptionActive,
                      ]}
                      onPress={() => setNewExpense(prev => ({
                        ...prev,
                        step_id: '',
                        step_name: '',
                      }))}
                    >
                      <Text style={[
                        styles.projectOptionText,
                        !newExpense.step_id && styles.projectOptionTextActive,
                      ]}>
                        All Project
                      </Text>
                    </TouchableOpacity>
                    {projectSteps.map((step) => (
                      <TouchableOpacity
                        key={step.id}
                        style={[
                          styles.projectOption,
                          newExpense.step_id === step.id && styles.projectOptionActive,
                        ]}
                        onPress={() => setNewExpense(prev => ({
                          ...prev,
                          step_id: step.id,
                          step_name: step.name,
                        }))}
                      >
                        <Text style={[
                          styles.projectOptionText,
                          newExpense.step_id === step.id && styles.projectOptionTextActive,
                        ]}>
                          {step.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Subcontractor (if type is subcontractor) */}
            {newExpense.type === 'subcontractor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subcontractor *</Text>
                <ScrollView style={styles.projectList} nestedScrollEnabled>
                  {subcontractors.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.projectOption,
                        newExpense.subcontractor_id === sub.id && styles.projectOptionActive,
                      ]}
                      onPress={() => setNewExpense(prev => ({
                        ...prev,
                        subcontractor_id: sub.id,
                        subcontractor_name: sub.name,
                      }))}
                    >
                      <Text style={[
                        styles.projectOptionText,
                        newExpense.subcontractor_id === sub.id && styles.projectOptionTextActive,
                      ]}>
                        {sub.name} ({sub.trade})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Vendor or Material Request (if type is material) */}
            {newExpense.type === 'material' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Vendor (Optional)</Text>
                  <ScrollView style={styles.projectList} nestedScrollEnabled>
                    <TouchableOpacity
                      style={[
                        styles.projectOption,
                        !newExpense.vendor_id && styles.projectOptionActive,
                      ]}
                      onPress={() => setNewExpense(prev => ({
                        ...prev,
                        vendor_id: '',
                        vendor_name: '',
                      }))}
                    >
                      <Text style={[
                        styles.projectOptionText,
                        !newExpense.vendor_id && styles.projectOptionTextActive,
                      ]}>
                        None
                      </Text>
                    </TouchableOpacity>
                    {vendors.map((vendor) => (
                      <TouchableOpacity
                        key={vendor.id}
                        style={[
                          styles.projectOption,
                          newExpense.vendor_id === vendor.id && styles.projectOptionActive,
                        ]}
                        onPress={() => setNewExpense(prev => ({
                          ...prev,
                          vendor_id: vendor.id,
                          vendor_name: vendor.companyName,
                        }))}
                      >
                        <Text style={[
                          styles.projectOptionText,
                          newExpense.vendor_id === vendor.id && styles.projectOptionTextActive,
                        ]}>
                          {vendor.companyName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Material Request (Optional)</Text>
                  <ScrollView style={styles.projectList} nestedScrollEnabled>
                    <TouchableOpacity
                      style={[
                        styles.projectOption,
                        !newExpense.material_request_id && styles.projectOptionActive,
                      ]}
                      onPress={() => setNewExpense(prev => ({
                        ...prev,
                        material_request_id: '',
                      }))}
                    >
                      <Text style={[
                        styles.projectOptionText,
                        !newExpense.material_request_id && styles.projectOptionTextActive,
                      ]}>
                        None
                      </Text>
                    </TouchableOpacity>
                    {materialRequests.map((req) => (
                      <TouchableOpacity
                        key={req.id}
                        style={[
                          styles.projectOption,
                          newExpense.material_request_id === req.id && styles.projectOptionActive,
                        ]}
                        onPress={() => setNewExpense(prev => ({
                          ...prev,
                          material_request_id: req.id,
                        }))}
                      >
                        <Text style={[
                          styles.projectOptionText,
                          newExpense.material_request_id === req.id && styles.projectOptionTextActive,
                        ]}>
                          {req.project_name} - {req.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            )}

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {new Date(newExpense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                <Calendar size={20} color="#6b7280" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(newExpense.date)}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setNewExpense(prev => ({
                        ...prev,
                        date: selectedDate.toISOString().split('T')[0],
                      }));
                    }
                  }}
                />
              )}
            </View>

            {/* Documents */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Documents (Optional)</Text>
              <View style={styles.documentButtons}>
                <TouchableOpacity
                  style={[styles.documentButton, uploadingDocument && styles.documentButtonDisabled]}
                  onPress={handlePickImage}
                  disabled={uploadingDocument}
                >
                  <Paperclip size={18} color="#236ecf" />
                  <Text style={styles.documentButtonText}>Add Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.documentButton, uploadingDocument && styles.documentButtonDisabled]}
                  onPress={handlePickDocument}
                  disabled={uploadingDocument}
                >
                  <FileText size={18} color="#236ecf" />
                  <Text style={styles.documentButtonText}>Add Document</Text>
                </TouchableOpacity>
              </View>
              {uploadingDocument && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#236ecf" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              {uploadedDocuments.length > 0 && (
                <View style={styles.documentsList}>
                  {uploadedDocuments.map((doc) => (
                    <View key={doc.id} style={styles.documentItem}>
                      <FileText size={16} color="#6b7280" />
                      <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                      <TouchableOpacity
                        style={styles.removeDocumentButton}
                        onPress={() => removeDocument(doc.id)}
                      >
                        <X size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleCreateExpense}>
              <Text style={styles.submitButtonText}>Create Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Expense Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {selectedExpense && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedExpense.status || 'pending') + '20' }]}>
                  {getStatusIcon(selectedExpense.status || 'pending')}
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(selectedExpense.status || 'pending') }]}>
                    {(selectedExpense.status || 'pending').toUpperCase().replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedExpense.type.toUpperCase()}</Text>
              </View>
              {selectedExpense.category && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{selectedExpense.category}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={[styles.detailValue, { color: getExpenseTypeColor(selectedExpense.type), fontSize: 20, fontWeight: 'bold' }]}>
                  ${selectedExpense.amount.toLocaleString()}
                </Text>
              </View>
              {selectedExpense.total_paid !== undefined && selectedExpense.total_paid > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paid:</Text>
                  <Text style={[styles.detailValue, { color: '#10b981', fontSize: 18, fontWeight: 'bold' }]}>
                    ${selectedExpense.total_paid.toLocaleString()} / ${selectedExpense.amount.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{selectedExpense.description}</Text>
              </View>
              {selectedExpense.invoice_number && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice/Reference Number:</Text>
                  <Text style={styles.detailValue}>{selectedExpense.invoice_number}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assignment:</Text>
                <Text style={styles.detailValue}>
                  {selectedExpense.is_office ? 'Office Expense' : selectedExpense.project_name || 'No Project'}
                </Text>
              </View>
              {selectedExpense.subcontractor_name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Subcontractor:</Text>
                  <Text style={styles.detailValue}>{selectedExpense.subcontractor_name}</Text>
                </View>
              )}
              {selectedExpense.vendor_name && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vendor:</Text>
                  <Text style={styles.detailValue}>{selectedExpense.vendor_name}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedExpense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              {selectedExpense.payments && selectedExpense.payments.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Payment History</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentHistoryScroll}>
                    <View style={styles.paymentHistoryRow}>
                      {selectedExpense.payments
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
                      ${(selectedExpense.total_paid || 0).toLocaleString()} / ${selectedExpense.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created by:</Text>
                <Text style={styles.detailValue}>{selectedExpense.created_by_name}</Text>
              </View>

              {/* Action Buttons for Admin */}
              {userRole === 'admin' && (
                <View style={styles.detailActionButtons}>
                  {selectedExpense.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.detailActionButton, styles.approveButton]}
                        onPress={() => handleApproveExpense(selectedExpense.id)}
                      >
                        <CheckCircle size={18} color="#10b981" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.detailActionButton, styles.rejectButton]}
                        onPress={() => {
                          setShowRejectModal(true);
                        }}
                      >
                        <XCircle size={18} color="#ef4444" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {(selectedExpense.status === 'approved' || selectedExpense.status === 'partially_paid') && (
                    <TouchableOpacity
                      style={[styles.detailActionButton, styles.payButton]}
                      onPress={() => setShowPaymentModal(true)}
                    >
                      <CreditCard size={18} color="#3b82f6" />
                      <Text style={styles.payButtonText}>Record Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {selectedExpense && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoLabel}>Expense Amount:</Text>
                <Text style={styles.paymentInfoValue}>${selectedExpense.amount.toLocaleString()}</Text>
              </View>
              {selectedExpense.total_paid !== undefined && selectedExpense.total_paid > 0 && (
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentInfoLabel}>Already Paid:</Text>
                  <Text style={styles.paymentInfoValue}>${selectedExpense.total_paid.toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentInfoLabel}>Remaining:</Text>
                <Text style={[styles.paymentInfoValue, { color: '#ef4444' }]}>
                  ${((selectedExpense.amount || 0) - (selectedExpense.total_paid || 0)).toLocaleString()}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Amount *</Text>
                <TextInput
                  style={styles.input}
                  value={newPayment.amount}
                  onChangeText={(text) => setNewPayment(prev => ({ ...prev, amount: text }))}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Date *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {new Date(newPayment.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Calendar size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Payment Method *</Text>
                <View style={styles.paymentMethodButtons}>
                  {['check', 'wire', 'ach', 'credit_card', 'cash', 'other'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        newPayment.payment_method === method && styles.paymentMethodButtonActive,
                      ]}
                      onPress={() => setNewPayment(prev => ({ ...prev, payment_method: method as any }))}
                    >
                      <Text style={[
                        styles.paymentMethodButtonText,
                        newPayment.payment_method === method && styles.paymentMethodButtonTextActive,
                      ]}>
                        {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {newPayment.payment_method === 'check' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Check Number</Text>
                  <TextInput
                    style={styles.input}
                    value={newPayment.check_number}
                    onChangeText={(text) => setNewPayment(prev => ({ ...prev, check_number: text }))}
                    placeholder="Enter check number"
                  />
                </View>
              )}

              {(newPayment.payment_method === 'wire' || newPayment.payment_method === 'ach') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Reference Number</Text>
                  <TextInput
                    style={styles.input}
                    value={newPayment.reference_number}
                    onChangeText={(text) => setNewPayment(prev => ({ ...prev, reference_number: text }))}
                    placeholder="Enter reference number"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newPayment.notes}
                  onChangeText={(text) => setNewPayment(prev => ({ ...prev, notes: text }))}
                  placeholder="Add payment notes"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddPayment}>
                <Text style={styles.submitButtonText}>Record Payment</Text>
              </TouchableOpacity>

              {/* Payment History Table */}
              {selectedExpense.payments && selectedExpense.payments.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Payment History</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentHistoryScroll}>
                    <View style={styles.paymentHistoryRow}>
                      {selectedExpense.payments
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
                      ${(selectedExpense.total_paid || 0).toLocaleString()} / ${selectedExpense.amount.toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Reject Expense</Text>
            <Text style={styles.deleteModalText}>
              Please provide a reason for rejecting this expense.
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { marginBottom: 16 }]}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter rejection reason"
              multiline
              numberOfLines={3}
            />
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.deleteModalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonDelete]}
                onPress={() => selectedExpense && handleRejectExpense(selectedExpense.id)}
              >
                <Text style={styles.deleteModalButtonDeleteText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Expense</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this expense? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setExpenseToDelete(null);
                }}
              >
                <Text style={styles.deleteModalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonDelete]}
                onPress={handleDeleteExpense}
              >
                <Text style={styles.deleteModalButtonDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
                    <Text style={styles.label}>Documents</Text>
                    <View style={styles.documentButtons}>
                      <TouchableOpacity
                        style={styles.documentButton}
                        onPress={handlePickPaymentImage}
                        disabled={uploadingPaymentDocument}
                      >
                        <Upload size={18} color="#236ecf" />
                        <Text style={styles.documentButtonText}>Add Image</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.documentButton}
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

      <HamburgerMenu />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#236ecf',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
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
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffcc00', // Yellow border like other pages
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    padding: 0,
  },
  searchClearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#ffcc00', // Yellow active tab like other pages
    borderColor: '#ffcc00',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff', // White text on blue background
    marginTop: 16,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow left border like notifications
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  expenseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  invoiceNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  invoiceNumberText: {
    fontSize: 12,
    color: '#236ecf',
    fontWeight: '600',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  officeBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  officeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f59e0b',
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  projectBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#236ecf',
  },
  expenseMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  expenseDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  detailActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: '#ffcc00', // Yellow button
    borderColor: '#ffcc00',
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937', // Dark text on yellow
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  payButton: {
    backgroundColor: '#ffcc00', // Yellow button
    borderColor: '#ffcc00',
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937', // Dark text on yellow
  },
  deleteButton: {
    padding: 4,
  },
  expenseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  paymentInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  paymentInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  paymentMethodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentMethodButtonActive: {
    backgroundColor: '#ffcc00', // Yellow active like other pages
    borderColor: '#ffcc00',
  },
  paymentMethodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  paymentMethodButtonTextActive: {
    color: '#1f2937', // Dark text on yellow
  },
  filterScroll: {
    flexGrow: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeButtonActive: {
    backgroundColor: '#ffcc00', // Yellow active like other pages
    borderColor: '#ffcc00',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#1f2937', // Dark text on yellow
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#ffcc00', // Yellow active like other pages
    borderColor: '#ffcc00',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#1f2937', // Dark text on yellow
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#236ecf',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#236ecf',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
  },
  projectList: {
    maxHeight: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  projectOptionActive: {
    backgroundColor: '#ffcc0020', // Light yellow background
    borderLeftWidth: 3,
    borderLeftColor: '#ffcc00', // Yellow left border
  },
  projectOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  projectOptionTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#ffcc00', // Yellow button like other pages
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'web' ? 20 : 24,
    minHeight: 48,
  },
  submitButtonText: {
    color: '#1f2937', // Dark text on yellow background
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  deleteModalButtonDelete: {
    backgroundColor: '#ef4444',
  },
  deleteModalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteModalButtonDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  paymentSummary: {
    marginTop: 4,
  },
  paymentSummaryText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  paymentCountText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingStepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginTop: 8,
  },
  loadingStepsText: {
    fontSize: 14,
    color: '#236ecf',
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
});

