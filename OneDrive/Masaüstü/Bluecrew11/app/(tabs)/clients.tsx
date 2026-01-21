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
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Mail, Phone, Building, MapPin, X, Search, Download, Trash2, Calendar, MessageSquare, Eye, EyeOff, ArrowLeft, User, UserCheck, FileText, Receipt, BarChart3 } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Client, ClientNote } from '@/types';
import { UserService } from '@/services/userService';
import { usePagePermission } from '@/hooks/usePagePermission';
import { ProposalService } from '@/services/proposalService';
import { InvoiceService } from '@/services/invoiceService';
import { ClientService } from '@/services/clientService';
import HamburgerMenu from '@/components/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Real clients from Firebase

export default function ClientsScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { canEdit: canEditClients } = usePagePermission('clients', userRole as 'admin' | 'pm' | 'sales' | 'office' | 'client');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    temporaryPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
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
  const [newNote, setNewNote] = useState({
    note: '',
    contact_date: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Web-specific features
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Load clients from Firebase
  const loadClients = async () => {
    try {
      setLoading(true);
      const firebaseClients = await UserService.getUsersByRole('client');
      console.log('Firebase clients loaded:', firebaseClients);
      
      // Convert Firebase users to Client format
      const clientList: Client[] = firebaseClients.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: '', // No company field
        address: '', // No address field
        created_at: user.created_at,
      }));
      
      setClients(clientList);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadClients();
  };

  // Set view mode and mobile detection
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      setViewMode('card');
      return;
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isMobileWidth = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const mobile = isMobileWidth || isMobileUA;
      setIsMobile(mobile);
      setViewMode(mobile ? 'card' : 'table');
      
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

  // Filter and search functions
  const getFilteredClients = () => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.phone && c.phone.toLowerCase().includes(query))
    );
  };

  // Batch operations
  const toggleClientSelection = (id: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClients(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(clients.map(c => c.id));
    setSelectedClients(allIds);
  };

  const clearSelection = () => {
    setSelectedClients(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedClients.size === 0) {
      Alert.alert('Error', 'Please select clients to delete');
      return;
    }
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${selectedClients.size} client(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmBatchDelete }
      ]
    );
  };

  const confirmBatchDelete = async () => {
    try {
      for (const id of selectedClients) {
        await UserService.deleteUser(id);
      }
      clearSelection();
      Alert.alert('Success', `${selectedClients.size} client(s) deleted successfully`);
      // Reload clients
      const firebaseClients = await UserService.getUsersByRole('client');
      const clientList: Client[] = firebaseClients.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: '',
        address: '',
        created_at: user.created_at,
      }));
      setClients(clientList);
    } catch (error) {
      console.error('Error batch deleting clients:', error);
      Alert.alert('Error', 'Failed to delete clients');
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (Platform.OS !== 'web') return;
    
    const filteredClients = getFilteredClients();
    const headers = ['Name', 'Email', 'Phone', 'Created At'];
    const rows = filteredClients.map(client => [
      client.name,
      client.email,
      client.phone || '',
      client.created_at ? new Date(client.created_at).toLocaleDateString() : '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddClient = async () => {
    // Collect all missing required fields
    const missingFields: string[] = [];
    
    if (!newClient.name || !newClient.name.trim()) {
      missingFields.push('Name');
    }
    if (!newClient.email || !newClient.email.trim()) {
      missingFields.push('Email');
    }
    if (!newClient.temporaryPassword || newClient.temporaryPassword.length < 6) {
      missingFields.push('Temporary Password (minimum 6 characters)');
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
      const firebaseClients = await UserService.getUsersByRole('client');
      const clientList: Client[] = firebaseClients.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        company: '',
        address: '',
        created_at: user.created_at,
      }));
      setClients(clientList);
      
      setShowAddModal(false);
      const tempPassword = newClient.temporaryPassword; // Save before clearing
      
      setNewClient({
        name: '',
        email: '',
        phone: '',
        temporaryPassword: '',
      });
      
      // Generate login URL (assuming the app URL)
      const appUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://bluecrew-app.netlify.app';
      const loginUrl = `${appUrl}/auth/login`;
      
      Alert.alert(
        'Success', 
        `Client added successfully!\n\nEmail: ${newClient.email}\nTemporary Password: ${tempPassword}\n\nLogin URL: ${loginUrl}\n\nPlease share these credentials with the client.`,
        [
          {
            text: 'Copy Password',
            onPress: () => {
              if (Platform.OS === 'web' && navigator.clipboard) {
                navigator.clipboard.writeText(tempPassword);
                Alert.alert('Copied', 'Password copied to clipboard');
              }
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error: any) {
      console.error('Error adding client:', error);
      Alert.alert('Error', error.message || 'Failed to add client');
    }
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await UserService.deleteUser(clientToDelete.id);
        
        // Reload clients
        const firebaseClients = await UserService.getUsersByRole('client');
        const clientList: Client[] = firebaseClients.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          company: '',
          address: '',
          created_at: user.created_at,
        }));
        setClients(clientList);
        
        setShowDeleteModal(false);
        setClientToDelete(null);
        Alert.alert('Success', 'Client deleted successfully');
      } catch (error) {
        console.error('Error deleting client:', error);
        Alert.alert('Error', 'Failed to delete client');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  const handleAddNote = async () => {
    if (!selectedClient || !newNote.note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      const noteData: Omit<ClientNote, 'id'> = {
        note: newNote.note,
        created_at: new Date().toISOString(),
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
        contact_date: newNote.contact_date || new Date().toISOString(),
      };

      await ClientService.addNoteToClient(selectedClient.id, noteData);
      
      // Reload client data
      const updatedClient = await ClientService.getClientById(selectedClient.id);
      if (updatedClient) {
        setSelectedClient(updatedClient);
        // Update in clients list
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      }
      
      setShowNoteModal(false);
      setNewNote({ note: '', contact_date: '' });
      setShowDatePicker(false);
      setSelectedDate(new Date());
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  // Load full client data when detail modal opens
  useEffect(() => {
    if (showDetailModal && selectedClient) {
      const loadFullClient = async () => {
        const fullClient = await ClientService.getClientById(selectedClient.id);
        if (fullClient) {
          setSelectedClient(fullClient);
        }
      };
      loadFullClient();
    }
  }, [showDetailModal, selectedClient?.id]);

  // Component to calculate and display CRM stats in detail modal
  const ClientDetailStats = ({ client }: { client: Client }) => {
    const [crmStats, setCrmStats] = useState({
      approvedProposals: 0,
      invoices: 0,
      totalRevenue: 0,
    });

    useEffect(() => {
      const loadCrmStats = async () => {
        try {
          // Get proposals for this client
          const proposals = await ProposalService.getProposalsByClientName(client.name);
          const approvedProposals = proposals.filter(p => 
            p.management_approval === 'approved' && p.client_approval === 'approved'
          ).length;

          // Get invoices for this client
          const allInvoices = await InvoiceService.getInvoices();
          const clientInvoices = allInvoices.filter(inv => 
            inv.client_name === client.name || inv.client_id === client.id
          );
          const approvedInvoices = clientInvoices.filter(inv => inv.status === 'approved');
          const totalRevenue = approvedInvoices.reduce((sum, inv) => sum + inv.total_cost, 0);

          setCrmStats({
            approvedProposals,
            invoices: clientInvoices.length,
            totalRevenue,
          });
        } catch (error) {
          console.error('Error loading CRM stats:', error);
        }
      };

      loadCrmStats();
    }, [client.name, client.id]);

    return (
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>CRM Statistics</Text>
        <View style={styles.crmStatsDetail}>
          <View style={styles.crmStatItemDetail}>
            <Text style={styles.crmStatLabelDetail}>Approved Proposals</Text>
            <Text style={styles.crmStatValueDetail}>{crmStats.approvedProposals}</Text>
          </View>
          <View style={styles.crmStatItemDetail}>
            <Text style={styles.crmStatLabelDetail}>Invoices</Text>
            <Text style={styles.crmStatValueDetail}>{crmStats.invoices}</Text>
          </View>
          <View style={styles.crmStatItemDetail}>
            <Text style={styles.crmStatLabelDetail}>Total Revenue</Text>
            <Text style={styles.crmStatValueDetail}>
              ${crmStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const ClientCard = ({ client }: { client: Client }) => {
    const [crmStats, setCrmStats] = useState({
      approvedProposals: 0,
      invoices: 0,
      totalRevenue: 0,
    });

    useEffect(() => {
      const loadCrmStats = async () => {
        try {
          // Get proposals for this client
          const proposals = await ProposalService.getProposalsByClientName(client.name);
          const approvedProposals = proposals.filter(p => 
            p.management_approval === 'approved' && p.client_approval === 'approved'
          ).length;

          // Get invoices for this client
          const allInvoices = await InvoiceService.getInvoices();
          const clientInvoices = allInvoices.filter(inv => 
            inv.client_name === client.name || inv.client_id === client.id
          );
          const approvedInvoices = clientInvoices.filter(inv => inv.status === 'approved');
          const totalRevenue = approvedInvoices.reduce((sum, inv) => sum + inv.total_cost, 0);

          setCrmStats({
            approvedProposals,
            invoices: clientInvoices.length,
            totalRevenue,
          });
        } catch (error) {
          console.error('Error loading CRM stats:', error);
        }
      };

      loadCrmStats();
    }, [client.name, client.id]);

    return (
    <View style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientEmail}>{client.email}</Text>
        </View>
          <View style={styles.clientActions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                router.push(`/clients/${client.id}`);
              }}>
              <Eye size={18} color="#236ecf" />
            </TouchableOpacity>
        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.deleteButton}
                onPress={() => {
                  handleDeleteClient(client);
                }}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
          </View>
      </View>
      
      <View style={styles.clientDetails}>
        <View style={styles.contactRow}>
          <Mail size={16} color="#6b7280" />
          <Text style={styles.contactText}>{client.email}</Text>
        </View>
        {client.phone && (
          <View style={styles.contactRow}>
            <Phone size={16} color="#6b7280" />
            <Text style={styles.contactText}>{client.phone}</Text>
          </View>
        )}
      </View>

        {/* CRM Stats */}
        <View style={styles.crmStats}>
          <View style={styles.crmStatItem}>
            <Text style={styles.crmStatLabel}>Approved Proposals</Text>
            <Text style={styles.crmStatValue}>{crmStats.approvedProposals}</Text>
          </View>
          <View style={styles.crmStatItem}>
            <Text style={styles.crmStatLabel}>Invoices</Text>
            <Text style={styles.crmStatValue}>{crmStats.invoices}</Text>
          </View>
          <View style={styles.crmStatItem}>
            <Text style={styles.crmStatLabel}>Total Revenue</Text>
            <Text style={styles.crmStatValue}>
              ${crmStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
    </View>
  );
  };

  const filteredClients = getFilteredClients();

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/sales')} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.subtitle}>
              {filteredClients.length} of {clients.length} clients
            </Text>
          </View>
        {Platform.OS === 'web' && !isMobile && (canEditClients || userRole === 'admin') && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={exportToCSV}
            >
              <Download size={18} color="#ffffff" />
              <Text style={styles.exportButtonText}>Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={18} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Client</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Button - Moved to content area for mobile */}
      {isMobile && (canEditClients || userRole === 'admin') && (
        <View style={styles.contentActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={18} color="#1f2937" />
            <Text style={styles.addButtonText}>Add Client</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Web: Search and Batch Operations Toolbar */}
      {Platform.OS === 'web' && (
        <View style={styles.webToolbar}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.toolbarActions}>
            {selectedClients.size > 0 && (
              <>
                <TouchableOpacity
                  style={styles.batchDeleteButton}
                  onPress={handleBatchDelete}
                >
                  <Trash2 size={16} color="#ffffff" />
                  <Text style={styles.batchButtonText}>Delete ({selectedClients.size})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </>
            )}
            {selectedClients.size === 0 && (
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
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading clients...</Text>
          </View>
        ) : filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <Building size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No clients found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Add your first client to get started'}
            </Text>
          </View>
        ) : Platform.OS === 'web' && viewMode === 'table' ? (
          /* Web Table View */
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.tableCheckbox}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={selectAll}
                >
                  {selectedClients.size > 0 && (
                    <Text style={styles.checkboxCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.tableHeaderText}>Name</Text>
              <Text style={styles.tableHeaderText}>Email</Text>
              <Text style={styles.tableHeaderText}>Phone</Text>
              <Text style={styles.tableHeaderText}>Created At</Text>
              {userRole === 'admin' && (
                <Text style={styles.tableHeaderText}>Actions</Text>
              )}
            </View>
            {filteredClients.map((client) => (
              <View key={client.id} style={styles.tableRow}>
                <View style={styles.tableCheckbox}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      selectedClients.has(client.id) && styles.checkboxSelected
                    ]}
                    onPress={() => toggleClientSelection(client.id)}
                  >
                    {selectedClients.has(client.id) && (
                      <Text style={styles.checkboxCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.tableCell}>{client.name}</Text>
                <Text style={styles.tableCell}>{client.email}</Text>
                <Text style={styles.tableCell}>{client.phone || '-'}</Text>
                <Text style={styles.tableCell}>
                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                </Text>
                  <View style={styles.tableActions}>
                  <TouchableOpacity
                    style={styles.tableActionButton}
                    onPress={() => router.push(`/clients/${client.id}`)}
                  >
                    <Eye size={16} color="#236ecf" />
                  </TouchableOpacity>
                  {userRole === 'admin' && (
                    <TouchableOpacity
                      style={styles.tableActionButton}
                      onPress={() => handleDeleteClient(client)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Mobile Card View */
          filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))
        )}
      </ScrollView>

      {userRole === 'admin' && Platform.OS !== 'web' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Client Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Client Details</Text>
            <TouchableOpacity onPress={() => {
              setShowDetailModal(false);
              setSelectedClient(null);
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {selectedClient && (
              <>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <View style={styles.detailAvatar}>
                      <Text style={styles.detailAvatarText}>
                        {selectedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailName}>{selectedClient.name}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Mail size={18} color="#6b7280" />
                    <Text style={styles.detailValue}>{selectedClient.email}</Text>
                  </View>
                  {selectedClient.phone && (
                    <View style={styles.detailRow}>
                      <Phone size={18} color="#6b7280" />
                      <Text style={styles.detailValue}>{selectedClient.phone}</Text>
                    </View>
                  )}
                  {selectedClient.address && (
                    <View style={styles.detailRow}>
                      <MapPin size={18} color="#6b7280" />
                      <Text style={styles.detailValue}>{selectedClient.address}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Calendar size={18} color="#6b7280" />
                    <Text style={styles.detailValue}>
                      Created: {new Date(selectedClient.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* CRM Stats */}
                <ClientDetailStats client={selectedClient} />

                {/* Notes Section */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Notes & Communications</Text>
                    <TouchableOpacity
                      style={styles.addNoteButton}
                      onPress={() => setShowNoteModal(true)}
                    >
                      <Plus size={18} color="#236ecf" />
                      <Text style={styles.addNoteButtonText}>Add Note</Text>
                    </TouchableOpacity>
                  </View>
                  {(!selectedClient.notes || selectedClient.notes.length === 0) ? (
                    <Text style={styles.noNotesText}>No notes yet</Text>
                  ) : (
                    selectedClient.notes.map((note, index) => (
                      <View key={note.id || index} style={styles.noteItem}>
                        <View style={styles.noteHeader}>
                          <Text style={styles.noteAuthor}>{note.created_by_name}</Text>
                          <Text style={styles.noteDate}>
                            {note.contact_date 
                              ? new Date(note.contact_date).toLocaleDateString()
                              : new Date(note.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.noteText}>{note.note}</Text>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TouchableOpacity onPress={() => {
              setShowNoteModal(false);
              setNewNote({ note: '', contact_date: '' });
              setShowDatePicker(false);
              setSelectedDate(new Date());
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Date (Optional)</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateInputContainer}>
                  <Calendar size={18} color="#6b7280" />
                  <Text style={[styles.dateInputText, !newNote.contact_date && styles.dateInputPlaceholder]}>
                    {newNote.contact_date 
                      ? new Date(newNote.contact_date).toLocaleDateString()
                      : 'Select date or leave empty for today'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) {
                      setSelectedDate(date);
                      setNewNote(prev => ({ ...prev, contact_date: date.toISOString() }));
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newNote.note}
                onChangeText={(text) => setNewNote(prev => ({ ...prev, note: text }))}
                placeholder="Enter note (e.g., Called them, they said...)"
                multiline
                numberOfLines={6}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddNote}>
              <Text style={styles.submitButtonText}>Add Note</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Client Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Client</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
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
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={newClient.temporaryPassword}
                  onChangeText={(text) => setNewClient(prev => ({ ...prev, temporaryPassword: text }))}
                  placeholder="Enter temporary password (min 6 characters)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} color="#6b7280" /> : <EyeOff size={20} color="#6b7280" />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.generatePasswordButton}
                  onPress={() => {
                    const generatedPassword = generateTempPassword();
                    setNewClient(prev => ({ ...prev, temporaryPassword: generatedPassword }));
                  }}
                >
                  <Text style={styles.generatePasswordButtonText}>Generate</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Client will use this password to login</Text>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddClient}>
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
              {clientToDelete?.name} adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

      {/* Bottom Menu - Sales Navigation */}
      <View style={styles.bottomMenu}>
        <View style={styles.bottomMenuContainer}>
          <TouchableOpacity
            style={[styles.bottomMenuItem, styles.activeMenuItem]}
            onPress={() => router.push('/clients')}
          >
            <UserCheck size={24} color="#059669" />
            <Text style={[styles.bottomMenuText, styles.activeMenuText]}>Clients</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background like teams
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 8,
    textAlign: 'center',
  },
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#236ecf', // Blue like teams
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#236ecf', // Blue like teams
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  clientCompany: {
    fontSize: 14,
    color: '#ffcc00', // Yellow like teams
    fontWeight: '600',
  },
  clientActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  clientDetails: {
    gap: 8,
    marginBottom: 12,
  },
  crmStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  crmStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  crmStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  crmStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
    textAlign: 'center',
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
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailValue: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
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
  addNoteButton: {
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
  addNoteButtonText: {
    color: '#236ecf',
    fontSize: 14,
    fontWeight: '600',
  },
  crmStatsDetail: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  crmStatItemDetail: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
  },
  crmStatLabelDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  crmStatValueDetail: {
    fontSize: 18,
    fontWeight: '700',
    color: '#236ecf',
    textAlign: 'center',
  },
  noteItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  noteDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  noteText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  noNotesText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
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
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffcc00', // Yellow button like teams
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow text on blue background
    fontWeight: '500',
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
  // Web-specific styles
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  contentActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
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
  batchDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
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
    width: 80,
    justifyContent: 'flex-end',
  },
  tableActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
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
  passwordRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  passwordInput: {
    flex: 1,
  },
  generatePasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#236ecf',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  generatePasswordButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
