import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectService } from '@/services/projectService';
import { ExpenseService } from '@/services/expenseService';
import { Project } from '@/types';
import HamburgerMenu from '@/components/HamburgerMenu';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, CreditCard } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface MonthlyReport {
  month: string;
  year: number;
  completedProjects: number;
  totalRevenue: number;
  totalGrossProfit: number;
  totalExpenses: number;
  netProfit: number;
  averageProjectValue: number;
}

export default function ReportsScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    return currentYear >= 2025 ? currentYear : 2025;
  });
  const [filterType, setFilterType] = useState<'project' | 'monthly' | 'yearly'>('monthly');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isMobile, setIsMobile] = useState(false);
  
  // Default gross profit rate (can be configured per project later)
  const DEFAULT_GROSS_PROFIT_RATE = 28.5;

  useEffect(() => {
    if (userRole === 'admin') {
      loadReports();
    }
  }, [userRole, selectedYear, filterType]);

  // Set view mode based on platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      setViewMode('table');
    } else {
      setViewMode('card');
    }
  }, []);

  // Mobile detection
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setIsMobile(true);
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const isMobileWidth = window.innerWidth <= 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const mobile = isMobileWidth || isMobileUA;
      setIsMobile(mobile);
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

  const loadReports = async () => {
    try {
      setLoading(true);
      const projects = await ProjectService.getProjects();
      const expenses = await ExpenseService.getExpenses();
      
      let reportData: MonthlyReport[] = [];

      // Calculate profit for a project based on work titles
      const calculateProjectProfit = (project: Project) => {
        if (!project.steps || project.steps.length === 0) {
          return {
            totalRevenue: project.total_budget || 0,
            totalGrossProfit: 0,
            totalExpenses: 0,
            netProfit: 0,
          };
        }

        let totalRevenue = 0;
        let totalGrossProfit = 0;
        let totalExpenses = 0;

        // Get work titles (parent steps only)
        const workTitles = project.steps.filter(step => step.step_type === 'parent');
        
        // Sum ALL expenses for this project (including "All Project" / unassigned-to-step expenses)
        // ExpenseService.getExpenses() can include office expenses without project_id; we exclude those here.
        const projectExpenseTotal = expenses
          .filter(expense => expense.project_id === project.id)
          .reduce((sum, exp) => sum + exp.amount, 0);
        
        // Sum subcontractor costs from work titles
        const subcontractorTotal = workTitles.reduce((sum, wt) => sum + (wt.sub_contractor_price || 0), 0);
        
        workTitles.forEach(workTitle => {
          // Client payment for this work title
          const clientPayment = workTitle.price || 0;
          totalRevenue += clientPayment;

          // Company Profit % for this work title (step override > project default)
          const companyProfitRate = (workTitle as any).profit_rate ?? project.gross_profit_rate ?? DEFAULT_GROSS_PROFIT_RATE;
          const pmRate = Math.max(0, Math.min(100, 100 - companyProfitRate));
          const pmBudget = (clientPayment * pmRate) / 100;
          totalGrossProfit += pmBudget;
        });

        // Expenses shown in Reports should match the Expenses page totals for the project,
        // plus subcontractor costs recorded on work titles.
        totalExpenses = projectExpenseTotal + subcontractorTotal;
        const netProfit = totalGrossProfit - totalExpenses;

        return {
          totalRevenue,
          totalGrossProfit,
          totalExpenses,
          netProfit,
        };
      };

      if (filterType === 'project') {
        // Project-based report: Show all projects individually (not just completed)
        const allProjects = projects.filter(project => {
          // Filter by year based on created_at or deadline
          const projectDate = project.deadline ? new Date(project.deadline) : new Date(project.created_at);
          return projectDate.getFullYear() === selectedYear;
        });

        // Group expenses by project
        const projectExpenses: { [projectId: string]: number } = {};
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate.getFullYear() === selectedYear && expense.project_id) {
            if (!projectExpenses[expense.project_id]) {
              projectExpenses[expense.project_id] = 0;
            }
            projectExpenses[expense.project_id] += expense.amount;
          }
        });

        // Create report entry for each project
        allProjects.forEach(project => {
          const profitData = calculateProjectProfit(project);

          reportData.push({
            month: project.title, // Use project title as month field
            year: selectedYear,
            completedProjects: 1,
            totalRevenue: profitData.totalRevenue,
            totalGrossProfit: profitData.totalGrossProfit,
            totalExpenses: profitData.totalExpenses,
            netProfit: profitData.netProfit,
            averageProjectValue: profitData.totalRevenue,
          });
        });
      } else if (filterType === 'yearly') {
        // Yearly report: Aggregate all data for the year (all projects, not just completed)
        const allProjects = projects.filter(project => {
          const projectDate = project.deadline ? new Date(project.deadline) : new Date(project.created_at);
          return projectDate.getFullYear() === selectedYear;
        });

        let totalRevenue = 0;
        let totalGrossProfit = 0;
        let totalExpenses = 0;

        allProjects.forEach(project => {
          const profitData = calculateProjectProfit(project);
          totalRevenue += profitData.totalRevenue;
          totalGrossProfit += profitData.totalGrossProfit;
          totalExpenses += profitData.totalExpenses;
        });

        const netProfit = totalGrossProfit - totalExpenses;
        const averageProjectValue = allProjects.length > 0 ? totalRevenue / allProjects.length : 0;

        reportData.push({
          month: `Year ${selectedYear}`,
          year: selectedYear,
          completedProjects: allProjects.length,
          totalRevenue,
          totalGrossProfit,
          totalExpenses,
          netProfit,
          averageProjectValue,
        });
      } else {
        // Monthly report (default) - all projects, not just completed
        const allProjects = projects.filter(project => {
          const projectDate = project.deadline ? new Date(project.deadline) : new Date(project.created_at);
          return projectDate.getFullYear() === selectedYear;
        });

        // Group by month
        const monthlyData: { [key: string]: Project[] } = {};
        allProjects.forEach(project => {
          const projectDate = project.deadline ? new Date(project.deadline) : new Date(project.created_at);
          const month = projectDate.getMonth();
          const monthKey = `${month}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          monthlyData[monthKey].push(project);
        });

        // Generate report data
        for (let month = 0; month < 12; month++) {
          const monthKey = `${month}`;
          const monthProjects = monthlyData[monthKey] || [];
          
          let totalRevenue = 0;
          let totalGrossProfit = 0;
          let totalExpenses = 0;

          monthProjects.forEach(project => {
            const profitData = calculateProjectProfit(project);
            totalRevenue += profitData.totalRevenue;
            totalGrossProfit += profitData.totalGrossProfit;
            totalExpenses += profitData.totalExpenses;
          });
          
          const netProfit = totalGrossProfit - totalExpenses;
          const averageProjectValue = monthProjects.length > 0 ? totalRevenue / monthProjects.length : 0;

          reportData.push({
            month: new Date(selectedYear, month).toLocaleDateString('en-US', { month: 'long' }),
            year: selectedYear,
            completedProjects: monthProjects.length,
            totalRevenue,
            totalGrossProfit,
            totalExpenses,
            netProfit,
            averageProjectValue,
          });
        }
      }

      setReports(reportData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const Haptics = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    await loadReports();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalStats = () => {
    const totalProjects = reports.reduce((sum, report) => sum + report.completedProjects, 0);
    const totalRevenue = reports.reduce((sum, report) => sum + report.totalRevenue, 0);
    const totalGrossProfit = reports.reduce((sum, report) => sum + report.totalGrossProfit, 0);
    const totalExpenses = reports.reduce((sum, report) => sum + report.totalExpenses, 0);
    const netProfit = reports.reduce((sum, report) => sum + report.netProfit, 0);
    const averageValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    return { totalProjects, totalRevenue, totalGrossProfit, totalExpenses, netProfit, averageValue };
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Start from 2025
    const startYear = 2025;
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  // Export functions
  const exportToCSV = () => {
    if (Platform.OS !== 'web') return;
    
    const headers = ['Month', 'Completed Projects', 'Total Revenue', 'Total Expenses', 'Gross Profit', 'Avg Project Value'];
    const rows = reports.map(report => [
      report.month,
      report.completedProjects.toString(),
      report.totalRevenue.toString(),
      report.totalExpenses.toFixed(2),
      report.totalGrossProfit.toFixed(2),
      report.averageProjectValue.toFixed(2),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get max revenue for chart scaling
  const getMaxRevenue = () => {
    return Math.max(...reports.map(r => r.totalRevenue), 1);
  };

  if (userRole !== 'admin') {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>{t('reports')}</Text>
                <Text style={styles.subtitle}>{t('projectCompletionAnalytics')}</Text>
              </View>
            </View>
          </View>
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>{t('noAccess')}</Text>
          </View>
        </View>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HamburgerMenu />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>{t('reports')}</Text>
                <Text style={styles.subtitle}>{t('projectCompletionAnalytics')}</Text>
              </View>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffcc00" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        </View>
      </>
    );
  }

  const totalStats = getTotalStats();
  const maxRevenue = getMaxRevenue();

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{t('reports')}</Text>
              <Text style={styles.subtitle}>{t('projectCompletionAnalytics')}</Text>
            </View>
            {Platform.OS === 'web' && !isMobile && userRole === 'admin' && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={exportToCSV}
              >
                <Download size={18} color="#1f2937" />
                <Text style={styles.exportButtonText}>{t('exportCSV')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

      {/* Export Button - Moved to content area for mobile */}
      {isMobile && userRole === 'admin' && (
        <View style={styles.contentActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={exportToCSV}
          >
            <Download size={18} color="#1f2937" />
            <Text style={styles.exportButtonText}>{t('exportCSV')}</Text>
          </TouchableOpacity>
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
        {/* Filters */}
        <View style={styles.controlsCard}>
          <View style={styles.controlBlock}>
            <Text style={styles.controlLabel}>Filter Type</Text>
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[styles.segmentItem, filterType === 'project' && styles.segmentItemActive]}
                onPress={() => setFilterType('project')}
              >
                <Text style={[styles.segmentText, filterType === 'project' && styles.segmentTextActive]}>
                  Project
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentItem, filterType === 'monthly' && styles.segmentItemActive]}
                onPress={() => setFilterType('monthly')}
              >
                <Text style={[styles.segmentText, filterType === 'monthly' && styles.segmentTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentItem, filterType === 'yearly' && styles.segmentItemActive]}
                onPress={() => setFilterType('yearly')}
              >
                <Text style={[styles.segmentText, filterType === 'yearly' && styles.segmentTextActive]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Year Selector */}
          {filterType !== 'yearly' && (
            <View style={styles.controlBlock}>
              <Text style={styles.controlLabel}>{t('selectYear')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.yearScrollContent}
              >
                {getYearOptions().map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.yearChip, selectedYear === year && styles.yearChipActive]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[styles.yearChipText, selectedYear === year && styles.yearChipTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Total Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <DollarSign size={24} color="#059669" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatCurrency(totalStats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>{t('totalRevenue')}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <CreditCard size={24} color="#ef4444" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatCurrency(totalStats.totalExpenses)}</Text>
              <Text style={styles.statLabel}>Total Expenses</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={24} color="#10b981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatCurrency(totalStats.totalGrossProfit)}</Text>
              <Text style={styles.statLabel}>{t('grossProfit')}</Text>
            </View>
          </View>
        </View>

        {/* Monthly Breakdown */}
        <View style={styles.monthlyContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('monthlyBreakdown')} - {selectedYear}</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('loadingReports')}</Text>
            </View>
          ) : Platform.OS === 'web' && viewMode === 'table' ? (
            /* Web Table View */
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>{t('month') || 'Month'}</Text>
                <Text style={styles.tableHeaderText}>{t('projects')}</Text>
                <Text style={styles.tableHeaderText}>{t('totalRevenue')}</Text>
                <Text style={styles.tableHeaderText}>Total Expenses</Text>
                <Text style={styles.tableHeaderText}>{t('grossProfit')}</Text>
                <Text style={styles.tableHeaderText}>Avg Project</Text>
                {Platform.OS === 'web' && (
                  <Text style={styles.tableHeaderText}>Chart</Text>
                )}
              </View>
              {reports.map((report, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{report.month}</Text>
                  <Text style={styles.tableCell}>{report.completedProjects}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(report.totalRevenue)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(report.totalExpenses)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(report.totalGrossProfit)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(report.averageProjectValue)}</Text>
                  {Platform.OS === 'web' && (
                    <View style={styles.chartCell}>
                      <View style={styles.chartBarContainer}>
                        <View 
                          style={[
                            styles.chartBar,
                            { 
                              width: `${(report.totalRevenue / maxRevenue) * 100}%`,
                              backgroundColor: report.completedProjects > 0 ? '#22c55e' : '#e5e7eb'
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            /* Mobile Card View */
            <View style={styles.monthlyList}>
              {reports.map((report, index) => (
                <View key={index} style={styles.monthlyCard}>
                  <View style={styles.monthlyHeader}>
                    <View style={styles.monthInfo}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.monthName}>{report.month}</Text>
                    </View>
                    <Text style={styles.monthProjects}>
                      {report.completedProjects} project{report.completedProjects !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.monthlyStats}>
                    <View style={styles.monthlyStat}>
                      <Text style={styles.monthlyStatValue}>
                        {formatCurrency(report.totalRevenue)}
                      </Text>
                      <Text style={styles.monthlyStatLabel}>Revenue</Text>
                    </View>
                    
                    <View style={styles.monthlyStat}>
                      <Text style={styles.monthlyStatValue}>
                        {formatCurrency(report.totalExpenses)}
                      </Text>
                      <Text style={styles.monthlyStatLabel}>Expenses</Text>
                    </View>
                    
                    <View style={styles.monthlyStat}>
                      <Text style={styles.monthlyStatValue}>
                        {formatCurrency(report.totalGrossProfit)}
                      </Text>
                      <Text style={styles.monthlyStatLabel}>{t('grossProfit')}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
  titleContainer: {
    flex: 1,
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
  content: {
    flex: 1,
    padding: 20,
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  controlBlock: {
    marginBottom: 14,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  segmentItemActive: {
    backgroundColor: '#236ecf',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  yearScrollContent: {
    paddingRight: 6,
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearChipActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  yearChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  yearChipTextActive: {
    color: '#ffffff',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  accessDeniedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffcc00', // Yellow text like other pages
    textAlign: 'center',
  },
  yearSelector: {
    marginBottom: 20,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  yearButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  selectedYearButton: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedYearButtonText: {
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    minWidth: Platform.OS === 'web' ? 200 : 140,
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? 'auto' : '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  monthlyContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  // (removed duplicate loadingContainer/loadingText; keep the blue-background versions above)
  monthlyList: {
    gap: 12,
  },
  monthlyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  monthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  monthProjects: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  monthlyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthlyStat: {
    minWidth: 80,
    flexGrow: 1,
    flexBasis: '30%',
  },
  monthlyStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  monthlyStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Web-specific styles
  contentActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00', // Yellow button like other pages
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  exportButtonText: {
    color: '#1f2937', // Dark text on yellow
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    alignItems: 'center',
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
  chartCell: {
    flex: 1,
    paddingLeft: 8,
  },
  chartBarContainer: {
    height: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  chartBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
});



