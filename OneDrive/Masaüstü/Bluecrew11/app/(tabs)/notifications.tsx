import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Bell, MessageSquare, Package, FileText, CheckCircle, XCircle, Truck, ShoppingCart, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService, Notification } from '@/services/notificationService';
import { router } from 'expo-router';
import HamburgerMenu from '@/components/HamburgerMenu';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadUnreadCount();
      
      // Subscribe to real-time notifications
      const unsubscribe = NotificationService.subscribeToNotifications(
        user.id,
        (updatedNotifications) => {
          setNotifications(updatedNotifications);
          const unread = updatedNotifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      );

      return () => unsubscribe();
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userNotifications = await NotificationService.getUserNotifications(user.id, 100);
      setNotifications(userNotifications);
      const unread = userNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const count = await NotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadNotifications();
    await loadUnreadCount();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await NotificationService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.related_id) {
      if (notification.type === 'chat' && notification.related_type === 'project_chat') {
        router.push(`/(tabs)/project/${notification.related_id}`);
      } else if (notification.type === 'material_request') {
        router.push(`/(tabs)/material-request`);
      } else if (notification.type === 'change_order') {
        router.push(`/(tabs)/change-order`);
      } else if (notification.type === 'project') {
        router.push(`/(tabs)/project/${notification.related_id}`);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await NotificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return MessageSquare;
      case 'material_request':
        return Package;
      case 'change_order':
        return FileText;
      case 'project':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat':
        return '#3b82f6'; // Blue
      case 'material_request':
        return '#f59e0b'; // Orange
      case 'change_order':
        return '#10b981'; // Green
      case 'project':
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <HamburgerMenu />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        {unreadCount > 0 && (
          <Text style={styles.unreadCount}>{unreadCount} unread</Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          ) : undefined
        }>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#ffffff" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        ) : (
          <>
            {unreadNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>New</Text>
                {unreadNotifications.map(notification => {
                  const Icon = getNotificationIcon(notification.type);
                  const color = getNotificationColor(notification.type);
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[styles.notificationItem, styles.unreadItem]}
                      onPress={() => handleNotificationPress(notification)}>
                      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                        <Icon size={20} color={color} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationMessage}>{notification.message}</Text>
                        <Text style={styles.notificationTime}>
                          {formatDate(notification.created_at)}
                        </Text>
                      </View>
                      <View style={styles.unreadDot} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {readNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Earlier</Text>
                {readNotifications.map(notification => {
                  const Icon = getNotificationIcon(notification.type);
                  const color = getNotificationColor(notification.type);
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={styles.notificationItem}
                      onPress={() => handleNotificationPress(notification)}>
                      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                        <Icon size={20} color={color} />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={[styles.notificationTitle, styles.readTitle]}>
                          {notification.title}
                        </Text>
                        <Text style={[styles.notificationMessage, styles.readMessage]}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatDate(notification.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  header: {
    backgroundColor: '#1e40af', // Darker blue header like other pages
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like other pages
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like other pages
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#236ecf',
  },
  markAllText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  unreadCount: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like other pages
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like other pages
    marginTop: 8,
  },
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: Platform.OS === 'web' ? 20 : 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like other pages
    alignItems: 'flex-start',
    minHeight: Platform.OS !== 'web' ? 100 : undefined,
  },
  unreadItem: {
    borderLeftColor: '#236ecf', // Blue border for unread
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  readTitle: {
    color: '#6b7280',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  readMessage: {
    color: '#9ca3af',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#236ecf',
    marginTop: 6,
  },
});

