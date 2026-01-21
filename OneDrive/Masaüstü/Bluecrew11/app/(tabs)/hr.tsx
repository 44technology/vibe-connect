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
} from 'react-native';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Calendar, 
  Star, 
  Bell, 
  TrendingUp,
  UserPlus,
  FileText,
  Settings,
  ExternalLink,
  Plus,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { TimeClockService } from '@/services/timeClockService';
import { UserService } from '@/services/userService';
import { useRouter } from 'expo-router';
import HamburgerMenu from '@/components/HamburgerMenu';

interface HRWidget {
  id: string;
  title: string;
  icon: string;
  count: number;
  total: number;
  color: string;
  data: any[];
  actionText: string;
}

export default function HRScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState<HRWidget | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hrWidgets, setHrWidgets] = useState<HRWidget[]>([]);
  
  // Web-specific features
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWidgetForTable, setSelectedWidgetForTable] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'widget' | 'table'>('widget');
  const [isMobile, setIsMobile] = useState(false);
  
  // Date filter for weekly time clock data
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  // Load HR data from Firebase
  const loadHRData = async () => {
    try {
      // Don't set loading to true to prevent button flickering
      // setLoading(true);
      
      // Load time clock entries
      const timeEntries = await TimeClockService.getTimeClockEntries();
      
      // Load all users
      const allUsers = await UserService.getAllUsers();
      
      // Get current week
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const currentWeek = {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
      };
      
      // Get weekly time clock data for selected week
      const selectedWeekStartDate = new Date(selectedWeekStart);
      const selectedWeekEndDate = new Date(selectedWeekStartDate);
      selectedWeekEndDate.setDate(selectedWeekStartDate.getDate() + 6);
      const selectedWeek = {
        start: selectedWeekStart,
        end: selectedWeekEndDate.toISOString().split('T')[0],
      };
      
      // Get weekly time clock data
      const weeklyData = await TimeClockService.getWeeklyTimeClock(selectedWeek.start, selectedWeek.end);
      
      // Calculate approaching overtime (clocked in users with > 8 hours)
      const clockedInUsers = timeEntries.filter(entry => entry.status === 'clocked_in');
      const approachingOvertime = clockedInUsers
        .map(entry => {
          const clockInTime = new Date(entry.clock_in);
          const now = new Date();
          const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
          return { entry, hoursWorked };
        })
        .filter(({ hoursWorked }) => hoursWorked > 8)
        .map(({ entry, hoursWorked }) => {
          const user = allUsers.find(u => u.id === entry.user_id);
          const overtimeMinutes = Math.round((hoursWorked - 8) * 60);
          return {
            name: user?.name || entry.user_name,
            time: `${overtimeMinutes} minutes OT 1`,
            status: 'warning',
          };
        });
      
      // Calculate required approvals (time entries needing approval)
      const requiredApprovals = timeEntries
        .filter(entry => entry.status === 'clocked_out' && entry.total_hours && entry.total_hours > 8)
        .map(entry => {
          const user = allUsers.find(u => u.id === entry.user_id);
          const clockIn = new Date(entry.clock_in);
          const clockOut = entry.clock_out ? new Date(entry.clock_out) : new Date();
          const date = clockIn.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
          const time = `${clockIn.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${clockOut.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
          return {
            name: user?.name || entry.user_name,
            type: entry.total_hours && entry.total_hours > 8 ? 'Overtime' : 'Manager Approval',
            time: `${date} ${time}`,
            status: 'approved',
          };
        })
        .slice(0, 5);
      
      // Calculate overtime by department
      const userHours: { [userId: string]: { totalHours: number, role: string } } = {};
      weeklyData.entries.forEach(entry => {
        const userId = entry.user_id;
        const user = allUsers.find(u => u.id === userId);
        if (!userHours[userId]) {
          userHours[userId] = { totalHours: 0, role: user?.role || 'Other' };
        }
        userHours[userId].totalHours += entry.total_hours || 0;
      });
      
      const departmentOvertime: { [dept: string]: { total: number, count: number } } = {};
      Object.values(userHours).forEach(({ totalHours, role }) => {
        const department = role || 'Other';
        if (!departmentOvertime[department]) {
          departmentOvertime[department] = { total: 0, count: 0 };
        }
        if (totalHours > 40) {
          departmentOvertime[department].total += totalHours - 40;
          departmentOvertime[department].count += 1;
        }
      });
      
      const totalOvertime = Object.values(departmentOvertime).reduce((sum: number, dept) => sum + dept.total, 0);
      const totalHoursAll = Object.values(userHours).reduce((sum, user) => sum + user.totalHours, 0);
      const overtimeByDept = Object.entries(departmentOvertime).map(([dept, data]) => ({
        department: dept,
        percentage: totalOvertime > 0 ? Math.round((data.total / totalOvertime) * 100) : 0,
        color: dept === 'pm' ? '#fbbf24' : dept === 'sales' ? '#3b82f6' : dept === 'admin' ? '#8b5cf6' : '#06b6d4',
      }));
      
      // Build weekly time clock summary data
      const weeklySummary = weeklyData.entries.map(entry => {
        const user = allUsers.find(u => u.id === entry.user_id);
        const clockIn = new Date(entry.clock_in);
        const clockOut = entry.clock_out ? new Date(entry.clock_out) : new Date();
        const date = clockIn.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
        const hours = entry.total_hours || 0;
        const overtime = hours > 8 ? hours - 8 : 0;
        
        return {
          name: user?.name || entry.user_name || 'Unknown',
          date: date,
          hours: hours.toFixed(2),
          overtime: overtime > 0 ? `${overtime.toFixed(2)}h OT` : '-',
          status: hours > 8 ? 'overtime' : hours >= 8 ? 'normal' : 'under',
        };
      });

      // Group by user for weekly totals
      const userWeeklyTotals: { [userId: string]: { name: string, totalHours: number, totalOvertime: number } } = {};
      weeklyData.entries.forEach(entry => {
        const userId = entry.user_id;
        const user = allUsers.find(u => u.id === userId);
        if (!userWeeklyTotals[userId]) {
          userWeeklyTotals[userId] = {
            name: user?.name || entry.user_name || 'Unknown',
            totalHours: 0,
            totalOvertime: 0,
          };
        }
        const hours = entry.total_hours || 0;
        userWeeklyTotals[userId].totalHours += hours;
        if (hours > 8) {
          userWeeklyTotals[userId].totalOvertime += hours - 8;
        }
      });

      const weeklyUserData = Object.values(userWeeklyTotals).map(user => ({
        name: user.name,
        totalHours: user.totalHours.toFixed(2),
        totalOvertime: user.totalOvertime > 0 ? `${user.totalOvertime.toFixed(2)}h OT` : '-',
        status: user.totalHours > 40 ? 'overtime' : user.totalHours >= 40 ? 'normal' : 'under',
      }));

      // Build HR Widgets (only essential ones)
      const widgets: HRWidget[] = [
        {
          id: 'approaching-overtime',
          title: 'APPROACHING OVERTIME (CLOCKED IN)',
          icon: 'clock',
          count: approachingOvertime.length,
          total: approachingOvertime.length,
          color: '#ef4444',
          data: approachingOvertime,
          actionText: 'Jump to Approaching Overtime',
        },
        {
          id: 'required-approvals',
          title: 'REQUIRED APPROVALS',
          icon: 'check-circle',
          count: requiredApprovals.length,
          total: requiredApprovals.length,
          color: '#ef4444',
          data: requiredApprovals,
          actionText: 'Jump to Group Hours',
        },
        {
          id: 'weekly-time-clock',
          title: 'WEEKLY TIME CLOCK SUMMARY',
          icon: 'clock',
          count: weeklyData.entries.length,
          total: weeklyData.entries.length,
          color: '#236ecf',
          data: weeklyUserData,
          actionText: 'View Weekly Details',
        },
        {
          id: 'overtime-by-department',
          title: 'OVERTIME BY DEPARTMENT',
          icon: 'trending-up',
          count: totalHoursAll > 0 ? Math.round((totalOvertime / totalHoursAll) * 10000) / 100 : 0,
          total: totalHoursAll > 0 ? Math.round((totalOvertime / totalHoursAll) * 10000) / 100 : 0,
          color: '#22c55e',
          data: overtimeByDept,
          actionText: 'View Department Reports',
        },
      ];
      
      setHrWidgets(widgets);
    } catch (error) {
      console.error('Error loading HR data:', error);
      setHrWidgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      setLoading(true);
      loadHRData();
    } else {
      setLoading(false);
    }
  }, [userRole, selectedWeekStart]);

  // Set view mode and mobile detection
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      setViewMode('widget');
      return;
    }
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isMobileWidth = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const mobile = isMobileWidth || isMobileUA;
      setIsMobile(mobile);
      setViewMode(mobile ? 'widget' : 'table');
      
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

  // Old mock data removed - now using Firebase data

  const getIcon = (iconName: string, size: number, color: string) => {
    switch (iconName) {
      case 'clock':
        return <Clock size={size} color={color} />;
      case 'check-circle':
        return <CheckCircle size={size} color={color} />;
      case 'trending-up':
        return <TrendingUp size={size} color={color} />;
      case 'calendar':
        return <Calendar size={size} color={color} />;
      case 'star':
        return <Star size={size} color={color} />;
      case 'bell':
        return <Bell size={size} color={color} />;
      default:
        return <Users size={size} color={color} />;
    }
  };

  const handleWidgetPress = (widget: HRWidget) => {
    if (Platform.OS === 'web' && viewMode === 'widget') {
      // Web: Switch to table view for this widget
      setSelectedWidgetForTable(widget.id);
      setViewMode('table');
    } else {
      // Mobile: Show modal
      setSelectedWidget(widget);
      setShowDetailModal(true);
    }
  };

  // Filter functions for web table view
  const getFilteredWidgetData = (widget: HRWidget | null) => {
    if (!widget) return [];
    if (!searchQuery) return widget.data;
    const query = searchQuery.toLowerCase();
    return widget.data.filter(item => {
      const name = (item.name || item.department || item.text || '').toLowerCase();
      const time = (item.time || item.date || item.type || '').toLowerCase();
      const percentage = item.percentage?.toString() || '';
      return name.includes(query) || time.includes(query) || percentage.includes(query);
    });
  };

  const getCurrentWidgetForTable = () => {
    if (!selectedWidgetForTable) return null;
    return hrWidgets.find(w => w.id === selectedWidgetForTable) || null;
  };

  const renderWidget = (widget: HRWidget) => (
    <TouchableOpacity
      key={widget.id}
      style={styles.widgetCard}
      onPress={() => handleWidgetPress(widget)}
      activeOpacity={0.7}
    >
      <View style={styles.widgetHeader}>
        <View style={styles.widgetTitleSection}>
          {getIcon(widget.icon, 20, widget.color)}
          <Text style={styles.widgetTitle}>{widget.title}</Text>
        </View>
        <View style={styles.widgetCount}>
          <Text style={[styles.countText, { color: widget.color }]}>
            {typeof widget.count === 'number' && widget.count % 1 !== 0 
              ? widget.count.toFixed(2) 
              : widget.count
            }
          </Text>
          <Text style={styles.totalText}>/{widget.total}</Text>
        </View>
      </View>

      <View style={styles.widgetContent}>
        {widget.data.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.dataRow}>
            <Text style={styles.dataText} numberOfLines={1}>
              {item.name || item.department || item.text}
            </Text>
            <Text style={styles.dataSubtext}>
              {item.time || item.date || item.type || item.percentage + '%'}
            </Text>
          </View>
        ))}
        {widget.data.length > 3 && (
          <Text style={styles.moreText}>+{widget.data.length - 3} more</Text>
        )}
      </View>

      <View style={styles.widgetFooter}>
        <Text style={styles.actionText}>{widget.actionText}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedWidget?.title}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedWidget?.data.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailName}>
                    {item.name || item.department || item.text}
                  </Text>
                  <Text style={styles.detailSubtext}>
                    {item.time || item.date || item.type || item.percentage + '%'}
                  </Text>
                </View>
                {item.status && (
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'approved' ? '#22c55e' : '#f59e0b' }
                  ]}>
                    <Text style={styles.statusText}>
                      {item.status === 'approved' ? '✓' : '⏳'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.actionButtonText}>
                {selectedWidget?.actionText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const currentWidgetForTable = getCurrentWidgetForTable();
  const filteredTableData = getFilteredWidgetData(currentWidgetForTable);

  if (loading) {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>HR Dashboard</Text>
                
                {/* Payroll, Commission, and Employee Navigation */}
                <View style={styles.navButtons}>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push('/payroll')}
                  >
                    <DollarSign size={24} color="#236ecf" />
                    <Text style={styles.navButtonText}>Payroll</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push('/commission')}
                  >
                    <TrendingUp size={24} color="#10b981" />
                    <Text style={styles.navButtonText}>Commission</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => router.push('/employee?from=hr')}
                  >
                    <Users size={24} color="#8b5cf6" />
                    <Text style={styles.navButtonText}>Employee</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Manage HR data and analytics</Text>
              </View>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffcc00" />
            <Text style={styles.loadingText}>Loading HR data...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>HR Dashboard</Text>
              <Text style={styles.subtitle}>Manage HR data and analytics</Text>
            </View>
            
            {Platform.OS === 'web' && !isMobile && (
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton} onPress={loadHRData}>
                  <Text style={styles.headerButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Payroll, Commission, and Employee Navigation - Always visible outside headerTop */}
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/payroll')}
            >
              <DollarSign size={24} color="#236ecf" />
              <Text style={styles.navButtonText}>Payroll</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/commission')}
            >
              <TrendingUp size={24} color="#10b981" />
              <Text style={styles.navButtonText}>Commission</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/employee?from=hr')}
            >
              <Users size={24} color="#8b5cf6" />
              <Text style={styles.navButtonText}>Employee</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Refresh Button - Moved to content area for mobile */}
      {isMobile && (
        <View style={styles.contentActions}>
          <TouchableOpacity style={styles.headerButton} onPress={loadHRData}>
            <Text style={styles.headerButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Filter for Weekly Time Clock */}
      <View style={styles.dateFilterContainer}>
        <Text style={styles.dateFilterLabel}>Week:</Text>
        <TouchableOpacity
          style={styles.dateFilterButton}
          onPress={() => {
            const currentDate = new Date(selectedWeekStart);
            currentDate.setDate(currentDate.getDate() - 7);
            setSelectedWeekStart(currentDate.toISOString().split('T')[0]);
          }}
        >
          <ChevronLeft size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateFilterInput}
          onPress={() => {
            // Open date picker for week selection
            if (Platform.OS === 'web') {
              const input = document.createElement('input');
              input.type = 'week';
              input.value = selectedWeekStart.substring(0, 10);
              input.onchange = (e: any) => {
                const value = e.target.value;
                if (value) {
                  const date = new Date(value);
                  // Get Monday of that week
                  const day = date.getDay();
                  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                  const monday = new Date(date.setDate(diff));
                  setSelectedWeekStart(monday.toISOString().split('T')[0]);
                }
              };
              input.click();
            }
          }}
        >
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.dateFilterText}>
            {(() => {
              const start = new Date(selectedWeekStart);
              const end = new Date(start);
              end.setDate(start.getDate() + 6);
              return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            })()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateFilterButton}
          onPress={() => {
            const currentDate = new Date(selectedWeekStart);
            currentDate.setDate(currentDate.getDate() + 7);
            setSelectedWeekStart(currentDate.toISOString().split('T')[0]);
          }}
        >
          <ChevronRight size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.currentWeekButton}
          onPress={() => {
            const now = new Date();
            const monday = new Date(now);
            monday.setDate(now.getDate() - now.getDay() + 1);
            setSelectedWeekStart(monday.toISOString().split('T')[0]);
          }}
        >
          <Text style={styles.currentWeekButtonText}>Current Week</Text>
        </TouchableOpacity>
      </View>

      {/* Web: Search Bar for Table View */}
      {Platform.OS === 'web' && viewMode === 'table' && (
        <View style={styles.webToolbar}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text style={styles.tableCount}>
            {filteredTableData.length} of {currentWidgetForTable?.data.length || 0} items
          </Text>
        </View>
      )}

      {/* Web: Table View */}
      {Platform.OS === 'web' && viewMode === 'table' && currentWidgetForTable ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              {currentWidgetForTable.id === 'overtime-by-department' ? (
                <>
                  <Text style={styles.tableHeaderText}>Department</Text>
                  <Text style={styles.tableHeaderText}>Percentage</Text>
                  <Text style={styles.tableHeaderText}>Color</Text>
                </>
              ) : currentWidgetForTable.id === 'weekly-time-clock' ? (
                <>
                  <Text style={styles.tableHeaderText}>Name</Text>
                  <Text style={styles.tableHeaderText}>Total Hours</Text>
                  <Text style={styles.tableHeaderText}>Overtime</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                </>
              ) : (
                <>
                  <Text style={styles.tableHeaderText}>Name</Text>
                  <Text style={styles.tableHeaderText}>Details</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                </>
              )}
            </View>
            {filteredTableData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            ) : (
              filteredTableData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  {currentWidgetForTable.id === 'overtime-by-department' ? (
                    <>
                      <Text style={styles.tableCell}>{item.department || 'N/A'}</Text>
                      <Text style={styles.tableCell}>{item.percentage || 0}%</Text>
                      <View style={[styles.colorIndicator, { backgroundColor: item.color || '#6b7280' }]} />
                    </>
                  ) : currentWidgetForTable.id === 'weekly-time-clock' ? (
                    <>
                      <Text style={styles.tableCell}>{item.name || 'N/A'}</Text>
                      <Text style={styles.tableCell}>{item.totalHours || '0'}h</Text>
                      <Text style={styles.tableCell}>{item.totalOvertime || '-'}</Text>
                      <View style={[
                        styles.statusBadge,
                        { 
                          backgroundColor: item.status === 'overtime' ? '#ef4444' : 
                                          item.status === 'normal' ? '#22c55e' : '#f59e0b'
                        }
                      ]}>
                        <Text style={styles.statusText}>
                          {item.status === 'overtime' ? '⚠' : item.status === 'normal' ? '✓' : '⏳'}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.tableCell}>
                        {item.name || item.department || item.text || 'N/A'}
                      </Text>
                      <Text style={styles.tableCell}>
                        {item.time || item.date || item.type || (item.percentage ? item.percentage + '%' : '') || 'N/A'}
                      </Text>
                      {item.status && (
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: item.status === 'approved' ? '#22c55e' : '#f59e0b' }
                        ]}>
                          <Text style={styles.statusText}>
                            {item.status === 'approved' ? '✓' : '⏳'}
                          </Text>
                        </View>
                      )}
                      {!item.status && <Text style={styles.tableCell}>-</Text>}
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      ) : (
        /* Widget View (Default) */
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          scrollEventThrottle={16}
        >
          <Text style={styles.matchingText}>
            {hrWidgets.length} Widgets
          </Text>

          <View style={styles.widgetsGrid}>
            {hrWidgets.map(renderWidget)}
          </View>
        </ScrollView>
      )}

      {renderDetailModal()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  header: {
    backgroundColor: '#1e40af', // Darker blue header like other pages
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like other pages
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerTop: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    justifyContent: Platform.OS === 'web' ? 'space-between' : 'flex-start',
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
    marginBottom: 12,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28, // Increased font size like other pages
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like other pages
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like other pages
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffcc00',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  contentActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffcc00', // Yellow button like other pages
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937', // Dark text on yellow
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  matchingText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  widgetsGrid: {
    gap: 16,
  },
  widgetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  widgetTitleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  widgetCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countText: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 2,
  },
  widgetContent: {
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  dataSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  widgetFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#236ecf',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  detailSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Web-specific styles
  headerLeft: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffcc00', // Yellow button like other pages
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937', // Dark text on yellow
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
  tableCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Table styles
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  urlCell: {
    color: '#236ecf',
    fontStyle: 'italic',
  },
  tableActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  // Date filter styles
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1e40af', // Darker blue like header
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border
    gap: 8,
  },
  dateFilterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffcc00', // Yellow text
    marginRight: 8,
  },
  dateFilterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffcc00', // Yellow button
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minWidth: 200,
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  currentWeekButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffcc00', // Yellow button
  },
  currentWeekButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937', // Dark text on yellow
  },
});
