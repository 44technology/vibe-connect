import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { Plus, Mail, Phone, Briefcase } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from '@/types';

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    email: 'carlos@bluecrewcontractors.com',
    phone: '+1 305 123 4567',
    position: 'Site Supervisor',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Gonzalez',
    email: 'maria@bluecrewcontractors.com',
    phone: '+1 305 234 5678',
    position: 'Construction Engineer',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Jose Martinez',
    email: 'jose@bluecrewcontractors.com',
    phone: '+1 305 345 6789',
    position: 'Electrician',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export default function TeamScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      created_at: new Date().toISOString(),
    };

    setEmployees(prev => [...prev, employee]);
    setShowAddModal(false);
    setNewEmployee({ name: '', email: '', phone: '', position: '' });
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeePosition}>{employee.position}</Text>
        </View>
        {userRole === 'admin' && (
          <View style={styles.employeeActions}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.employeeDetails}>
        <View style={styles.contactRow}>
          <Mail size={16} color="#6b7280" />
          <Text style={styles.contactText}>{employee.email}</Text>
        </View>
        {employee.phone && (
          <View style={styles.contactRow}>
            <Phone size={16} color="#6b7280" />
            <Text style={styles.contactText}>{employee.phone}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('employees')}</Text>
          <Text style={styles.subtitle}>
            {employees.length} team members
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </ScrollView>

      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addEmployee')}</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('name')}</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.name}
                onChangeText={(text) =>
                  setNewEmployee(prev => ({ ...prev, name: text }))
                }
                placeholder="e.g. Carlos Rodriguez"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('position')}</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.position}
                onChangeText={(text) =>
                  setNewEmployee(prev => ({ ...prev, position: text }))
                }
                placeholder="e.g. Site Supervisor"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('email')}</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.email}
                onChangeText={(text) =>
                  setNewEmployee(prev => ({ ...prev, email: text }))
                }
                placeholder="e.g. carlos@bluecrewcontractors.com"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                value={newEmployee.phone}
                onChangeText={(text) =>
                  setNewEmployee(prev => ({ ...prev, phone: text }))
                }
                placeholder="e.g. +1 305 123 4567"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddEmployee}>
              <Text style={styles.submitButtonText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#236ecf20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
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
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 2,
  },
  employeePosition: {
    fontSize: 14,
    color: '#ffcc00',
    fontWeight: '600',
  },
  employeeDetails: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    color: '#236ecf',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#236ecf',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#236ecf',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#236ecf',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  employeeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#236ecf',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
});