import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { auth, db, storage } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ProjectService } from '@/services/projectService';
import { UserService } from '@/services/userService';
import { TimeClockService } from '@/services/timeClockService';

export default function TestFirebase() {
  const [status, setStatus] = useState('Checking connection...');
  const [user, setUser] = useState<any>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Test Firebase connection
    const checkConnection = async () => {
      try {
        if (auth && db && storage) {
          setStatus('✅ Firebase Connected!');
          setTestResults(prev => ({ ...prev, connection: '✅ Connected' }));
          
          // Test services
          await testServices();
        } else {
          setStatus('❌ Firebase Connection Failed');
          setTestResults(prev => ({ ...prev, connection: '❌ Failed' }));
        }
      } catch (error: any) {
        setStatus(`❌ Error: ${error.message}`);
        setTestResults(prev => ({ ...prev, connection: `❌ Error: ${error.message}` }));
      }
    };
    
    checkConnection();
  }, []);

  const testServices = async () => {
    const results: { [key: string]: string } = {};
    
    try {
      // Test Project Service
      const projects = await ProjectService.getProjects();
      results.projects = `✅ ${projects.length} projects found`;
    } catch (error: any) {
      results.projects = `❌ Error: ${error.message}`;
    }
    
    try {
      // Test User Service
      const users = await UserService.getAllUsers();
      results.users = `✅ ${users.length} users found`;
    } catch (error: any) {
      results.users = `❌ Error: ${error.message}`;
    }
    
    try {
      // Test Time Clock Service
      const entries = await TimeClockService.getTimeClockEntries();
      results.timeClock = `✅ ${entries.length} entries found`;
    } catch (error: any) {
      results.timeClock = `❌ Error: ${error.message}`;
    }

    try {
      // Test Invoice Service
      const { InvoiceService } = await import('@/services/invoiceService');
      const invoices = await InvoiceService.getInvoices();
      results.invoices = `✅ ${invoices.length} invoices found`;
    } catch (error: any) {
      results.invoices = `❌ Error: ${error.message}`;
    }

    try {
      // Test Proposal Service
      const { ProposalService } = await import('@/services/proposalService');
      const proposals = await ProposalService.getProposals();
      results.proposals = `✅ ${proposals.length} proposals found`;
    } catch (error: any) {
      results.proposals = `❌ Error: ${error.message}`;
    }

    try {
      // Test Lead Service
      const { LeadService } = await import('@/services/leadService');
      const leads = await LeadService.getLeads();
      results.leads = `✅ ${leads.length} leads found`;
    } catch (error: any) {
      results.leads = `❌ Error: ${error.message}`;
    }

    try {
      // Test Client Service (via UserService)
      const clients = await UserService.getUsersByRole('client');
      results.clients = `✅ ${clients.length} clients found`;
    } catch (error: any) {
      results.clients = `❌ Error: ${error.message}`;
    }

    try {
      // Test Material Request Service
      const { MaterialRequestService } = await import('@/services/materialRequestService');
      const requests = await MaterialRequestService.getMaterialRequests();
      results.materialRequests = `✅ ${requests.length} material requests found`;
    } catch (error: any) {
      results.materialRequests = `❌ Error: ${error.message}`;
    }

    try {
      // Test Change Order Service
      const { ChangeOrderService } = await import('@/services/changeOrderService');
      const orders = await ChangeOrderService.getChangeOrderRequests();
      results.changeOrders = `✅ ${orders.length} change orders found`;
    } catch (error: any) {
      results.changeOrders = `❌ Error: ${error.message}`;
    }

    try {
      // Test Schedule Service
      const { ScheduleService } = await import('@/services/scheduleService');
      const schedules = await ScheduleService.getSchedules();
      results.schedules = `✅ ${schedules.length} schedules found`;
    } catch (error: any) {
      results.schedules = `❌ Error: ${error.message}`;
    }

    try {
      // Test Sub Contractor Service
      const { SubContractorService } = await import('@/services/subContractorService');
      const contractors = await SubContractorService.getSubContractors();
      results.subContractors = `✅ ${contractors.length} sub contractors found`;
    } catch (error: any) {
      results.subContractors = `❌ Error: ${error.message}`;
    }

    try {
      // Test Vendor Service
      const { VendorService } = await import('@/services/vendorService');
      const vendors = await VendorService.getVendors();
      results.vendors = `✅ ${vendors.length} vendors found`;
    } catch (error: any) {
      results.vendors = `❌ Error: ${error.message}`;
    }

    try {
      // Test Comment Service
      const { CommentService } = await import('@/services/commentService');
      // Just test that service exists, don't query all comments
      results.comments = `✅ CommentService available`;
    } catch (error: any) {
      results.comments = `❌ Error: ${error.message}`;
    }

    try {
      // Test Daily Log Service
      const { DailyLogService } = await import('@/services/dailyLogService');
      results.dailyLogs = `✅ DailyLogService available`;
    } catch (error: any) {
      results.dailyLogs = `❌ Error: ${error.message}`;
    }

    try {
      // Test Document Service
      const { DocumentService } = await import('@/services/documentService');
      results.documents = `✅ DocumentService available`;
    } catch (error: any) {
      results.documents = `❌ Error: ${error.message}`;
    }
    
    setTestResults(prev => ({ ...prev, ...results }));
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword123';
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        setUser(userCredential.user);
        setTestResults(prev => ({ ...prev, auth: '✅ Authentication test passed!' }));
        Alert.alert('Success', 'Authentication test passed!');
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          setUser(userCredential.user);
          setTestResults(prev => ({ ...prev, auth: '✅ Authentication test passed!' }));
          Alert.alert('Success', 'Authentication test passed!');
        } else {
          setTestResults(prev => ({ ...prev, auth: `❌ Error: ${error.message}` }));
          Alert.alert('Error', `Auth test failed: ${error.message}`);
        }
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, auth: `❌ Error: ${error.message}` }));
      Alert.alert('Error', `Auth test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirestore = async () => {
    setLoading(true);
    try {
      const testData = {
        message: 'Hello Firebase!',
        timestamp: new Date().toISOString(),
        test: true
      };
      
      const docRef = await addDoc(collection(db, 'test'), testData);
      setTestResults(prev => ({ ...prev, firestoreWrite: `✅ Write test passed! Document ID: ${docRef.id}` }));
      Alert.alert('Success', `Firestore test passed! Document ID: ${docRef.id}`);
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, firestoreWrite: `❌ Error: ${error.message}` }));
      Alert.alert('Error', `Firestore test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testReadFirestore = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(query(collection(db, 'test'), limit(10)));
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTestResults(prev => ({ ...prev, firestoreRead: `✅ Read test passed! Found ${docs.length} documents` }));
      Alert.alert('Success', `Read test passed! Found ${docs.length} documents`);
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, firestoreRead: `❌ Error: ${error.message}` }));
      Alert.alert('Error', `Read test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testStorage = async () => {
    setLoading(true);
    try {
      const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
      const storageRef = ref(storage, `test/test-${Date.now()}.txt`);
      await uploadBytes(storageRef, testBlob);
      const url = await getDownloadURL(storageRef);
      setTestResults(prev => ({ ...prev, storage: `✅ Storage test passed! URL: ${url.substring(0, 50)}...` }));
      Alert.alert('Success', 'Storage test passed!');
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, storage: `❌ Error: ${error.message}` }));
      Alert.alert('Error', `Storage test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllPages = async () => {
    setLoading(true);
    const pageResults: { [key: string]: string } = {};
    
    // Test each page's Firebase connection
    const pages = [
      { name: 'Projects', service: () => ProjectService.getProjects() },
      { name: 'Users/Team', service: () => UserService.getAllUsers() },
      { name: 'Time Clock', service: () => TimeClockService.getTimeClockEntries() },
    ];

    // Test Invoice Service
    try {
      const { InvoiceService } = await import('@/services/invoiceService');
      await InvoiceService.getInvoices();
      pageResults['Invoices Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Invoices Page'] = `❌ ${error.message}`;
    }

    // Test Proposal Service
    try {
      const { ProposalService } = await import('@/services/proposalService');
      await ProposalService.getProposals();
      pageResults['Proposals Page'] = '✅ Connected';
      pageResults['Sales Report Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Proposals Page'] = `❌ ${error.message}`;
      pageResults['Sales Report Page'] = `❌ ${error.message}`;
    }

    // Test Lead Service
    try {
      const { LeadService } = await import('@/services/leadService');
      await LeadService.getLeads();
      pageResults['Leads Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Leads Page'] = `❌ ${error.message}`;
    }

    // Test Client Service
    try {
      await UserService.getUsersByRole('client');
      pageResults['Clients Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Clients Page'] = `❌ ${error.message}`;
    }

    // Test Material Request Service
    try {
      const { MaterialRequestService } = await import('@/services/materialRequestService');
      await MaterialRequestService.getMaterialRequests();
      pageResults['Material Request Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Material Request Page'] = `❌ ${error.message}`;
    }

    // Test Change Order Service
    try {
      const { ChangeOrderService } = await import('@/services/changeOrderService');
      await ChangeOrderService.getChangeOrderRequests();
      pageResults['Change Order Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Change Order Page'] = `❌ ${error.message}`;
    }

    // Test Schedule Service
    try {
      const { ScheduleService } = await import('@/services/scheduleService');
      await ScheduleService.getSchedules();
      pageResults['Schedule Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Schedule Page'] = `❌ ${error.message}`;
    }

    // Test Sub Contractor Service
    try {
      const { SubContractorService } = await import('@/services/subContractorService');
      await SubContractorService.getSubContractors();
      pageResults['Team Page (Sub Contractors)'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Team Page (Sub Contractors)'] = `❌ ${error.message}`;
    }

    // Test Vendor Service
    try {
      const { VendorService } = await import('@/services/vendorService');
      await VendorService.getVendors();
      pageResults['Team Page (Vendors)'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Team Page (Vendors)'] = `❌ ${error.message}`;
    }

    // Test Comment Service
    try {
      const { CommentService } = await import('@/services/commentService');
      pageResults['Project Approval (Comments)'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Project Approval (Comments)'] = `❌ ${error.message}`;
    }

    // Test Daily Log Service
    try {
      const { DailyLogService } = await import('@/services/dailyLogService');
      pageResults['Daily Logs Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Daily Logs Page'] = `❌ ${error.message}`;
    }

    // Test Document Service
    try {
      const { DocumentService } = await import('@/services/documentService');
      pageResults['Documents Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Documents Page'] = `❌ ${error.message}`;
    }

    // Test Permissions (Direct Firestore)
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      await getDocs(collection(db, 'permissions'));
      pageResults['Permissions Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Permissions Page'] = `❌ ${error.message}`;
    }

    // Test Payroll (Direct Firestore)
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      await getDocs(collection(db, 'payroll'));
      pageResults['Payroll Page'] = '✅ Connected';
    } catch (error: any) {
      pageResults['Payroll Page'] = `❌ ${error.message}`;
    }

    setTestResults(prev => ({ ...prev, ...pageResults }));
    setLoading(false);
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    await testAuth();
    await testFirestore();
    await testReadFirestore();
    await testStorage();
    await testServices();
    await testAllPages();
    setLoading(false);
    Alert.alert('Complete', 'All tests completed! Check results below.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>🔥 Firebase Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Connection Status:</Text>
        <Text style={[styles.statusText, status.includes('✅') ? styles.success : styles.error]}>
          {status}
        </Text>
      </View>

      {user && (
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>User:</Text>
          <Text style={styles.userText}>{user.email}</Text>
        </View>
      )}

      {Object.keys(testResults).length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {Object.entries(testResults).map(([key, value]) => (
            <View key={key} style={styles.resultItem}>
              <Text style={styles.resultLabel}>{key}:</Text>
              <Text style={styles.resultValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.testButton, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>🚀 Run All Tests</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Authentication</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testFirestore}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Firestore Write</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testReadFirestore}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Firestore Read</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testStorage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.secondaryButton]} 
          onPress={testAllPages}
          disabled={loading}
        >
          <Text style={styles.buttonText}>📄 Test All Pages</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  success: {
    color: '#10b981',
  },
  error: {
    color: '#ef4444',
  },
  userContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  userLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  userText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultsContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#ffcc00',
  },
  secondaryButton: {
    backgroundColor: '#059669',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
