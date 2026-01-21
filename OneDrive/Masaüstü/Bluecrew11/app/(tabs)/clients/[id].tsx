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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Receipt, 
  Plus,
  MoreVertical,
  X,
  User,
  Building,
  DollarSign,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Client, ClientNote } from '@/types';
import { ClientService } from '@/services/clientService';
import { ProposalService } from '@/services/proposalService';
import { InvoiceService } from '@/services/invoiceService';
import HamburgerMenu from '@/components/HamburgerMenu';

type TabType = 'overview' | 'activities' | 'proposals' | 'invoices';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const { userRole, user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newNote, setNewNote] = useState({
    note: '',
    contact_date: '',
  });
  const [crmStats, setCrmStats] = useState({
    approvedProposals: 0,
    totalProposals: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  const [proposals, setProposals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceTab, setInvoiceTab] = useState<'overdue' | 'pending' | 'paid' | 'cancelled'>('pending');

  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const clientData = await ClientService.getClientById(id as string);
      if (clientData) {
        setClient(clientData);
        await loadCrmStats(clientData);
        await loadProposals(clientData);
        await loadInvoices(clientData);
      } else {
        Alert.alert('Error', 'Client not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading client:', error);
      Alert.alert('Error', 'Failed to load client data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCrmStats = async (clientData: Client) => {
    try {
      const allProposals = await ProposalService.getProposalsByClientName(clientData.name);
      const approvedProposals = allProposals.filter(p => 
        p.management_approval === 'approved' && p.client_approval === 'approved'
      ).length;

      const allInvoices = await InvoiceService.getInvoices();
      const clientInvoices = allInvoices.filter(inv => 
        inv.client_name === clientData.name || inv.client_id === clientData.id
      );
      const approvedInvoices = clientInvoices.filter(inv => inv.status === 'approved');
      const totalRevenue = approvedInvoices.reduce((sum, inv) => sum + inv.total_cost, 0);

      setCrmStats({
        approvedProposals,
        totalProposals: allProposals.length,
        totalInvoices: clientInvoices.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading CRM stats:', error);
    }
  };

  const loadProposals = async (clientData: Client) => {
    try {
      const allProposals = await ProposalService.getProposalsByClientName(clientData.name);
      setProposals(allProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const loadInvoices = async (clientData: Client) => {
    try {
      const allInvoices = await InvoiceService.getInvoices();
      const clientInvoices = allInvoices.filter(inv => 
        inv.client_name === clientData.name || inv.client_id === clientData.id
      );
      setInvoices(clientInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const handleAddNote = async () => {
    if (!client || !newNote.note.trim()) {
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

      await ClientService.addNoteToClient(client.id, noteData);
      await loadClientData();
      setShowNoteModal(false);
      setNewNote({ note: '', contact_date: '' });
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const handleCreateProposal = () => {
    if (!client) return;
    router.push(`/proposals?fromClient=${client.id}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email || '')}`);
  };

  const handleCreateInvoice = () => {
    if (!client) return;
    router.push(`/invoices?fromClient=${client.id}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email || '')}`);
  };

  const handleSendEmail = () => {
    if (!client || !client.email) {
      Alert.alert('Error', 'Client email not available');
      return;
    }
    if (Platform.OS === 'web') {
      window.location.href = `mailto:${client.email}`;
    } else {
      // For mobile, you might want to use Linking API
      Alert.alert('Email', `Would send email to ${client.email}`);
    }
  };

  const handleCall = () => {
    if (!client || !client.phone) {
      Alert.alert('Error', 'Client phone number not available');
      return;
    }
    if (Platform.OS === 'web') {
      window.location.href = `tel:${client.phone}`;
    } else {
      // For mobile, you might want to use Linking API
      Alert.alert('Call', `Would call ${client.phone}`);
    }
  };

  if (loading) {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading client...</Text>
        </View>
      </>
    );
  }

  if (!client) {
    return null;
  }

  // Categorize invoices
  const categorizeInvoices = (invoiceList: any[]) => {
    const now = new Date();
    const overdue: any[] = [];
    const cancelled: any[] = [];
    const pending: any[] = [];
    const paid: any[] = [];

    invoiceList.forEach(invoice => {
      // Check if invoice is past due (pending and past due date, or status is pending and created more than 30 days ago)
      const invoiceDate = new Date(invoice.invoice_date || invoice.created_at);
      const daysSinceCreation = (now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
      const isOverdue = invoice.status === 'pending' && daysSinceCreation > 30;

      if (invoice.status === 'paid') {
        paid.push(invoice);
      } else if (invoice.status === 'cancelled') {
        cancelled.push(invoice);
      } else if (invoice.status === 'overdue' || isOverdue) {
        overdue.push(invoice);
      } else {
        pending.push(invoice);
      }
    });

    return { overdue, pending, paid, cancelled };
  };

  const calculateOpenBalance = (invoice: any) => {
    if (invoice.status === 'paid') {
      return 0;
    }
    // For now, open balance is the total cost if not paid
    // In the future, this could be calculated based on payments made
    return invoice.total_cost || 0;
  };

  const { overdue, pending, paid, cancelled } = categorizeInvoices(invoices);

  const getCurrentInvoices = () => {
    switch (invoiceTab) {
      case 'overdue':
        return overdue;
      case 'cancelled':
        return cancelled;
      case 'pending':
        return pending;
      case 'paid':
        return paid;
      default:
        return pending;
    }
  };

  const InvoiceTabs = ({ invoices: invoiceList }: { invoices: any[] }) => {
    const { overdue: od, pending: p, paid: pa, cancelled: c } = categorizeInvoices(invoiceList);
    
    return (
      <View style={styles.invoiceTabsContainer}>
        {/* Invoice Status Tabs */}
        <View style={styles.invoiceStatusTabs}>
          <TouchableOpacity
            style={[styles.invoiceStatusTab, invoiceTab === 'overdue' && styles.invoiceStatusTabActive]}
            onPress={() => setInvoiceTab('overdue')}
          >
            <Text style={[styles.invoiceStatusTabText, invoiceTab === 'overdue' && styles.invoiceStatusTabTextActive]}>
              Overdue ({od.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.invoiceStatusTab, invoiceTab === 'cancelled' && styles.invoiceStatusTabActive]}
            onPress={() => setInvoiceTab('cancelled')}
          >
            <Text style={[styles.invoiceStatusTabText, invoiceTab === 'cancelled' && styles.invoiceStatusTabTextActive]}>
              Cancelled ({c.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.invoiceStatusTab, invoiceTab === 'pending' && styles.invoiceStatusTabActive]}
            onPress={() => setInvoiceTab('pending')}
          >
            <Text style={[styles.invoiceStatusTabText, invoiceTab === 'pending' && styles.invoiceStatusTabTextActive]}>
              Pending ({p.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.invoiceStatusTab, invoiceTab === 'paid' && styles.invoiceStatusTabActive]}
            onPress={() => setInvoiceTab('paid')}
          >
            <Text style={[styles.invoiceStatusTabText, invoiceTab === 'paid' && styles.invoiceStatusTabTextActive]}>
              Paid ({pa.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Invoice List */}
        {getCurrentInvoices().length === 0 ? (
          <View style={styles.emptyState}>
            <Receipt size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              No {invoiceTab === 'overdue' ? 'overdue' : invoiceTab === 'pending' ? 'pending' : invoiceTab === 'paid' ? 'paid' : 'cancelled'} invoices
            </Text>
          </View>
        ) : (
          <View style={styles.invoiceList}>
            {getCurrentInvoices().map((invoice) => {
              const openBalance = calculateOpenBalance(invoice);
              return (
                <TouchableOpacity
                  key={invoice.id}
                  style={styles.invoiceCard}
                  onPress={() => router.push(`/invoices?id=${invoice.id}`)}
                >
                  <View style={styles.invoiceCardHeader}>
                    <View style={styles.invoiceCardLeft}>
                      <Receipt size={20} color="#236ecf" />
                      <View style={styles.invoiceCardInfo}>
                        <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                        <Text style={styles.invoiceDate}>
                          {new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={[
                      styles.invoiceStatusBadge,
                      invoiceTab === 'overdue' && styles.invoiceStatusBadgeOverdue,
                      invoiceTab === 'cancelled' && styles.invoiceStatusBadgeCancelled,
                      invoiceTab === 'pending' && styles.invoiceStatusBadgePending,
                      invoiceTab === 'paid' && styles.invoiceStatusBadgePaid,
                    ]}>
                      <Text style={[
                        styles.invoiceStatusBadgeText,
                        invoiceTab === 'overdue' && styles.invoiceStatusBadgeTextOverdue,
                        invoiceTab === 'cancelled' && styles.invoiceStatusBadgeTextCancelled,
                        invoiceTab === 'pending' && styles.invoiceStatusBadgeTextPending,
                        invoiceTab === 'paid' && styles.invoiceStatusBadgeTextPaid,
                      ]}>
                        {invoiceTab === 'overdue' ? 'Overdue' : invoiceTab === 'pending' ? 'Pending' : invoiceTab === 'paid' ? 'Paid' : 'Cancelled'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.invoiceCardDetails}>
                    <View style={styles.invoiceDetailRow}>
                      <Text style={styles.invoiceDetailLabel}>Total:</Text>
                      <Text style={styles.invoiceDetailValue}>
                        ${(invoice.total_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                    {openBalance > 0 && (
                      <View style={styles.invoiceDetailRow}>
                        <Text style={styles.invoiceDetailLabel}>Open Balance:</Text>
                        <Text style={[styles.invoiceDetailValue, styles.invoiceOpenBalance]}>
                          ${openBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clients</Text>
          <TouchableOpacity style={styles.actionsButton}>
            <MoreVertical size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Left Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientEmail}>{client.email}</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setShowNoteModal(true)}
              >
                <MessageSquare size={20} color="#236ecf" />
                <Text style={styles.quickActionText}>Note</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={handleSendEmail}
              >
                <Mail size={20} color="#236ecf" />
                <Text style={styles.quickActionText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={handleCall}
              >
                <Phone size={20} color="#236ecf" />
                <Text style={styles.quickActionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={handleCreateProposal}
              >
                <FileText size={20} color="#236ecf" />
                <Text style={styles.quickActionText}>Proposal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={handleCreateInvoice}
              >
                <Receipt size={20} color="#236ecf" />
                <Text style={styles.quickActionText}>Invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction}>
                <MoreVertical size={20} color="#236ecf" />
                <Text style={styles.quickActionText}>More</Text>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.aboutSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>About this contact</Text>
                <TouchableOpacity>
                  <MoreVertical size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.infoText}>{client.email}</Text>
              </View>
              {client.phone && (
                <View style={styles.infoRow}>
                  <Phone size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{client.phone}</Text>
                </View>
              )}
              {client.address && (
                <View style={styles.infoRow}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{client.address}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.infoText}>
                  Created: {new Date(client.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                onPress={() => setActiveTab('overview')}
              >
                <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
                onPress={() => setActiveTab('activities')}
              >
                <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
                  Activities
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'proposals' && styles.tabActive]}
                onPress={() => setActiveTab('proposals')}
              >
                <Text style={[styles.tabText, activeTab === 'proposals' && styles.tabTextActive]}>
                  Proposals
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
                onPress={() => setActiveTab('invoices')}
              >
                <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
                  Invoices
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'overview' && (
                <View style={styles.overviewContent}>
                  <Text style={styles.sectionTitle}>Client Information</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{client.email}</Text>
                    </View>
                    {client.phone && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{client.phone}</Text>
                      </View>
                    )}
                    {client.address && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <Text style={styles.infoValue}>{client.address}</Text>
                      </View>
                    )}
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Created</Text>
                      <Text style={styles.infoValue}>
                        {new Date(client.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'activities' && (
                <View style={styles.activitiesContent}>
                  <View style={styles.activitiesHeader}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search activities"
                      placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                      style={styles.createNoteButton}
                      onPress={() => setShowNoteModal(true)}
                    >
                      <Plus size={18} color="#ffffff" />
                      <Text style={styles.createNoteButtonText}>Create Note</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Notes List */}
                  {(!client.notes || client.notes.length === 0) ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>No notes yet</Text>
                    </View>
                  ) : (
                    <View style={styles.activitiesList}>
                      {client.notes.map((note, index) => (
                        <View key={note.id || index} style={styles.activityItem}>
                          <View style={styles.activityHeader}>
                            <View style={styles.activityIcon}>
                              <MessageSquare size={16} color="#236ecf" />
                            </View>
                            <Text style={styles.activityTitle}>
                              Note by {note.created_by_name}
                            </Text>
                            <Text style={styles.activityDate}>
                              {note.contact_date 
                                ? new Date(note.contact_date).toLocaleDateString()
                                : new Date(note.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                          <Text style={styles.activityContent}>{note.note}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {activeTab === 'proposals' && (
                <View style={styles.proposalsContent}>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateProposal}
                  >
                    <Plus size={20} color="#ffffff" />
                    <Text style={styles.createButtonText}>Create Proposal</Text>
                  </TouchableOpacity>

                  {proposals.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>No proposals yet</Text>
                    </View>
                  ) : (
                    proposals.map((proposal) => (
                      <TouchableOpacity
                        key={proposal.id}
                        style={styles.recordCard}
                        onPress={() => router.push(`/proposals?id=${proposal.id}`)}
                      >
                        <FileText size={20} color="#236ecf" />
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordTitle}>{proposal.proposal_number}</Text>
                          <Text style={styles.recordSubtitle}>
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={styles.recordAmount}>
                          ${proposal.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {activeTab === 'invoices' && (
                <View style={styles.invoicesContent}>
                  <InvoiceTabs invoices={invoices} />
                </View>
              )}
            </ScrollView>
          </View>

          {/* Right Sidebar */}
          <View style={styles.rightSidebar}>
            {/* CRM Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>CRM Statistics</Text>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Approved Proposals</Text>
                <Text style={styles.statValue}>{crmStats.approvedProposals}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Proposals</Text>
                <Text style={styles.statValue}>{crmStats.totalProposals}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Invoices</Text>
                <Text style={styles.statValue}>{crmStats.totalInvoices}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={styles.statValue}>
                  ${crmStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Associated Records */}
            <View style={styles.recordsCard}>
              <View style={styles.recordsHeader}>
                <Text style={styles.recordsTitle}>Proposals</Text>
                <TouchableOpacity onPress={handleCreateProposal}>
                  <Text style={styles.addLink}>+Add</Text>
                </TouchableOpacity>
              </View>
              {proposals.length === 0 ? (
                <Text style={styles.recordsEmpty}>No proposals associated</Text>
              ) : (
                proposals.slice(0, 3).map((proposal) => (
                  <TouchableOpacity
                    key={proposal.id}
                    style={styles.recordItem}
                    onPress={() => router.push(`/proposals?id=${proposal.id}`)}
                  >
                    <FileText size={16} color="#6b7280" />
                    <Text style={styles.recordItemText}>{proposal.proposal_number}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.recordsCard}>
              <View style={styles.recordsHeader}>
                <Text style={styles.recordsTitle}>Invoices</Text>
                <TouchableOpacity>
                  <Text style={styles.addLink}>+Add</Text>
                </TouchableOpacity>
              </View>
              {invoices.length === 0 ? (
                <Text style={styles.recordsEmpty}>No invoices associated</Text>
              ) : (
                invoices.slice(0, 3).map((invoice) => (
                  <TouchableOpacity
                    key={invoice.id}
                    style={styles.recordItem}
                    onPress={() => router.push(`/invoices?id=${invoice.id}`)}
                  >
                    <Receipt size={16} color="#6b7280" />
                    <Text style={styles.recordItemText}>{invoice.invoice_number}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </View>

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
            }}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={newNote.contact_date ? styles.dateInputText : styles.dateInputPlaceholder}>
                  {newNote.contact_date 
                    ? new Date(newNote.contact_date).toLocaleDateString()
                    : 'Select date or leave empty for today'}
                </Text>
                <Calendar size={18} color="#6b7280" />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#236ecf',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  clientEmail: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quickAction: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 20,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#236ecf',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#236ecf',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  overviewContent: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  activitiesContent: {
    gap: 16,
  },
  activitiesHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  createNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#236ecf',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createNoteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#236ecf',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  proposalsContent: {
    gap: 16,
  },
  invoicesContent: {
    gap: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recordSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  rightSidebar: {
    width: 300,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    padding: 20,
    gap: 16,
  },
  statsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  recordsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  addLink: {
    fontSize: 14,
    color: '#236ecf',
    fontWeight: '500',
  },
  recordsEmpty: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  recordItemText: {
    fontSize: 14,
    color: '#374151',
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  dateInputText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dateInputPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

