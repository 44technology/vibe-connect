import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  MapPin, 
  Calendar, 
  Hash,
  ArrowLeft,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialRequest } from '@/types';
import { MaterialRequestService } from '@/services/materialRequestService';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';
import { Alert } from 'react-native';

type FilterStatus = 'all' | 'ordered' | 'shipped' | 'delivered';

export default function TrackingScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await MaterialRequestService.getMaterialRequests();
      console.log('All material requests loaded:', allRequests.length);
      
      // Only show approved requests
      // Admin and office can see all approved requests (even without purchase_status)
      // Other roles can only see approved requests that have purchase_status
      const trackingRequests = allRequests.filter(
        req => {
          // Must be approved first
          if (req.status !== 'approved') {
            return false;
          }
          
          // Admin and office can see all approved requests
          if (userRole === 'admin' || userRole === 'office') {
            return true;
          }
          
          // Other roles can only see approved requests with purchase_status
          return req.purchase_status && req.purchase_status !== 'pending';
        }
      );
      
      console.log('Tracking requests filtered:', trackingRequests.length);
      console.log('Sample request:', trackingRequests[0]);
      
      setRequests(trackingRequests);
    } catch (error) {
      console.error('Error loading tracking requests:', error);
      setRequests([]);
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
    await loadRequests();
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(req => req.purchase_status === filterStatus);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ordered': return '#3b82f6'; // Blue
      case 'shipped': return '#f59e0b'; // Orange
      case 'delivered': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ordered': return ShoppingCart;
      case 'shipped': return Truck;
      case 'delivered': return MapPin;
      default: return Clock;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ordered': return 'Ordered';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return 'Pending';
    }
  };

  const getTimelineSteps = (request: MaterialRequest) => {
    const steps = [];
    
    // Requested
    steps.push({
      status: 'completed',
      label: 'Requested',
      date: request.requested_at,
      icon: Package,
    });

    // Approved
    if (request.approved_at) {
      steps.push({
        status: 'completed',
        label: 'Approved',
        date: request.approved_at,
        icon: CheckCircle,
      });
    }

    // Ordered
    if (request.purchase_status === 'ordered' || request.purchase_status === 'shipped' || request.purchase_status === 'delivered') {
      steps.push({
        status: 'completed',
        label: 'Ordered',
        date: request.purchase_date,
        icon: ShoppingCart,
      });
    }

    // Shipped
    if (request.purchase_status === 'shipped' || request.purchase_status === 'delivered') {
      steps.push({
        status: 'completed',
        label: 'Shipped',
        date: request.shipping_date,
        icon: Truck,
      });
    }

    // Delivered
    if (request.purchase_status === 'delivered') {
      steps.push({
        status: 'completed',
        label: 'Delivered',
        date: request.delivery_date_actual,
        icon: MapPin,
      });
    } else if (request.purchase_status === 'shipped') {
      steps.push({
        status: 'pending',
        label: 'Delivered',
        date: request.delivery_date,
        icon: MapPin,
      });
    } else if (request.purchase_status === 'ordered') {
      steps.push({
        status: 'pending',
        label: 'Shipped',
        date: null,
        icon: Truck,
      });
      steps.push({
        status: 'pending',
        label: 'Delivered',
        date: request.delivery_date,
        icon: MapPin,
      });
    }

    return steps;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Status update functions for office and admin
  const handleUpdateStatus = async (requestId: string, newStatus: 'ordered' | 'shipped' | 'delivered') => {
    try {
      const updateData: any = {
        purchase_status: newStatus,
      };

      // Set appropriate date based on status
      if (newStatus === 'ordered') {
        updateData.purchase_date = new Date().toISOString();
      } else if (newStatus === 'shipped') {
        updateData.shipping_date = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivery_date_actual = new Date().toISOString();
      }

      await MaterialRequestService.updateMaterialRequest(requestId, updateData);
      await loadRequests();
      Alert.alert('Success', `Status updated to ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const canUpdateStatus = userRole === 'admin' || userRole === 'office';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      {Platform.OS === 'web' && <TopNavigationBar />}
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Material Tracking</Text>
          <Text style={styles.subtitle}>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'ordered' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('ordered')}
        >
          <ShoppingCart size={16} color={filterStatus === 'ordered' ? '#ffffff' : '#6b7280'} />
          <Text style={[styles.filterButtonText, filterStatus === 'ordered' && styles.filterButtonTextActive]}>
            Ordered
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'shipped' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('shipped')}
        >
          <Truck size={16} color={filterStatus === 'shipped' ? '#ffffff' : '#6b7280'} />
          <Text style={[styles.filterButtonText, filterStatus === 'shipped' && styles.filterButtonTextActive]}>
            Shipped
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'delivered' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('delivered')}
        >
          <MapPin size={16} color={filterStatus === 'delivered' ? '#ffffff' : '#6b7280'} />
          <Text style={[styles.filterButtonText, filterStatus === 'delivered' && styles.filterButtonTextActive]}>
            Delivered
          </Text>
        </TouchableOpacity>
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
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No tracking information available</Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'all' 
                ? 'No approved material requests with tracking status'
                : `No requests with status: ${getStatusText(filterStatus)}`
              }
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.purchase_status);
            const statusColor = getStatusColor(request.purchase_status);
            const timelineSteps = getTimelineSteps(request);

            return (
              <View key={request.id} style={styles.trackingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Package size={20} color="#236ecf" />
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>{request.description}</Text>
                      <View style={styles.cardSubtitle}>
                        <Hash size={12} color="#6b7280" />
                        <Text style={styles.cardSubtitleText}>{request.project_name}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <StatusIcon size={16} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {getStatusText(request.purchase_status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{request.quantity}</Text>
                  </View>
                  {request.sub_contractor && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vendor:</Text>
                      <Text style={styles.detailValue}>{request.sub_contractor}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expected Delivery:</Text>
                    <Text style={styles.detailValue}>{formatDate(request.delivery_date)}</Text>
                  </View>
                </View>

                {/* Status Update Buttons - Only for admin and office */}
                {canUpdateStatus && (
                  <View style={styles.statusActionsContainer}>
                    <Text style={styles.statusActionsTitle}>Update Status</Text>
                    <View style={styles.statusActions}>
                      {/* Show "Mark as Ordered" if status is pending, doesn't exist, or is approved without purchase_status */}
                      {(!request.purchase_status || request.purchase_status === 'pending') && (
                        <TouchableOpacity
                          style={[styles.statusActionButton, styles.statusActionButtonOrdered]}
                          onPress={() => handleUpdateStatus(request.id, 'ordered')}
                        >
                          <ShoppingCart size={16} color="#ffffff" />
                          <Text style={styles.statusActionButtonText}>Mark as Ordered</Text>
                        </TouchableOpacity>
                      )}
                      {/* Show "Mark as Shipped" if status is ordered */}
                      {request.purchase_status === 'ordered' && (
                        <TouchableOpacity
                          style={[styles.statusActionButton, styles.statusActionButtonShipped]}
                          onPress={() => handleUpdateStatus(request.id, 'shipped')}
                        >
                          <Truck size={16} color="#ffffff" />
                          <Text style={styles.statusActionButtonText}>Mark as Shipped</Text>
                        </TouchableOpacity>
                      )}
                      {/* Show "Mark as Delivered" if status is shipped */}
                      {request.purchase_status === 'shipped' && (
                        <TouchableOpacity
                          style={[styles.statusActionButton, styles.statusActionButtonDelivered]}
                          onPress={() => handleUpdateStatus(request.id, 'delivered')}
                        >
                          <MapPin size={16} color="#ffffff" />
                          <Text style={styles.statusActionButtonText}>Mark as Delivered</Text>
                        </TouchableOpacity>
                      )}
                      {/* If delivered, show message */}
                      {request.purchase_status === 'delivered' && (
                        <View style={styles.statusCompletedMessage}>
                          <CheckCircle size={16} color="#10b981" />
                          <Text style={styles.statusCompletedText}>Order delivered</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                  <Text style={styles.timelineTitle}>Tracking Timeline</Text>
                  {timelineSteps.map((step, index) => {
                    const IconComponent = step.icon;
                    const isLast = index === timelineSteps.length - 1;
                    const isCompleted = step.status === 'completed';

                    return (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineLine}>
                          <View style={[
                            styles.timelineIcon,
                            isCompleted ? styles.timelineIconCompleted : styles.timelineIconPending
                          ]}>
                            <IconComponent 
                              size={16} 
                              color={isCompleted ? '#ffffff' : '#9ca3af'} 
                            />
                          </View>
                          {!isLast && (
                            <View style={[
                              styles.timelineConnector,
                              isCompleted ? styles.timelineConnectorCompleted : styles.timelineConnectorPending
                            ]} />
                          )}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={[
                            styles.timelineLabel,
                            isCompleted ? styles.timelineLabelCompleted : styles.timelineLabelPending
                          ]}>
                            {step.label}
                          </Text>
                          {step.date && (
                            <Text style={styles.timelineDate}>
                              {formatDate(step.date)}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#236ecf',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  trackingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtitleText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  timelineContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#10b981',
  },
  timelineIconPending: {
    backgroundColor: '#e5e7eb',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginTop: 4,
  },
  timelineConnectorCompleted: {
    backgroundColor: '#10b981',
  },
  timelineConnectorPending: {
    backgroundColor: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineLabelCompleted: {
    color: '#111827',
  },
  timelineLabelPending: {
    color: '#9ca3af',
  },
  timelineDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusActionsContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  statusActionButtonOrdered: {
    backgroundColor: '#3b82f6',
  },
  statusActionButtonShipped: {
    backgroundColor: '#f59e0b',
  },
  statusActionButtonDelivered: {
    backgroundColor: '#10b981',
  },
  statusActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusCompletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
    gap: 8,
  },
  statusCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});

