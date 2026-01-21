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
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  User,
  ArrowLeft,
  FileText,
  Calendar,
  Percent
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, Proposal } from '@/types';
import { InvoiceService } from '@/services/invoiceService';
import { ProposalService } from '@/services/proposalService';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';

interface CommissionEntry {
  invoice: Invoice;
  proposal?: Proposal;
  sales_person_id: string;
  sales_person_name: string;
  invoice_total: number;
  general_conditions: number;
  supervision_fee: number;
  base_amount: number; // total_cost - general_conditions - supervision_fee
  commission_rate: number; // 5%
  commission_amount: number; // base_amount * 0.05
  invoice_date: string;
  paid_date?: string;
}

export default function CommissionScreen() {
  const { userRole, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [commissionEntries, setCommissionEntries] = useState<CommissionEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CommissionEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [commissionEntries, searchQuery, selectedSalesPerson]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoices, proposals] = await Promise.all([
        InvoiceService.getInvoices(),
        ProposalService.getProposals(),
      ]);

      // Filter paid invoices that have a proposal_id
      const paidInvoices = invoices.filter(inv => 
        inv.status === 'paid' && inv.proposal_id
      );

      // Create commission entries
      const entries: CommissionEntry[] = paidInvoices.map(invoice => {
        const proposal = proposals.find(p => p.id === invoice.proposal_id);
        
        // Check if proposal is won (both approvals approved)
        const isWon = proposal && 
          proposal.management_approval === 'approved' && 
          proposal.client_approval === 'approved';

        if (!isWon || !proposal) {
          return null;
        }

        // Calculate base amount (total_cost - general_conditions - supervision_fee)
        const baseAmount = invoice.total_cost - invoice.general_conditions - invoice.supervision_fee;
        
        // Calculate commission (5% of base amount)
        const commissionRate = 0.05; // 5%
        const commissionAmount = baseAmount * commissionRate;

        return {
          invoice,
          proposal,
          sales_person_id: invoice.created_by,
          sales_person_name: invoice.created_by_name,
          invoice_total: invoice.total_cost,
          general_conditions: invoice.general_conditions,
          supervision_fee: invoice.supervision_fee,
          base_amount: baseAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          invoice_date: invoice.invoice_date,
          paid_date: invoice.approved_at, // Assuming approved_at is when it was paid
        };
      }).filter((entry): entry is CommissionEntry => entry !== null);

      setCommissionEntries(entries);
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...commissionEntries];

    // Filter by sales person
    if (selectedSalesPerson !== 'all') {
      filtered = filtered.filter(entry => entry.sales_person_id === selectedSalesPerson);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.invoice.invoice_number.toLowerCase().includes(query) ||
        entry.invoice.client_name.toLowerCase().includes(query) ||
        entry.sales_person_name.toLowerCase().includes(query) ||
        (entry.proposal?.proposal_number.toLowerCase().includes(query) || false)
      );
    }

    setFilteredEntries(filtered);
  };

  const getSalesPersons = () => {
    const salesPersons = new Set<string>();
    commissionEntries.forEach(entry => {
      salesPersons.add(entry.sales_person_id);
    });
    return Array.from(salesPersons).map(id => {
      const entry = commissionEntries.find(e => e.sales_person_id === id);
      return {
        id,
        name: entry?.sales_person_name || 'Unknown',
      };
    });
  };

  const calculateTotalCommission = () => {
    return filteredEntries.reduce((sum, entry) => sum + entry.commission_amount, 0);
  };

  const calculateTotalBySalesPerson = (salesPersonId: string) => {
    return filteredEntries
      .filter(entry => entry.sales_person_id === salesPersonId)
      .reduce((sum, entry) => sum + entry.commission_amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading commission data...</Text>
        </View>
      </View>
    );
  }

  const salesPersons = getSalesPersons();
  const totalCommission = calculateTotalCommission();

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? <TopNavigationBar /> : <HamburgerMenu />}
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/hr')}
        >
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <TrendingUp size={28} color="#236ecf" />
            <Text style={styles.title}>Commission</Text>
          </View>
          <Text style={styles.subtitle}>
            Sales commission tracking (5% of base amount)
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Entries</Text>
              <Text style={styles.summaryValue}>{filteredEntries.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Commission</Text>
              <Text style={[styles.summaryValue, styles.totalCommissionValue]}>
                {formatCurrency(totalCommission)}
              </Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by invoice, client, or sales person..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sales Person:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedSalesPerson === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setSelectedSalesPerson('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSalesPerson === 'all' && styles.filterChipTextActive,
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {salesPersons.map((sp) => (
                <TouchableOpacity
                  key={sp.id}
                  style={[
                    styles.filterChip,
                    selectedSalesPerson === sp.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSalesPerson(sp.id)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedSalesPerson === sp.id && styles.filterChipTextActive,
                  ]}>
                    {sp.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Commission Entries */}
        <ScrollView style={styles.entriesContainer} showsVerticalScrollIndicator={false}>
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Receipt size={32} color="#6b7280" />
              <Text style={styles.emptyCardTitle}>No commission entries</Text>
              <Text style={styles.emptyCardSubtext}>
                Entries appear when invoices are paid for won proposals.
              </Text>
            </View>
          ) : (
            <>
              {/* Sales Person Summary (if filtered) */}
              {selectedSalesPerson !== 'all' && (
                <View style={styles.salesPersonSummary}>
                  <Text style={styles.salesPersonTitle}>
                    {salesPersons.find(sp => sp.id === selectedSalesPerson)?.name || 'Sales Person'}
                  </Text>
                  <Text style={styles.salesPersonTotal}>
                    Total: {formatCurrency(calculateTotalBySalesPerson(selectedSalesPerson))}
                  </Text>
                </View>
              )}

              {filteredEntries.map((entry, index) => (
                <View key={entry.invoice.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryHeaderLeft}>
                      <Receipt size={20} color="#236ecf" />
                      <View style={styles.entryTitleContainer}>
                        <Text style={styles.entryTitle}>
                          {entry.invoice.invoice_number}
                        </Text>
                        <Text style={styles.entrySubtitle}>
                          {entry.invoice.client_name}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.commissionBadge}>
                      <Percent size={16} color="#10b981" />
                      <Text style={styles.commissionBadgeText}>
                        {formatCurrency(entry.commission_amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.entryDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sales Person:</Text>
                      <Text style={styles.detailValue}>{entry.sales_person_name}</Text>
                    </View>
                    {entry.proposal && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Proposal:</Text>
                        <Text style={styles.detailValue}>{entry.proposal.proposal_number}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Invoice Date:</Text>
                      <Text style={styles.detailValue}>{formatDate(entry.invoice_date)}</Text>
                    </View>
                    {entry.paid_date && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Paid Date:</Text>
                        <Text style={styles.detailValue}>{formatDate(entry.paid_date)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.calculationBox}>
                    <Text style={styles.calculationTitle}>Commission Calculation</Text>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Invoice Total:</Text>
                      <Text style={styles.calculationValue}>
                        {formatCurrency(entry.invoice_total)}
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>General Conditions:</Text>
                      <Text style={styles.calculationValue}>
                        -{formatCurrency(entry.general_conditions)}
                      </Text>
                    </View>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>Supervision Fee:</Text>
                      <Text style={styles.calculationValue}>
                        -{formatCurrency(entry.supervision_fee)}
                      </Text>
                    </View>
                    <View style={[styles.calculationRow, styles.baseAmountRow]}>
                      <Text style={styles.baseAmountLabel}>Base Amount:</Text>
                      <Text style={styles.baseAmountValue}>
                        {formatCurrency(entry.base_amount)}
                      </Text>
                    </View>
                    <View style={[styles.calculationRow, styles.commissionRow]}>
                      <Text style={styles.commissionLabel}>
                        Commission ({entry.commission_rate * 100}%):
                      </Text>
                      <Text style={styles.commissionValue}>
                        {formatCurrency(entry.commission_amount)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </View>
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
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header like other pages
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like other pages
    gap: 16,
    ...(Platform.OS === 'web' ? {
      position: 'sticky' as any,
      top: 65,
      zIndex: 100,
    } : {}),
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like other pages
  },
  subtitle: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like other pages
  },
  content: {
    flex: 1,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    } : {}),
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#236ecf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalCommissionValue: {
    color: '#236ecf',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  entriesContainer: {
    flex: 1,
  },
  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  emptyCardSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  salesPersonSummary: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#236ecf',
  },
  salesPersonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  salesPersonTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#236ecf',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  entryTitleContainer: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  commissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  commissionBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  entryDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  calculationBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  baseAmountRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  baseAmountLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  baseAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  commissionRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#10b981',
  },
  commissionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  commissionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background like other pages
    fontWeight: '500',
  },
});

