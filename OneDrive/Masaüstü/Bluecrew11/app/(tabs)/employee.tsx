import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { 
  Users, 
  DollarSign,
  Edit,
  X,
  Save,
  User,
  ArrowLeft,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from '@/types';
import { UserService, FirebaseUser } from '@/services/userService';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EmployeeScreen() {
  const { userRole } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const from = typeof params.from === 'string' ? params.from : undefined;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dailyRate, setDailyRate] = useState<string>('');
  const [salary, setSalary] = useState<string>('');
  const [payType, setPayType] = useState<'daily' | 'salary'>('daily');
  const [saving, setSaving] = useState(false);

  // Load employees from Our Team (same data source as team.tsx)
  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Load Our Team from Firebase (same logic as team.tsx)
      const firebaseUsers = await UserService.getAllUsers();
      
      const ourTeamList: Employee[] = firebaseUsers
        .filter(user => user.role === 'admin' || user.role === 'pm' || user.role === 'sales' || user.role === 'office')
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          position: user.role === 'admin' ? 'Administrator' : 
                   user.role === 'pm' ? 'Project Manager' : 
                   user.role === 'sales' ? 'Sales' : 'Office',
          jobTitle: user.role === 'admin' ? 'CEO' : 
                   user.role === 'pm' ? 'Project Manager' : 
                   user.role === 'sales' ? 'Sales Representative' : 'Office Staff',
          profile_picture: user.profile_picture,
          created_at: user.created_at,
          daily_rate: (user as any).daily_rate || undefined, // Get daily_rate from user data
          salary: (user as any).salary || undefined,
          pay_type: ((user as any).pay_type as any) || undefined,
        }));
      
      setEmployees(ourTeamList);
    } catch (error) {
      console.error('Error loading employees:', error);
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEditDailyRate = (employee: Employee) => {
    setSelectedEmployee(employee);
    const existingPayType = employee.pay_type || (employee.salary ? 'salary' : 'daily');
    setPayType(existingPayType);
    setDailyRate(employee.daily_rate?.toString() || '');
    setSalary(employee.salary?.toString() || '');
    setShowEditModal(true);
  };

  const handleSaveDailyRate = async () => {
    if (!selectedEmployee) return;
    
    const rate = parseFloat(dailyRate);
    const salaryNum = parseFloat(salary);
    if (payType === 'daily') {
      if (dailyRate && (isNaN(rate) || rate < 0)) {
        Alert.alert('Invalid Input', 'Please enter a valid daily rate (0 or greater)');
        return;
      }
    } else {
      if (salary && (isNaN(salaryNum) || salaryNum < 0)) {
        Alert.alert('Invalid Input', 'Please enter a valid salary (0 or greater)');
        return;
      }
    }

    try {
      setSaving(true);
      
      // Update user in Firebase with pay settings (pay_type + either salary or daily_rate)
      await UserService.updateUser(selectedEmployee.id, {
        pay_type: payType as any,
        daily_rate: payType === 'daily' ? (dailyRate ? rate : undefined) : undefined,
        salary: payType === 'salary' ? (salary ? salaryNum : undefined) : undefined,
      } as any);
      
      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { 
              ...emp, 
              pay_type: payType,
              daily_rate: payType === 'daily' ? (dailyRate ? rate : undefined) : undefined,
              salary: payType === 'salary' ? (salary ? salaryNum : undefined) : undefined,
            }
          : emp
      ));
      
      Alert.alert('Success', 'Pay settings updated successfully');
      setShowEditModal(false);
      setSelectedEmployee(null);
      setDailyRate('');
      setSalary('');
    } catch (error) {
      console.error('Error saving daily rate:', error);
      Alert.alert('Error', 'Failed to save pay settings');
    } finally {
      setSaving(false);
    }
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.avatar}>
          {employee.profile_picture ? (
            <Image source={{ uri: employee.profile_picture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeePosition}>{employee.position}</Text>
          {employee.jobTitle && (
            <Text style={styles.jobTitle}>{employee.jobTitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.employeeDetails}>
        <View style={styles.contactRow}>
          <Text style={styles.iconText}>📧</Text>
          <Text style={styles.contactText}>{employee.email}</Text>
        </View>
        {employee.phone && (
          <View style={styles.contactRow}>
            <Text style={styles.iconText}>📞</Text>
            <Text style={styles.contactText}>{employee.phone}</Text>
          </View>
        )}
        <View style={styles.rateRow}>
          <View style={styles.rateInfo}>
            <DollarSign size={16} color="#236ecf" />
            <Text style={styles.rateLabel}>
              {employee.pay_type === 'salary' ? 'Salary:' : 'Daily Rate:'}
            </Text>
            <Text style={styles.rateValue}>
              {employee.pay_type === 'salary'
                ? (employee.salary ? `$${employee.salary.toFixed(2)}` : 'Not set')
                : (employee.daily_rate ? `$${employee.daily_rate.toFixed(2)}` : 'Not set')}
            </Text>
          </View>
          {userRole === 'admin' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditDailyRate(employee)}
            >
              <Edit size={16} color="#236ecf" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <>
        <HamburgerMenu />
        {Platform.OS === 'web' && <TopNavigationBar />}
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Employees</Text>
            <Text style={styles.subtitle}>Manage employee daily rates</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffcc00" />
            <Text style={styles.loadingText}>Loading employees...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <HamburgerMenu />
      {Platform.OS === 'web' && <TopNavigationBar />}
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (from === 'hr') {
                router.push('/hr');
                return;
              }
              if (router.canGoBack()) router.back();
              else router.push('/hr');
            }}
          >
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Employees</Text>
            <Text style={styles.subtitle}>Manage employee daily rates</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          {employees.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#6b7280" />
              <Text style={styles.emptyText}>No employees found</Text>
            </View>
          ) : (
            <>
              <Text style={styles.matchingText}>
                {employees.length} {employees.length === 1 ? 'Employee' : 'Employees'}
              </Text>
              {employees.map(employee => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </>
          )}
        </ScrollView>

        {/* Edit Daily Rate Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Pay</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                    setDailyRate('');
                    setSalary('');
                  }}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                {selectedEmployee && (
                  <>
                    <View style={styles.employeeInfoSection}>
                      <Text style={styles.employeeInfoName}>{selectedEmployee.name}</Text>
                      <Text style={styles.employeeInfoPosition}>{selectedEmployee.position}</Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Pay Type</Text>
                      <View style={styles.payTypeRow}>
                        <TouchableOpacity
                          style={[styles.payTypeChip, payType === 'daily' && styles.payTypeChipActive]}
                          onPress={() => setPayType('daily')}
                        >
                          <Text style={[styles.payTypeChipText, payType === 'daily' && styles.payTypeChipTextActive]}>
                            Daily Rate
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.payTypeChip, payType === 'salary' && styles.payTypeChipActive]}
                          onPress={() => setPayType('salary')}
                        >
                          <Text style={[styles.payTypeChipText, payType === 'salary' && styles.payTypeChipTextActive]}>
                            Salary
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {payType === 'salary' ? 'Salary ($)' : 'Daily Rate ($)'}
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={payType === 'salary' ? salary : dailyRate}
                        onChangeText={payType === 'salary' ? setSalary : setDailyRate}
                        placeholder={payType === 'salary' ? 'Enter salary' : 'Enter daily rate'}
                        keyboardType="numeric"
                        placeholderTextColor="#9ca3af"
                      />
                      <Text style={styles.inputHint}>
                        Leave empty to remove {payType === 'salary' ? 'salary' : 'daily rate'}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                    setDailyRate('');
                    setSalary('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, saving && styles.disabledButton]}
                  onPress={handleSaveDailyRate}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Save size={16} color="#ffffff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    gap: 16,
  },
  backButton: {
    padding: 4,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
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
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  employeeCard: {
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
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  employeePosition: {
    fontSize: 14,
    color: '#236ecf',
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  employeeDetails: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconText: {
    fontSize: 16,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#236ecf',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    width: '90%',
    maxWidth: 400,
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
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  employeeInfoSection: {
    marginBottom: 20,
  },
  employeeInfoName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  employeeInfoPosition: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  payTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  payTypeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTypeChipActive: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  payTypeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  payTypeChipTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#236ecf',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});


