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
import { Plus, X, Mail, Phone, MapPin, User, Calendar, MessageSquare, CheckCircle, Trash, Eye, ArrowLeft, UserCheck, FileText, Receipt, BarChart3 } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Lead, LeadNote } from '@/types';
import { LeadService } from '@/services/leadService';
import { UserService } from '@/services/userService';
import { usePagePermission } from '@/hooks/usePagePermission';
import { router } from 'expo-router';
import HamburgerMenu from '@/components/HamburgerMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LeadsScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { canEdit: canEditLeads } = usePagePermission('leads', userRole as 'admin' | 'pm' | 'sales' | 'office' | 'client');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [salesTeam, setSalesTeam] = useState<any[]>([]);
  const [convertToClientPassword, setConvertToClientPassword] = useState('');
  
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [newNote, setNewNote] = useState({
    note: '',
    contact_date: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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

  useEffect(() => {
    if (canEditLeads || userRole === 'admin' || userRole === 'sales') {
      loadLeads();
      loadSalesTeam();
    }
  }, [userRole]);

  const loadSalesTeam = async () => {
    try {
      const allUsers = await UserService.getAllUsers();
      const salesUsers = allUsers.filter(u => u.role === 'sales' || u.role === 'admin');
      setSalesTeam(salesUsers);
    } catch (error) {
      console.error('Error loading sales team:', error);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const allLeads = await LeadService.getLeads();
      setLeads(allLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      Alert.alert('Error', 'Failed to load leads');
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
    await loadLeads();
  };

  const handleCreateLead = async () => {
    // Collect all missing required fields
    const missingFields: string[] = [];
    
    if (!newLead.first_name || !newLead.first_name.trim()) {
      missingFields.push('First Name');
    }
    if (!newLead.last_name || !newLead.last_name.trim()) {
      missingFields.push('Last Name');
    }
    if (!newLead.email || !newLead.email.trim()) {
      missingFields.push('Email');
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
      const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
        first_name: newLead.first_name,
        last_name: newLead.last_name,
        email: newLead.email,
        phone: newLead.phone || undefined,
        address: newLead.address || undefined,
        notes: [],
        status: 'new',
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
      };

      await LeadService.createLead(leadData);
      await loadLeads();
      setShowCreateModal(false);
      setNewLead({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
      });
      Alert.alert('Success', 'Lead created successfully');
    } catch (error) {
      console.error('Error creating lead:', error);
      Alert.alert('Error', 'Failed to create lead');
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !newNote.note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      const noteData: Omit<LeadNote, 'id'> = {
        note: newNote.note,
        created_at: new Date().toISOString(),
        created_by: user?.id || '',
        created_by_name: user?.name || 'Unknown User',
        contact_date: newNote.contact_date || new Date().toISOString(),
      };

      await LeadService.addNoteToLead(selectedLead.id, noteData);
      await loadLeads();
      
      // Reload selected lead
      const updatedLead = await LeadService.getLeadById(selectedLead.id);
      if (updatedLead) {
        setSelectedLead(updatedLead);
      }
      
      setShowNoteModal(false);
      setNewNote({ note: '', contact_date: '' });
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const handleConvertToClient = (lead: Lead) => {
    // Just open the modal, don't create client yet
    setSelectedLead(lead);
    setShowConvertModal(true);
    // Generate initial password
    setConvertToClientPassword(generateTempPassword());
  };

  const handleCreateClientFromLead = async () => {
    if (!selectedLead) {
      Alert.alert('Error', 'No lead selected');
      return;
    }

    if (!convertToClientPassword || convertToClientPassword.length < 6) {
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
      await AuthService.signUp(selectedLead.email, convertToClientPassword, {
        name: `${selectedLead.first_name} ${selectedLead.last_name}`,
        role: 'client',
        phone: selectedLead.phone || undefined,
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
      
      // Get the created client ID
      const allUsers = await UserService.getAllUsers();
      const clientUser = allUsers.find(u => u.email === selectedLead.email && u.role === 'client');
      
      if (!clientUser) {
        throw new Error('Client was created but could not be found');
      }
      
      // Update lead status
      await LeadService.convertLeadToClient(selectedLead.id, clientUser.id);
      
      await loadLeads();
      setShowDetailModal(false);
      setShowConvertModal(false);
      setSelectedLead(null);
      setConvertToClientPassword('');
      
      // Generate login URL
      const appUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://bluecrew-app.netlify.app';
      const loginUrl = `${appUrl}/auth/login`;
      
      Alert.alert(
        'Success', 
        `Lead converted to client successfully!\n\nEmail: ${selectedLead.email}\nTemporary Password: ${convertToClientPassword}\n\nLogin URL: ${loginUrl}\n\nPlease share these credentials with the client.`,
        Platform.OS === 'web' ? [
          {
            text: 'Copy Password',
            onPress: () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(convertToClientPassword);
                Alert.alert('Copied', 'Password copied to clipboard');
              }
            }
          },
          { text: 'OK' }
        ] : [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error converting lead to client:', error);
      Alert.alert('Error', error.message || 'Failed to convert lead to client');
    }
  };

  const handleUpdateStatus = async (lead: Lead, status: Lead['status']) => {
    try {
      await LeadService.updateLead(lead.id, { status });
      await loadLeads();
      if (selectedLead && selectedLead.id === lead.id) {
        const updatedLead = await LeadService.getLeadById(lead.id);
        if (updatedLead) {
          setSelectedLead(updatedLead);
        }
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      Alert.alert('Error', 'Failed to update lead status');
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this lead?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LeadService.deleteLead(lead.id);
              await loadLeads();
              if (selectedLead && selectedLead.id === lead.id) {
                setShowDetailModal(false);
                setSelectedLead(null);
              }
              Alert.alert('Success', 'Lead deleted successfully');
            } catch (error) {
              console.error('Error deleting lead:', error);
              Alert.alert('Error', 'Failed to delete lead');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'qualified': return '#10b981';
      case 'converted': return '#059669';
      case 'lost': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'New';
      case 'qualified': return 'Qualified';
      case 'converted': return 'Converted';
      case 'lost': return 'Lost';
      default: return status;
    }
  };

  const handleAssignSales = async (lead: Lead, salesId: string, salesName: string) => {
    try {
      await LeadService.updateLead(lead.id, { 
        assigned_to: salesId || undefined,
        assigned_to_name: salesName || undefined 
      });
      await loadLeads();
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead({ ...selectedLead, assigned_to: salesId || undefined, assigned_to_name: salesName || undefined });
      }
      Alert.alert('Success', salesId ? 'Lead assigned to sales person' : 'Lead unassigned');
    } catch (error) {
      console.error('Error assigning lead:', error);
      Alert.alert('Error', 'Failed to assign lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.first_name.toLowerCase().includes(query) ||
      lead.last_name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      (lead.phone && lead.phone.toLowerCase().includes(query))
    );
  });

  if (userRole !== 'admin' && userRole !== 'sales') {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Leads</Text>
            <Text style={styles.subtitle}>Access Denied</Text>
          </View>
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>You don't have permission to access this page</Text>
          </View>
        </View>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </>
    );
  }

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
              <Text style={styles.title}>Leads</Text>
              <Text style={styles.subtitle}>{filteredLeads.length} total leads</Text>
            </View>
            {(canEditLeads || userRole === 'admin' || userRole === 'sales') && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateModal(true)}>
                <Plus size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Lead</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search */}
        {Platform.OS === 'web' && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search leads..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={true}
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
          {filteredLeads.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No leads found</Text>
            </View>
          ) : (
            filteredLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                style={styles.leadCard}
                onPress={() => {
                  setSelectedLead(lead);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {lead.first_name[0]}{lead.last_name[0]}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>
                      {lead.first_name} {lead.last_name}
                    </Text>
                    <Text style={styles.cardEmail}>{lead.email}</Text>
                    {lead.phone && (
                      <Text style={styles.cardPhone}>{lead.phone}</Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lead.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(lead.status)}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.notesCount}>
                    <MessageSquare size={16} color="#6b7280" />
                    <Text style={styles.notesCountText}>{lead.notes.length} notes</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Create Lead Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Lead</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.first_name}
                  onChangeText={(text) => setNewLead(prev => ({ ...prev, first_name: text }))}
                  placeholder="Enter first name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.last_name}
                  onChangeText={(text) => setNewLead(prev => ({ ...prev, last_name: text }))}
                  placeholder="Enter last name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.email}
                  onChangeText={(text) => setNewLead(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={newLead.phone}
                  onChangeText={(text) => setNewLead(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newLead.address}
                  onChangeText={(text) => setNewLead(prev => ({ ...prev, address: text }))}
                  placeholder="Enter address"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreateLead}>
                <Text style={styles.submitButtonText}>Create Lead</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Lead Detail Modal */}
        <Modal
          visible={showDetailModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lead Details</Text>
              <TouchableOpacity onPress={() => {
                setShowDetailModal(false);
                setSelectedLead(null);
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedLead && (
                <>
                  <View style={styles.detailSection}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailAvatar}>
                        <Text style={styles.detailAvatarText}>
                          {selectedLead.first_name[0]}{selectedLead.last_name[0]}
                        </Text>
                      </View>
                      <View style={styles.detailInfo}>
                        <Text style={styles.detailName}>
                          {selectedLead.first_name} {selectedLead.last_name}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedLead.status) }]}>
                          <Text style={styles.statusText}>{getStatusText(selectedLead.status)}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Mail size={18} color="#6b7280" />
                      <Text style={styles.detailValue}>{selectedLead.email}</Text>
                    </View>
                    {selectedLead.phone && (
                      <View style={styles.detailRow}>
                        <Phone size={18} color="#6b7280" />
                        <Text style={styles.detailValue}>{selectedLead.phone}</Text>
                      </View>
                    )}
                    {selectedLead.address && (
                      <View style={styles.detailRow}>
                        <MapPin size={18} color="#6b7280" />
                        <Text style={styles.detailValue}>{selectedLead.address}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Calendar size={18} color="#6b7280" />
                      <Text style={styles.detailValue}>
                        Created: {new Date(selectedLead.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Status Update */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    <View style={styles.statusButtons}>
                      {(['new', 'qualified', 'lost'] as Lead['status'][]).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            selectedLead.status === status && styles.statusButtonActive
                          ]}
                          onPress={() => handleUpdateStatus(selectedLead, status)}
                        >
                          <Text style={[
                            styles.statusButtonText,
                            selectedLead.status === status && styles.statusButtonTextActive
                          ]}>
                            {getStatusText(status)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Sales Assign Section */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Sales Assign</Text>
                    <View style={styles.salesAssignContainer}>
                      {salesTeam.map((sales) => (
                        <TouchableOpacity
                          key={sales.id}
                          style={[
                            styles.salesOption,
                            selectedLead.assigned_to === sales.id && styles.selectedSalesOption
                          ]}
                          onPress={() => handleAssignSales(selectedLead, sales.id, sales.name)}
                        >
                          <User size={18} color={selectedLead.assigned_to === sales.id ? '#236ecf' : '#6b7280'} />
                          <Text style={[
                            styles.salesOptionText,
                            selectedLead.assigned_to === sales.id && styles.selectedSalesOptionText
                          ]}>
                            {sales.name}
                          </Text>
                          {selectedLead.assigned_to === sales.id && (
                            <CheckCircle size={18} color="#236ecf" />
                          )}
                        </TouchableOpacity>
                      ))}
                      {selectedLead.assigned_to && (
                        <TouchableOpacity
                          style={styles.unassignButton}
                          onPress={() => handleAssignSales(selectedLead, '', '')}
                        >
                          <X size={18} color="#ef4444" />
                          <Text style={styles.unassignButtonText}>Unassign</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {selectedLead.assigned_to_name && (
                      <Text style={styles.assignedToText}>
                        Currently assigned to: <Text style={styles.assignedToName}>{selectedLead.assigned_to_name}</Text>
                      </Text>
                    )}
                  </View>

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
                    {selectedLead.notes.length === 0 ? (
                      <Text style={styles.noNotesText}>No notes yet</Text>
                    ) : (
                      selectedLead.notes.map((note, index) => (
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

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    {selectedLead.status !== 'converted' && (
                      <TouchableOpacity
                        style={styles.convertButton}
                        onPress={() => handleConvertToClient(selectedLead)}
                      >
                        <CheckCircle size={20} color="#ffffff" />
                        <Text style={styles.convertButtonText}>Convert to Client</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteLead(selectedLead)}
                    >
                      <Trash size={20} color="#ffffff" />
                      <Text style={styles.deleteButtonText}>Delete Lead</Text>
                    </TouchableOpacity>
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
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Date (Optional)</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#6b7280" />
                  <Text style={[styles.dateInputText, !newNote.contact_date && styles.dateInputPlaceholder]}>
                    {newNote.contact_date 
                      ? new Date(newNote.contact_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Select contact date or leave empty for today'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={newNote.contact_date ? newNote.contact_date.split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value);
                          setNewNote(prev => ({ ...prev, contact_date: date.toISOString() }));
                        } else {
                          setNewNote(prev => ({ ...prev, contact_date: '' }));
                        }
                        setShowDatePicker(false);
                      }}
                      style={{
                        marginTop: 8,
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        fontSize: 16,
                      }}
                    />
                  ) : (
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
                  )
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

        {/* Convert to Client Modal */}
        <Modal
          visible={showConvertModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Convert Lead to Client</Text>
              <TouchableOpacity onPress={() => {
                setShowConvertModal(false);
                setConvertToClientPassword('');
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedLead && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Client Name</Text>
                    <Text style={styles.readOnlyValue}>
                      {selectedLead.first_name} {selectedLead.last_name}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.readOnlyValue}>
                      {selectedLead.email}
                    </Text>
                  </View>

                  {selectedLead.phone && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Phone</Text>
                      <Text style={styles.readOnlyValue}>
                        {selectedLead.phone}
                      </Text>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Temporary Password *</Text>
                      <TouchableOpacity
                        style={styles.generateButton}
                        onPress={() => setConvertToClientPassword(generateTempPassword())}
                      >
                        <Text style={styles.generateButtonText}>Generate</Text>
                      </TouchableOpacity>
                      {Platform.OS === 'web' && convertToClientPassword && (
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(convertToClientPassword);
                              Alert.alert('Copied', 'Password copied to clipboard');
                            }
                          }}
                        >
                          <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      style={styles.input}
                      value={convertToClientPassword}
                      onChangeText={(text) => setConvertToClientPassword(text)}
                      placeholder="Enter temporary password (min 6 characters)"
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    <Text style={styles.helperText}>Client will use this password to login</Text>
                  </View>

                  <TouchableOpacity style={styles.submitButton} onPress={handleCreateClientFromLead}>
                    <Text style={styles.submitButtonText}>Create Client</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>

      {/* Bottom Menu - Sales Navigation */}
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
            style={[styles.bottomMenuItem, styles.activeMenuItem]}
            onPress={() => router.push('/leads')}
          >
            <User size={24} color="#3b82f6" />
            <Text style={[styles.bottomMenuText, styles.activeMenuText]}>Leads</Text>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1e40af',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Extra padding for bottom menu
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  leadCard: {
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
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardPhone: {
    fontSize: 14,
    color: '#6b7280',
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
  notesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesCountText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
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
  submitButton: {
    backgroundColor: '#ffcc00',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
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
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusButtonTextActive: {
    color: '#236ecf',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  convertButton: {
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
  convertButtonText: {
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
  salesAssignContainer: {
    gap: 8,
    marginTop: 12,
  },
  salesOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  selectedSalesOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
  },
  salesOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedSalesOptionText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  unassignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    gap: 10,
    marginTop: 8,
  },
  unassignButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  assignedToText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  assignedToName: {
    fontWeight: '600',
    color: '#236ecf',
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

