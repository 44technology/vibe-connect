import React, { useEffect, useState } from 'react';
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
import { FileText, CheckCircle, XCircle, Edit, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import HamburgerMenu from '@/components/HamburgerMenu';
import { ProposalService } from '@/services/proposalService';
import { Proposal } from '@/types';

export default function SalesScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changeRequestReason, setChangeRequestReason] = useState('');

  // For client: show proposals, for others: redirect to sales-report
  useEffect(() => {
    if (userRole === 'client') {
      loadProposals();
    } else {
      router.replace('/sales-report');
    }
  }, [userRole]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const allProposals = await ProposalService.getProposals();
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
    } catch (error) {
      console.error('Error loading proposals:', error);
      Alert.alert('Error', 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };


  const handleApprove = async (proposal: Proposal) => {
    try {
      await ProposalService.approveProposalByClient(proposal.id);
      await loadProposals();
      setShowDetailModal(false);
      Alert.alert('Success', 'Proposal approved successfully');
    } catch (error) {
      console.error('Error approving proposal:', error);
      Alert.alert('Error', 'Failed to approve proposal');
    }
  };

  const handleReject = async () => {
    if (!selectedProposal || !rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    try {
      await ProposalService.rejectProposalByClient(selectedProposal.id, rejectionReason);
      await loadProposals();
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
      Alert.alert('Success', 'Proposal rejected');
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      Alert.alert('Error', 'Failed to reject proposal');
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedProposal || !changeRequestReason.trim()) {
      Alert.alert('Error', 'Please provide details about the requested changes');
      return;
    }

    try {
      await ProposalService.requestChangesByClient(selectedProposal.id, changeRequestReason);
      await loadProposals();
      setShowChangeRequestModal(false);
      setShowDetailModal(false);
      setChangeRequestReason('');
      Alert.alert('Success', 'Change request submitted');
    } catch (error) {
      console.error('Error requesting changes:', error);
      Alert.alert('Error', 'Failed to submit change request');
    }
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
      month: 'long',
      day: 'numeric',
    });
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
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #4b5563; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="proposal-title">Proposal</h1>
      <p class="proposal-number">No: ${proposal.proposal_number}</p>
      <p>Date: ${new Date(proposal.proposal_date || proposal.created_at || new Date().toISOString()).toLocaleDateString()}</p>
    </div>
    ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : ''}
  </div>

  <div class="info-section">
    <div class="info-box">
      <div class="info-label">Client</div>
      <div class="info-value">${proposal.client_name || 'N/A'}</div>
      <div class="info-value">${proposal.client_email || ''}</div>
      <div class="info-value">${proposal.client_address || ''}</div>
    </div>
    <div class="info-box">
      <div class="info-label">Category</div>
      <div class="info-value">${proposal.category}</div>
      <div class="info-label" style="margin-top:10px;">Totals</div>
      <div class="info-value">Total: $${(proposal.total_cost || 0).toLocaleString()}</div>
      ${proposal.discount && proposal.discount > 0 ? `<div class="info-value">Discount: -$${proposal.discount.toLocaleString()}</div>` : ''}
    </div>
  </div>

  <h2 class="section-title">Work Items</h2>
  <table class="table">
    <thead>
      <tr>
        <th>Item</th>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Price</th>
      </tr>
    </thead>
    <tbody>
      ${proposal.work_titles.map(item => `
        <tr>
          <td>
            <div class="work-item-name">${item.name}</div>
          </td>
          <td>
            ${(item.descriptions && item.descriptions.length > 0
              ? item.descriptions.filter(Boolean).map(desc => `<div class="work-item-desc">• ${desc}</div>`).join('')
              : item.description ? `<div class="work-item-desc">${item.description}</div>` : ''
            )}
          </td>
          <td class="text-right">${item.quantity || 0}</td>
          <td class="text-right">$${(item.unit_price || 0).toLocaleString()}</td>
          <td class="text-right">$${(item.price || 0).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <span class="total-label">General Conditions</span>
      <span>$${(proposal.general_conditions || 0).toLocaleString()}</span>
    </div>
    <div class="total-row">
      <span class="total-label">Supervision Fee</span>
      <span>$${(proposal.supervision_fee || 0).toLocaleString()}</span>
    </div>
    ${proposal.discount && proposal.discount > 0 ? `
    <div class="total-row">
      <span class="total-label">Discount</span>
      <span>-$${proposal.discount.toLocaleString()}</span>
    </div>` : ''}
    <div class="total-row">
      <span class="total-label">Total</span>
      <span>$${(proposal.total_cost || 0).toLocaleString()}</span>
    </div>
  </div>

  <div class="footer">
    <p>This proposal is provided for your review. Please approve, reject, or request changes.</p>
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

  const getStatusColor = (status: string | null) => {
    if (status === 'approved') return '#059669';
    if (status === 'rejected') return '#ef4444';
    if (status === 'request_changes') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusText = (status: string | null) => {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Rejected';
    if (status === 'request_changes') return 'Changes Requested';
    return 'Pending';
  };

  if (userRole !== 'client') {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading proposals...</Text>
      </View>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/');
              }
            }}
          >
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Proposals</Text>
            <Text style={styles.subtitle}>Review and approve proposals</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {proposals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FileText size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No proposals available</Text>
              <Text style={styles.emptySubtext}>Proposals sent to you will appear here</Text>
            </View>
          ) : (
            proposals.map((proposal) => (
              <TouchableOpacity
                key={proposal.id}
                style={styles.proposalCard}
                onPress={() => {
                  setSelectedProposal(proposal);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.proposalHeader}>
                  <View style={styles.proposalInfo}>
                    <Text style={styles.proposalNumber}>{proposal.proposal_number}</Text>
                    <Text style={styles.proposalDate}>{formatDate(proposal.proposal_date || proposal.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proposal.client_approval) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(proposal.client_approval)}</Text>
                  </View>
                </View>
                <View style={styles.proposalDetails}>
                  <Text style={styles.totalCost}>{formatCurrency(proposal.total_cost)}</Text>
                  <Text style={styles.category}>{proposal.category}</Text>
                </View>
                {proposal.client_change_request_reason && (
                  <View style={styles.changeRequestNote}>
                    <Text style={styles.changeRequestLabel}>Change Request:</Text>
                    <Text style={styles.changeRequestText}>{proposal.client_change_request_reason}</Text>
                  </View>
                )}
                {proposal.client_rejection_reason && (
                  <View style={styles.rejectionNote}>
                    <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                    <Text style={styles.rejectionText}>{proposal.client_rejection_reason}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Proposal Detail Modal */}
        <Modal
          visible={showDetailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Proposal Details</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDetailModal(false);
                    setSelectedProposal(null);
                  }}
                >
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>

              {selectedProposal && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Proposal Number</Text>
                    <Text style={styles.detailValue}>{selectedProposal.proposal_number}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedProposal.proposal_date || selectedProposal.created_at)}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{selectedProposal.category}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Work Items</Text>
                    {selectedProposal.work_titles.map((item, index) => (
                      <View key={index} style={styles.workItem}>
                        <Text style={styles.workItemName}>{item.name}</Text>
                        <Text style={styles.workItemDetails}>
                          Qty: {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.price)}
                        </Text>
                        {/* Show descriptions array if available, otherwise fallback to description */}
                        {item.descriptions && item.descriptions.length > 0 ? (
                          item.descriptions.map((desc, descIndex) => (
                            desc && desc.trim() ? (
                              <Text key={descIndex} style={styles.workItemDescription}>
                                • {desc}
                              </Text>
                            ) : null
                          ))
                        ) : item.description ? (
                          <Text style={styles.workItemDescription}>{item.description}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>General Conditions</Text>
                    <Text style={styles.detailValue}>{formatCurrency(selectedProposal.general_conditions)}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Supervision Fee</Text>
                    <Text style={styles.detailValue}>{formatCurrency(selectedProposal.supervision_fee)}</Text>
                  </View>

                  {selectedProposal.discount && selectedProposal.discount > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Discount</Text>
                      <Text style={styles.detailValue}>-{formatCurrency(selectedProposal.discount)}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Total Cost</Text>
                    <Text style={styles.detailTotal}>{formatCurrency(selectedProposal.total_cost)}</Text>
                  </View>

                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleExportPDF(selectedProposal)}
                >
                  <Text style={styles.downloadButtonText}>Download PDF</Text>
                </TouchableOpacity>

                  {selectedProposal.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue}>{selectedProposal.description}</Text>
                    </View>
                  )}

                  {selectedProposal.client_change_request_reason && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Change Request</Text>
                      <Text style={styles.detailValue}>{selectedProposal.client_change_request_reason}</Text>
                    </View>
                  )}

                  {selectedProposal.client_rejection_reason && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Rejection Reason</Text>
                      <Text style={styles.detailValue}>{selectedProposal.client_rejection_reason}</Text>
                    </View>
                  )}

                  {/* Action Buttons - Only show for pending proposals */}
                  {selectedProposal.client_approval === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(selectedProposal)}
                      >
                        <CheckCircle size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.requestChangesButton]}
                        onPress={() => {
                          setShowChangeRequestModal(true);
                        }}
                      >
                        <Edit size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Request Changes</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => {
                          setShowRejectModal(true);
                        }}
                      >
                        <XCircle size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Reject Modal */}
        <Modal
          visible={showRejectModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.rejectModalContent}>
              <Text style={styles.rejectModalTitle}>Reject Proposal</Text>
              <Text style={styles.rejectModalSubtitle}>Please provide a reason for rejection</Text>
              <TextInput
                style={styles.rejectInput}
                multiline
                numberOfLines={4}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
              />
              <View style={styles.rejectModalButtons}>
                <TouchableOpacity
                  style={[styles.rejectModalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            <TouchableOpacity
                  style={[styles.rejectModalButton, styles.confirmRejectButton]}
                  onPress={handleReject}
            >
                  <Text style={styles.confirmButtonText}>Reject</Text>
            </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Request Changes Modal */}
        <Modal
          visible={showChangeRequestModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowChangeRequestModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.rejectModalContent}>
              <Text style={styles.rejectModalTitle}>Request Changes</Text>
              <Text style={styles.rejectModalSubtitle}>Please describe the changes you would like</Text>
              <TextInput
                style={styles.rejectInput}
                multiline
                numberOfLines={4}
                placeholder="Describe the changes needed..."
                value={changeRequestReason}
                onChangeText={setChangeRequestReason}
              />
              <View style={styles.rejectModalButtons}>
                <TouchableOpacity
                  style={[styles.rejectModalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowChangeRequestModal(false);
                    setChangeRequestReason('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectModalButton, styles.requestChangesConfirmButton]}
                  onPress={handleRequestChanges}
                >
                  <Text style={styles.confirmButtonText}>Submit Request</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#236ecf',
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#e5e7eb',
    marginTop: 8,
  },
  proposalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  proposalInfo: {
    flex: 1,
  },
  proposalNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  proposalDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  proposalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalCost: {
    fontSize: 20,
    fontWeight: '700',
    color: '#236ecf',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  changeRequestNote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  changeRequestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  changeRequestText: {
    fontSize: 14,
    color: '#78350f',
  },
  rejectionNote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: '#7f1d1d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
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
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  detailTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#236ecf',
  },
  workItem: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  workItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workItemDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  workItemDescription: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#059669',
  },
  requestChangesButton: {
    backgroundColor: '#f59e0b',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
  rejectModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  rejectModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmRejectButton: {
    backgroundColor: '#ef4444',
  },
  requestChangesConfirmButton: {
    backgroundColor: '#f59e0b',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
