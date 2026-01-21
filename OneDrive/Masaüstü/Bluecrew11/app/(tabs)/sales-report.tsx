import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { ArrowLeft, BarChart3, User, UserCheck, FileText, Receipt, Search, X, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Proposal } from '@/types';
import { ProposalService } from '@/services/proposalService';
import HamburgerMenu from '@/components/HamburgerMenu';

export default function SalesReportScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    proposal: '',
    client: '',
    price: '',
    assignedTo: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const allProposals = await ProposalService.getProposals();
      setProposals(allProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProposalStatus = (proposal: Proposal): { text: string; color: string } => {
    // Won: Both approvals are approved
    if (proposal.management_approval === 'approved' && proposal.client_approval === 'approved') {
      return { text: 'Won', color: '#059669' }; // Green
    }
    // Lost: Either approval is rejected
    if (proposal.management_approval === 'rejected' || proposal.client_approval === 'rejected') {
      return { text: 'Lost', color: '#ef4444' }; // Red
    }
    // Pending: Neither won nor lost
    return { text: 'Pending', color: '#6b7280' }; // Gray
  };

  // Calculate statistics
  const calculateStats = () => {
    const won = proposals.filter(p => {
      const status = getProposalStatus(p);
      return status.text === 'Won';
    });
    const lost = proposals.filter(p => {
      const status = getProposalStatus(p);
      return status.text === 'Lost';
    });
    const pending = proposals.filter(p => {
      const status = getProposalStatus(p);
      return status.text === 'Pending';
    });

    const wonTotal = won.reduce((sum, p) => sum + p.total_cost, 0);
    const lostTotal = lost.reduce((sum, p) => sum + p.total_cost, 0);
    const pendingTotal = pending.reduce((sum, p) => sum + p.total_cost, 0);

    return {
      won: { count: won.length, total: wonTotal },
      lost: { count: lost.length, total: lostTotal },
      pending: { count: pending.length, total: pendingTotal },
      total: { count: proposals.length, total: proposals.reduce((sum, p) => sum + p.total_cost, 0) },
    };
  };

  // Filter proposals
  const filteredProposals = proposals.filter(proposal => {
    const status = getProposalStatus(proposal);
    
    if (filters.proposal && !proposal.proposal_number.toLowerCase().includes(filters.proposal.toLowerCase())) {
      return false;
    }
    if (filters.client && !proposal.client_name.toLowerCase().includes(filters.client.toLowerCase())) {
      return false;
    }
    if (filters.price) {
      const priceNum = parseFloat(filters.price);
      if (isNaN(priceNum) || proposal.total_cost < priceNum) {
        return false;
      }
    }
    if (filters.assignedTo && !proposal.created_by_name.toLowerCase().includes(filters.assignedTo.toLowerCase())) {
      return false;
    }
    if (filters.status && status.text.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    return true;
  });

  const stats = calculateStats();

  const menuItems = [
    {
      id: 'leads',
      title: 'Leads',
      icon: User,
      href: '/leads',
      color: '#3b82f6',
      available: userRole === 'admin' || userRole === 'sales',
    },
    {
      id: 'clients',
      title: t('clients'),
      icon: UserCheck,
      href: '/clients',
      color: '#059669',
      available: userRole === 'admin' || userRole === 'sales',
    },
    {
      id: 'proposals',
      title: 'Proposals',
      icon: FileText,
      href: '/proposals',
      color: '#f59e0b',
      available: userRole === 'admin' || userRole === 'sales' || userRole === 'client',
    },
    {
      id: 'invoices',
      title: 'Invoices',
      icon: Receipt,
      href: '/invoices',
      color: '#ef4444',
      available: userRole === 'admin' || userRole === 'sales' || userRole === 'client',
    },
  ].filter(item => item.available);

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffcc00" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Sales Report</Text>
              <Text style={styles.subtitle}>Overview of sales performance</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        >
          {/* Statistics Cards */}
          {!loading && proposals.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.statCardWon]}>
                <View style={styles.statHeader}>
                  <TrendingUp size={24} color="#059669" />
                  <Text style={styles.statTitle}>Won</Text>
                </View>
                <Text style={styles.statCount}>{stats.won.count} proposals</Text>
                <Text style={styles.statTotal}>{formatCurrency(stats.won.total)}</Text>
              </View>

              <View style={[styles.statCard, styles.statCardLost]}>
                <View style={styles.statHeader}>
                  <TrendingDown size={24} color="#ef4444" />
                  <Text style={styles.statTitle}>Lost</Text>
                </View>
                <Text style={styles.statCount}>{stats.lost.count} proposals</Text>
                <Text style={styles.statTotal}>{formatCurrency(stats.lost.total)}</Text>
              </View>

              <View style={[styles.statCard, styles.statCardPending]}>
                <View style={styles.statHeader}>
                  <Clock size={24} color="#6b7280" />
                  <Text style={styles.statTitle}>Pending</Text>
                </View>
                <Text style={styles.statCount}>{stats.pending.count} proposals</Text>
                <Text style={styles.statTotal}>{formatCurrency(stats.pending.total)}</Text>
              </View>

              <View style={[styles.statCard, styles.statCardTotal]}>
                <View style={styles.statHeader}>
                  <BarChart3 size={24} color="#236ecf" />
                  <Text style={styles.statTitle}>Total</Text>
                </View>
                <Text style={styles.statCount}>{stats.total.count} proposals</Text>
                <Text style={styles.statTotal}>{formatCurrency(stats.total.total)}</Text>
              </View>
            </View>
          )}

          <View style={styles.reportCard}>
            <View style={styles.cardHeader}>
              <BarChart3 size={24} color="#236ecf" />
              <Text style={styles.cardTitle}>Sales Report</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Search size={20} color="#236ecf" />
                <Text style={styles.filterButtonText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Section */}
            {showFilters && (
              <View style={styles.filterContainer}>
                <View style={styles.filterRow}>
                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Proposal</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="Search proposal number..."
                      value={filters.proposal}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, proposal: text }))}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Client Name</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="Search client name..."
                      value={filters.client}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, client: text }))}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
                <View style={styles.filterRow}>
                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Min Price</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="Minimum price..."
                      value={filters.price}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, price: text }))}
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Assigned To</Text>
                    <TextInput
                      style={styles.filterInput}
                      placeholder="Search assigned to..."
                      value={filters.assignedTo}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, assignedTo: text }))}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
                <View style={styles.filterRow}>
                  <View style={styles.filterInputGroup}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <View style={styles.statusFilterButtons}>
                      {['', 'Won', 'Lost', 'Pending'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusFilterButton,
                            filters.status === status && styles.statusFilterButtonActive
                          ]}
                          onPress={() => setFilters(prev => ({ ...prev, status: status }))}
                        >
                          <Text style={[
                            styles.statusFilterButtonText,
                            filters.status === status && styles.statusFilterButtonTextActive
                          ]}>
                            {status || 'All'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => setFilters({ proposal: '', client: '', price: '', assignedTo: '', status: '' })}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#236ecf" />
                <Text style={styles.loadingText}>Loading proposals...</Text>
              </View>
            ) : proposals.length === 0 ? (
              <Text style={styles.emptyText}>No proposals found</Text>
            ) : (
              <>
                <View style={styles.resultsInfo}>
                  <Text style={styles.resultsText}>
                    Showing {filteredProposals.length} of {proposals.length} proposals
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={styles.tableScrollContent}
                >
                  <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, styles.col1]}>Proposal</Text>
                      <Text style={[styles.tableHeaderText, styles.col2]}>Client Name</Text>
                      <Text style={[styles.tableHeaderText, styles.col3]}>Price</Text>
                      <Text style={[styles.tableHeaderText, styles.col4]}>Assigned To</Text>
                      <Text style={[styles.tableHeaderText, styles.col5]}>Status</Text>
                    </View>

                    {/* Table Rows */}
                    {filteredProposals.length === 0 ? (
                      <View style={styles.emptyTableRow}>
                        <Text style={styles.emptyTableText}>No proposals match the filters</Text>
                      </View>
                    ) : (
                      filteredProposals.map((proposal, index) => {
                        const status = getProposalStatus(proposal);
                        return (
                          <View 
                            key={proposal.id} 
                            style={[
                              styles.tableRow,
                              index % 2 === 1 && styles.tableRowAlternate
                            ]}
                          >
                            <Text style={[styles.tableCell, styles.col1]}>{proposal.proposal_number}</Text>
                            <Text style={[styles.tableCell, styles.col2]}>{proposal.client_name}</Text>
                            <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(proposal.total_cost)}</Text>
                            <Text style={[styles.tableCell, styles.col4]}>{proposal.created_by_name}</Text>
                            <View style={[styles.tableCell, styles.col5]}>
                              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                <Text style={styles.statusText}>{status.text}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </ScrollView>

        {/* Bottom Menu - Similar to project details */}
        <View style={styles.bottomMenu}>
          <View style={styles.bottomMenuContainer}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.bottomMenuItem}
                  onPress={() => router.push(item.href)}
                >
                  <IconComponent size={24} color={item.color} />
                  <Text style={styles.bottomMenuText}>{item.title}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.bottomMenuItem, styles.activeMenuItem]}
              onPress={() => router.push('/sales-report')}
            >
              <BarChart3 size={24} color="#8b5cf6" />
              <Text style={[styles.bottomMenuText, styles.activeMenuText]}>Report</Text>
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
    backgroundColor: '#1e40af',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
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
  content: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  statCardWon: {
    borderLeftColor: '#059669',
  },
  statCardLost: {
    borderLeftColor: '#ef4444',
  },
  statCardPending: {
    borderLeftColor: '#6b7280',
  },
  statCardTotal: {
    borderLeftColor: '#236ecf',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  statCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  filterContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterInputGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  statusFilterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  statusFilterButtonActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  statusFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusFilterButtonTextActive: {
    color: '#ffffff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  resultsInfo: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  emptyTableRow: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTableText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 40,
  },
  tableContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    // Force the table to be wider than small screens so horizontal scroll works on mobile.
    minWidth: 620,
  },
  tableScrollContent: {
    paddingRight: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  tableRowAlternate: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'left',
  },
  col1: {
    flex: 1.2,
    minWidth: 100,
  },
  col2: {
    flex: 1.5,
    minWidth: 120,
  },
  col3: {
    flex: 1,
    minWidth: 100,
  },
  col4: {
    flex: 1.2,
    minWidth: 100,
  },
  col5: {
    flex: 0.8,
    minWidth: 80,
    alignItems: 'flex-start',
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
  activeMenuItem: {
    backgroundColor: '#f3f4f6',
  },
  bottomMenuText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  activeMenuText: {
    color: '#8b5cf6',
    fontWeight: '700',
  },
});

