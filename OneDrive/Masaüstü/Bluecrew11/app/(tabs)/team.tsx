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
  RefreshControl,
} from 'react-native';
// Icons will be replaced with text for now
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Employee, SubContractor, Vendor } from '@/types';
import { UserService, FirebaseUser } from '@/services/userService';
import { SubContractorService } from '@/services/subContractorService';
import { VendorService } from '@/services/vendorService';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HamburgerMenu from '@/components/HamburgerMenu';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';

export default function TeamScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'our-team' | 'sub-contractors' | 'vendors'>('our-team');
  
  // Our Team (PM, Sales, Office with positions)
  const [ourTeam, setOurTeam] = useState<Employee[]>([]);
  
  // Sub Contractors (Name, Phone, Email, Trade - info only)
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  
  // Vendors (Company Name, Rep Name, Phone, Email - info only)
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [itemToEdit, setItemToEdit] = useState<Employee | SubContractor | Vendor | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states for different types
  const [newOurTeamMember, setNewOurTeamMember] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'pm' as 'pm' | 'sales' | 'office' | 'admin',
    jobTitle: '', // CEO, Owner, Manager, etc.
    temporaryPassword: '',
  });
  
  const [newSubContractor, setNewSubContractor] = useState({
    name: '',
    phone: '',
    email: '',
    trade: '',
  });
  
  const [newVendor, setNewVendor] = useState({
    companyName: '',
    repName: '',
    phone: '',
    email: '',
  });

  // Edit form states
  const [editOurTeamMember, setEditOurTeamMember] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'pm' as 'pm' | 'sales' | 'office',
    jobTitle: '',
  });

  const [editSubContractor, setEditSubContractor] = useState({
    name: '',
    phone: '',
    email: '',
    trade: '',
  });

  const [editVendor, setEditVendor] = useState({
    companyName: '',
    repName: '',
    phone: '',
    email: '',
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load Our Team from Firebase
        const firebaseUsers = await UserService.getAllUsers();
        console.log('Firebase users loaded:', firebaseUsers);
        
        const ourTeamList: Employee[] = firebaseUsers
          .filter(user => user.role === 'admin' || user.role === 'pm' || user.role === 'sales' || user.role === 'office')
          .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
            position: user.role === 'admin' ? 'admin' as const : 
                     user.role === 'pm' ? 'pm' as const : 
                     user.role === 'office' ? 'office' as const : 'sales' as const,
            jobTitle: (user as any).jobTitle || (user.role === 'admin' ? 'CEO' : 
                     user.role === 'pm' ? 'Project Manager' : 
                     user.role === 'office' ? 'Office Manager' : 'Sales Representative'),
            profile_picture: user.profile_picture,
          created_at: user.created_at,
        }));
        
        setOurTeam(ourTeamList);
        
        // Load Sub Contractors from Firebase
        const firebaseSubContractors = await SubContractorService.getSubContractors();
        console.log('Firebase sub contractors loaded:', firebaseSubContractors);
        setSubContractors(firebaseSubContractors);
        
        // Load Vendors from Firebase
        const firebaseVendors = await VendorService.getVendors();
        console.log('Firebase vendors loaded:', firebaseVendors);
        setVendors(firebaseVendors);
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays on error instead of mock data
        setOurTeam([]);
        setSubContractors([]);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const onRefresh = async () => {
    if (Platform.OS !== 'web') {
      const { Haptics } = await import('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRefreshing(true);
    try {
      setLoading(true);
      
      // Load Our Team from Firebase
      const firebaseUsers = await UserService.getAllUsers();
      const ourTeamList: Employee[] = firebaseUsers
        .filter(user => user.role === 'admin' || user.role === 'pm' || user.role === 'sales')
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          position: user.role === 'admin' ? 'Administrator' : 
                   user.role === 'pm' ? 'pm' : 'sales',
          jobTitle: (user as any).jobTitle || (user.role === 'admin' ? 'CEO' : 
                   user.role === 'pm' ? 'Project Manager' : 'Sales Representative'),
          profile_picture: user.profile_picture,
          created_at: user.created_at,
        }));
      
      setOurTeam(ourTeamList);
      
      // Load Sub Contractors from Firebase
      const firebaseSubContractors = await SubContractorService.getSubContractors();
      setSubContractors(firebaseSubContractors);
      
      // Load Vendors from Firebase
      const firebaseVendors = await VendorService.getVendors();
      setVendors(firebaseVendors);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddItem = async () => {
    try {
      if (activeTab === 'our-team') {
        if (!newOurTeamMember.name || !newOurTeamMember.email || !newOurTeamMember.position || !newOurTeamMember.jobTitle) {
          Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

        if (!newOurTeamMember.temporaryPassword) {
          Alert.alert('Error', 'Please provide a temporary password');
          return;
        }

        const tempPassword = newOurTeamMember.temporaryPassword || generateTemporaryPassword();
        
        try {
          // Save current admin user email and password before creating new user
          const currentUser = auth.currentUser;
          const currentUserEmail = currentUser?.email;
          
          // Try to get admin password from AsyncStorage (if remember me was used)
          let adminPassword: string | null = null;
          try {
            const savedEmail = await AsyncStorage.getItem('saved_email');
            const savedPassword = await AsyncStorage.getItem('saved_password');
            const rememberMe = await AsyncStorage.getItem('remember_me');
            
            // If remember me is active and email matches, use saved password
            if (rememberMe === 'true' && savedEmail === currentUserEmail && savedPassword) {
              adminPassword = savedPassword;
            }
          } catch (error) {
            console.log('Could not retrieve admin password from storage:', error);
          }
          
          // If we don't have admin password, we can't restore session
          // But we'll still create the user and let admin know they need to login again
          if (!adminPassword) {
            console.log('Admin password not found in storage. Admin will need to login again after user creation.');
          }
          
          // Create Firebase Authentication user
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            newOurTeamMember.email, 
            tempPassword
          );

          // Map position to role
          // SECURITY: Only admins can create admin accounts
          let role: 'admin' | 'pm' | 'client' | 'sales' | 'office';
          if (newOurTeamMember.position === 'admin') {
            if (userRole !== 'admin') {
              Alert.alert('Error', 'Only administrators can create admin accounts');
              return;
            }
            role = 'admin';
          } else if (newOurTeamMember.position === 'pm') {
            role = 'pm';
          } else if (newOurTeamMember.position === 'office') {
            role = 'office';
          } else {
            role = 'sales';
          }

          // Create user in Firestore using Firebase Auth UID IMMEDIATELY
          // This must happen synchronously to avoid race condition with onAuthStateChanged
          // Firestore doesn't accept undefined values, so we only include fields that have values
          const userData: any = {
            id: userCredential.user.uid, // Include ID in document data
          email: newOurTeamMember.email,
            name: newOurTeamMember.name,
            role: role,
      created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // Only add optional fields if they have values
          if (newOurTeamMember.phone) {
            userData.phone = newOurTeamMember.phone;
          }
          if (newOurTeamMember.jobTitle) {
            userData.jobTitle = newOurTeamMember.jobTitle;
          }
          // company is not needed for team members, so we don't include it

          // Create Firestore document with Firebase Auth UID
          // Do this immediately and wait for it to complete to prevent onAuthStateChanged from failing
          try {
            console.log('Creating Firestore document for user:', userCredential.user.uid, userData);
            await setDoc(doc(db, 'users', userCredential.user.uid), userData);
            console.log('User document created successfully in Firestore:', userCredential.user.uid);
            
            // Verify the document was created
            const docRef = doc(db, 'users', userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              console.log('Verified: User document exists in Firestore:', docSnap.data());
            } else {
              console.error('ERROR: User document was not created in Firestore!');
              Alert.alert('Error', 'User document was not created in database. Please try again.');
              throw new Error('User document creation failed - document does not exist');
            }
          } catch (firestoreError: any) {
            console.error('Error creating Firestore document:', firestoreError);
            console.error('Error code:', firestoreError.code);
            console.error('Error message:', firestoreError.message);
            // Delete the auth user if Firestore creation fails
            try {
              // Note: We can't delete auth users from client side, but we can at least log the error
              Alert.alert('Error', `Failed to create user profile: ${firestoreError.message || firestoreError.code || 'Unknown error'}`);
              throw firestoreError;
            } catch (error) {
              throw error;
            }
          }
          
          // Wait a bit to ensure Firestore write is fully propagated
          await new Promise(resolve => setTimeout(resolve, 500));

          // Note: createUserWithEmailAndPassword automatically signs in the new user
          // This means the admin session is lost. We need to restore it.
          if (adminPassword && currentUserEmail) {
            try {
              // Sign out the new user
              await signOut(auth);
              
              // Sign in the admin again to restore admin session
              await signInWithEmailAndPassword(auth, currentUserEmail, adminPassword);
              console.log('Admin session restored successfully');
            } catch (restoreError: any) {
              console.error('Error restoring admin session:', restoreError);
              // If restore fails, admin will need to login manually
              Alert.alert(
                'User Created',
                `Team member created successfully!\nTemporary password: ${tempPassword}\n\nNote: Please login again as admin.`
              );
            }
          } else {
            // Admin password not available, they'll need to login again
            console.log('Admin password not available. Admin will need to login again.');
          }

          // Reload data to show the new user
          const loadData = async () => {
            try {
              setLoading(true);
              
              // Load Our Team from Firebase
              const firebaseUsers = await UserService.getAllUsers();
              
              const ourTeamList: Employee[] = firebaseUsers
                .filter(user => user.role === 'admin' || user.role === 'pm' || user.role === 'sales')
                .map(user => ({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone || '',
                  position: user.role === 'admin' ? 'Administrator' : 
                           user.role === 'pm' ? 'pm' : 'sales',
                  jobTitle: (user as any).jobTitle || (user.role === 'admin' ? 'CEO' : 
                           user.role === 'pm' ? 'Project Manager' : 'Sales Representative'),
                  created_at: user.created_at,
                }));
              
              setOurTeam(ourTeamList);
            } catch (error) {
              console.error('Error loading data:', error);
            } finally {
              setLoading(false);
            }
          };

          await loadData();

        setNewOurTeamMember({ 
          name: '', 
          email: '', 
          phone: '', 
          position: 'pm',
          jobTitle: '',
          temporaryPassword: ''
        });
          setShowPassword(false);
          setShowAddModal(false);
        
        Alert.alert(
          'Success', 
          `Team member created successfully!\nTemporary password: ${tempPassword}\n\nPlease share this password with the user.`
        );
        } catch (error: any) {
          console.error('Error creating user:', error);
          if (error.code === 'auth/email-already-in-use') {
            Alert.alert('Error', 'This email is already registered. Please use a different email.');
          } else {
            Alert.alert('Error', `Failed to create user: ${error.message}`);
          }
        }
      } 
      else if (activeTab === 'sub-contractors') {
        if (!newSubContractor.name || !newSubContractor.email || !newSubContractor.phone || !newSubContractor.trade) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }

        try {
          const contractorId = await SubContractorService.addSubContractor({
            name: newSubContractor.name,
            email: newSubContractor.email,
            phone: newSubContractor.phone,
            trade: newSubContractor.trade,
            created_at: new Date().toISOString(),
          });

          const contractor: SubContractor = {
            id: contractorId,
            name: newSubContractor.name,
            email: newSubContractor.email,
            phone: newSubContractor.phone,
            trade: newSubContractor.trade,
            created_at: new Date().toISOString(),
          };

          setSubContractors(prev => [...prev, contractor]);
          setNewSubContractor({ 
            name: '', 
            email: '', 
            phone: '', 
            trade: ''
          });
          
          Alert.alert('Success', 'Sub contractor added successfully!');
        } catch (error) {
          console.error('Error adding sub contractor:', error);
          Alert.alert('Error', 'Failed to add sub contractor. Please try again.');
        }
      } 
      else if (activeTab === 'vendors') {
        if (!newVendor.companyName || !newVendor.repName || !newVendor.email || !newVendor.phone) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }

        try {
          const vendorId = await VendorService.addVendor({
            companyName: newVendor.companyName,
            repName: newVendor.repName,
            email: newVendor.email,
            phone: newVendor.phone,
            created_at: new Date().toISOString(),
          });

          const vendor: Vendor = {
            id: vendorId,
            companyName: newVendor.companyName,
            repName: newVendor.repName,
            email: newVendor.email,
            phone: newVendor.phone,
            created_at: new Date().toISOString(),
          };

          setVendors(prev => [...prev, vendor]);
          setNewVendor({ 
            companyName: '', 
            repName: '', 
            email: '', 
            phone: ''
          });
          
          Alert.alert('Success', 'Vendor added successfully!');
        } catch (error) {
          console.error('Error adding vendor:', error);
          Alert.alert('Error', 'Failed to add vendor. Please try again.');
        }
      }

    setShowAddModal(false);
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Error', 'Failed to create item');
    }
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditOurTeamMember({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position === 'Administrator' ? 'pm' : (employee.position === 'pm' ? 'pm' : 'sales') as 'pm' | 'sales' | 'office',
      jobTitle: employee.jobTitle || '',
    });
    setItemToEdit(employee);
    setShowEditModal(true);
  };

  const handleEditSubContractor = (contractor: SubContractor) => {
    setEditSubContractor({
      name: contractor.name,
      phone: contractor.phone,
      email: contractor.email,
      trade: contractor.trade,
    });
    setItemToEdit(contractor);
    setShowEditModal(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditVendor({
      companyName: vendor.companyName,
      repName: vendor.repName,
      phone: vendor.phone,
      email: vendor.email,
    });
    setItemToEdit(vendor);
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    try {
      if (!itemToEdit) return;

      if (activeTab === 'our-team' && 'id' in itemToEdit) {
        const employee = itemToEdit as Employee;
        if (!editOurTeamMember.name || !editOurTeamMember.email || !editOurTeamMember.position || !editOurTeamMember.jobTitle) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }

        try {
          // Update user in Firestore
          await UserService.updateUser(employee.id, {
            name: editOurTeamMember.name,
            email: editOurTeamMember.email,
            phone: editOurTeamMember.phone || undefined,
            jobTitle: editOurTeamMember.jobTitle,
            role: editOurTeamMember.position === 'pm' ? 'pm' : 'sales' as 'admin' | 'pm' | 'client' | 'sales',
          } as any);

          // Reload data
          const loadData = async () => {
            try {
              setLoading(true);
              const firebaseUsers = await UserService.getAllUsers();
              const ourTeamList: Employee[] = firebaseUsers
                .filter(user => user.role === 'admin' || user.role === 'pm' || user.role === 'sales')
                .map(user => ({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone || '',
                  position: user.role === 'admin' ? 'Administrator' : 
                           user.role === 'pm' ? 'pm' : 'sales',
                  jobTitle: (user as any).jobTitle || (user.role === 'admin' ? 'CEO' : 
                           user.role === 'pm' ? 'Project Manager' : 'Sales Representative'),
                  created_at: user.created_at,
                }));
              setOurTeam(ourTeamList);
            } catch (error) {
              console.error('Error loading data:', error);
            } finally {
              setLoading(false);
            }
          };

          await loadData();
          setShowEditModal(false);
          setItemToEdit(null);
          Alert.alert('Success', 'Team member updated successfully');
        } catch (error: any) {
          console.error('Error updating user:', error);
          Alert.alert('Error', `Failed to update user: ${error.message}`);
        }
      } else if (activeTab === 'sub-contractors' && 'id' in itemToEdit) {
        const contractor = itemToEdit as SubContractor;
        if (!editSubContractor.name || !editSubContractor.email || !editSubContractor.phone || !editSubContractor.trade) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }

        try {
          await SubContractorService.updateSubContractor(contractor.id, {
            name: editSubContractor.name,
            email: editSubContractor.email,
            phone: editSubContractor.phone,
            trade: editSubContractor.trade,
          });

          const loadData = async () => {
            try {
              setLoading(true);
              const contractors = await SubContractorService.getSubContractors();
              setSubContractors(contractors);
            } catch (error) {
              console.error('Error loading data:', error);
            } finally {
              setLoading(false);
            }
          };

          await loadData();
          setShowEditModal(false);
          setItemToEdit(null);
          Alert.alert('Success', 'Sub contractor updated successfully');
        } catch (error: any) {
          console.error('Error updating sub contractor:', error);
          Alert.alert('Error', `Failed to update sub contractor: ${error.message}`);
        }
      } else if (activeTab === 'vendors' && 'id' in itemToEdit) {
        const vendor = itemToEdit as Vendor;
        if (!editVendor.companyName || !editVendor.repName || !editVendor.email || !editVendor.phone) {
          Alert.alert('Error', 'Please fill in all required fields');
          return;
        }

        try {
          await VendorService.updateVendor(vendor.id, {
            companyName: editVendor.companyName,
            repName: editVendor.repName,
            email: editVendor.email,
            phone: editVendor.phone,
          });

          const loadData = async () => {
            try {
              setLoading(true);
              const vendorsList = await VendorService.getVendors();
              setVendors(vendorsList);
            } catch (error) {
              console.error('Error loading data:', error);
            } finally {
              setLoading(false);
            }
          };

          await loadData();
          setShowEditModal(false);
          setItemToEdit(null);
          Alert.alert('Success', 'Vendor updated successfully');
        } catch (error: any) {
          console.error('Error updating vendor:', error);
          Alert.alert('Error', `Failed to update vendor: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteSubContractor = (contractor: SubContractor) => {
    setItemToDelete(contractor);
    setShowDeleteModal(true);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setItemToDelete(vendor);
    setShowDeleteModal(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setItemToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
      if (activeTab === 'our-team') {
          // Delete from Firebase Firestore
          await UserService.deleteUser(itemToDelete.id);
          
          // Wait a moment for Firestore to propagate the deletion
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Reload team members from Firebase (force fresh fetch)
          const firebaseUsers = await UserService.getAllUsers();
          const ourTeamList: Employee[] = firebaseUsers
            .filter(user => user.role === 'admin' || user.role === 'pm' || user.role === 'sales' || user.role === 'office')
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              position: user.role === 'admin' ? 'admin' as const : 
                       user.role === 'pm' ? 'pm' as const : 
                       user.role === 'office' ? 'office' as const : 'sales' as const,
              jobTitle: (user as any).jobTitle || (user.role === 'admin' ? 'CEO' : 
                       user.role === 'pm' ? 'Project Manager' : 
                       user.role === 'office' ? 'Office Manager' : 'Sales Representative'),
              profile_picture: user.profile_picture,
              created_at: user.created_at,
            }));
          
          // Force update state
          setOurTeam(ourTeamList);
          
          setShowDeleteModal(false);
          setItemToDelete(null);
          
          Alert.alert(
            'Success', 
            'User deleted successfully from database.'
          );
      } else if (activeTab === 'sub-contractors') {
          // Delete from Firebase
          await SubContractorService.deleteSubContractor(itemToDelete.id);
          
          // Reload from Firebase
          const firebaseSubContractors = await SubContractorService.getSubContractors();
          setSubContractors(firebaseSubContractors);
          Alert.alert('Success', 'Sub-contractor deleted successfully');
      } else if (activeTab === 'vendors') {
          // Delete from Firebase
          await VendorService.deleteVendor(itemToDelete.id);
          
          // Reload from Firebase
          const firebaseVendors = await VendorService.getVendors();
          setVendors(firebaseVendors);
          Alert.alert('Success', 'Vendor deleted successfully');
      }
        
      setShowDeleteModal(false);
      setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting item:', error);
        Alert.alert('Error', 'Failed to delete. Please try again.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
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
        </View>
        {userRole === 'admin' && (
          <View style={styles.employeeActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditEmployee(employee)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteEmployee(employee)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
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
      </View>
    </View>
  );

  // Our Team Card Component
  const OurTeamCard = ({ member }: { member: Employee }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.avatar}>
          {member.profile_picture ? (
            <Image source={{ uri: member.profile_picture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{member.name}</Text>
          {member.position && (
          <Text style={styles.employeePosition}>{member.position}</Text>
          )}
          {member.jobTitle && (
            <Text style={styles.jobTitle}>{member.jobTitle}</Text>
          )}
        </View>
        {userRole === 'admin' && (
          <View style={styles.employeeActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditEmployee(member)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteEmployee(member)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.employeeDetails}>
        <View style={styles.contactRow}>
          <Text style={styles.iconText}>📧</Text>
          <Text style={styles.contactText}>{member.email || ''}</Text>
        </View>
        {member.phone ? (
          <View style={styles.contactRow}>
            <Text style={styles.iconText}>📞</Text>
            <Text style={styles.contactText}>{member.phone}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  // Sub Contractor Card Component
  const SubContractorCard = ({ contractor }: { contractor: SubContractor }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contractor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{contractor.name}</Text>
          <Text style={styles.employeePosition}>{contractor.trade}</Text>
        </View>
        {userRole === 'admin' && (
          <View style={styles.employeeActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditSubContractor(contractor)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteSubContractor(contractor)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.employeeDetails}>
        <View style={styles.contactRow}>
          <Text style={styles.iconText}>📧</Text>
          <Text style={styles.contactText}>{contractor.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.iconText}>📞</Text>
          <Text style={styles.contactText}>{contractor.phone}</Text>
        </View>
      </View>
    </View>
  );

  // Vendor Card Component
  const VendorCard = ({ vendor }: { vendor: Vendor }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {vendor.companyName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{vendor.companyName}</Text>
          <Text style={styles.employeePosition}>Rep: {vendor.repName}</Text>
        </View>
        {userRole === 'admin' && (
          <View style={styles.employeeActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditVendor(vendor)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteVendor(vendor)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.employeeDetails}>
        <View style={styles.contactRow}>
          <Text style={styles.iconText}>📧</Text>
          <Text style={styles.contactText}>{vendor.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.iconText}>📞</Text>
          <Text style={styles.contactText}>{vendor.phone}</Text>
        </View>
      </View>
    </View>
  );

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
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
        <View>
          <Text style={styles.title}>Team Management</Text>
          <Text style={styles.subtitle}>
            Manage your team, contractors, and vendors
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'our-team' && styles.activeTab]}
          onPress={() => setActiveTab('our-team')}
        >
          <Text style={[styles.tabText, activeTab === 'our-team' && styles.activeTabText]}>
            Our Team
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sub-contractors' && styles.activeTab]}
          onPress={() => setActiveTab('sub-contractors')}
        >
          <Text style={[styles.tabText, activeTab === 'sub-contractors' && styles.activeTabText]}>
            Sub Contractors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vendors' && styles.activeTab]}
          onPress={() => setActiveTab('vendors')}
        >
          <Text style={[styles.tabText, activeTab === 'vendors' && styles.activeTabText]}>
            Vendors
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        scrollEventThrottle={16}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#236ecf" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'our-team' && (
              <>
                {ourTeam.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No team members yet</Text>
                    <Text style={styles.emptyText}>
                      Add your first team member to get started
                    </Text>
                  </View>
                ) : (
                  ourTeam.map((member) => (
                    <OurTeamCard key={member.id} member={member} />
                  ))
                )}
              </>
            )}
            
            {activeTab === 'sub-contractors' && (
              <>
                {subContractors.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No sub contractors yet</Text>
                    <Text style={styles.emptyText}>
                      Add sub contractors to track their information
                    </Text>
              </View>
                ) : (
                  subContractors.map((contractor) => (
                    <SubContractorCard key={contractor.id} contractor={contractor} />
                  ))
                )}
              </>
            )}
            
            {activeTab === 'vendors' && (
              <>
                {vendors.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No vendors yet</Text>
                    <Text style={styles.emptyText}>
                      Add vendors to track their information
                    </Text>
                  </View>
                ) : (
                  vendors.map((vendor) => (
                    <VendorCard key={vendor.id} vendor={vendor} />
                  ))
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          accessibilityLabel={`Add ${activeTab === 'our-team' ? 'Team Member' : activeTab === 'sub-contractors' ? 'Sub Contractor' : 'Vendor'}`}
          accessibilityHint={`Add new ${activeTab === 'our-team' ? 'team member' : activeTab === 'sub-contractors' ? 'sub contractor' : 'vendor'}`}>
          <Text style={styles.fabIconText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeTab === 'our-team' ? 'Add Team Member' : 
               activeTab === 'sub-contractors' ? 'Add Sub Contractor' : 
               'Add Vendor'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setShowPassword(false);
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {activeTab === 'our-team' && (
              <>
            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                    value={newOurTeamMember.name}
                onChangeText={(text) =>
                      setNewOurTeamMember(prev => ({ ...prev, name: text }))
                }
                placeholder="e.g. Carlos Rodriguez"
              />
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Position *</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        newOurTeamMember.position === 'pm' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setNewOurTeamMember(prev => ({ ...prev, position: 'pm' }))}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        newOurTeamMember.position === 'pm' && styles.selectedRoleButtonText,
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        newOurTeamMember.position === 'sales' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setNewOurTeamMember(prev => ({ ...prev, position: 'sales' }))}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        newOurTeamMember.position === 'sales' && styles.selectedRoleButtonText,
                      ]}>
                        SALES
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        newOurTeamMember.position === 'office' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setNewOurTeamMember(prev => ({ ...prev, position: 'office' }))}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        newOurTeamMember.position === 'office' && styles.selectedRoleButtonText,
                      ]}>
                        OFFICE
                      </Text>
                    </TouchableOpacity>
                    {/* Only admins can create admin accounts */}
                    {userRole === 'admin' && (
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          newOurTeamMember.position === 'admin' && styles.selectedRoleButton,
                        ]}
                        onPress={() => setNewOurTeamMember(prev => ({ ...prev, position: 'admin' }))}
                      >
                        <Text style={[
                          styles.roleButtonText,
                          newOurTeamMember.position === 'admin' && styles.selectedRoleButtonText,
                        ]}>
                          ADMIN
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                    value={newOurTeamMember.jobTitle}
                onChangeText={(text) =>
                      setNewOurTeamMember(prev => ({ ...prev, jobTitle: text }))
                }
                    placeholder="e.g. CEO, Owner, Manager, Supervisor"
              />
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                    value={newOurTeamMember.email}
                onChangeText={(text) =>
                      setNewOurTeamMember(prev => ({ ...prev, email: text }))
                }
                placeholder="e.g. carlos@bluecrewcontractors.com"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                    value={newOurTeamMember.phone}
                onChangeText={(text) =>
                      setNewOurTeamMember(prev => ({ ...prev, phone: text }))
                }
                placeholder="e.g. +1 305 123 4567"
                keyboardType="phone-pad"
              />
            </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Temporary Password *</Text>
                  <View style={styles.passwordInputContainer}>
                  <TextInput
                      style={[styles.input, styles.passwordInput]}
                    value={newOurTeamMember.temporaryPassword}
                    onChangeText={(text) =>
                      setNewOurTeamMember(prev => ({ ...prev, temporaryPassword: text }))
                    }
                    placeholder="Enter temporary password"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6b7280" />
                      ) : (
                        <Eye size={20} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {newOurTeamMember.temporaryPassword.length > 0 && newOurTeamMember.temporaryPassword.length < 6 && (
                    <Text style={styles.passwordWarning}>
                      Password must be at least 6 characters
                    </Text>
                  )}
                  <TouchableOpacity 
                    style={styles.generatePasswordButton}
                    onPress={() => setNewOurTeamMember(prev => ({ 
                      ...prev, 
                      temporaryPassword: generateTemporaryPassword() 
                    }))}
                  >
                    <Text style={styles.generatePasswordText}>Generate Random Password</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'sub-contractors' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubContractor.name}
                    onChangeText={(text) =>
                      setNewSubContractor(prev => ({ ...prev, name: text }))
                    }
                    placeholder="e.g. John Smith"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Trade *</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubContractor.trade}
                    onChangeText={(text) =>
                      setNewSubContractor(prev => ({ ...prev, trade: text }))
                    }
                    placeholder="e.g. Plumbing, Electrician, HVAC"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubContractor.email}
                    onChangeText={(text) =>
                      setNewSubContractor(prev => ({ ...prev, email: text }))
                    }
                    placeholder="e.g. john@example.com"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubContractor.phone}
                    onChangeText={(text) =>
                      setNewSubContractor(prev => ({ ...prev, phone: text }))
                    }
                    placeholder="e.g. +1 305 123 4567"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            {activeTab === 'vendors' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.companyName}
                    onChangeText={(text) =>
                      setNewVendor(prev => ({ ...prev, companyName: text }))
                    }
                    placeholder="e.g. ABC Supply Co."
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Representative Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.repName}
                    onChangeText={(text) =>
                      setNewVendor(prev => ({ ...prev, repName: text }))
                    }
                    placeholder="e.g. Sarah Johnson"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.email}
                    onChangeText={(text) =>
                      setNewVendor(prev => ({ ...prev, email: text }))
                    }
                    placeholder="e.g. sarah@abcsupply.com"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVendor.phone}
                    onChangeText={(text) =>
                      setNewVendor(prev => ({ ...prev, phone: text }))
                    }
                    placeholder="e.g. +1 305 123 4567"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
              <Text style={styles.submitButtonText}>
                {activeTab === 'our-team' ? 'Add Team Member' : 
                 activeTab === 'sub-contractors' ? 'Add Sub Contractor' : 
                 'Add Vendor'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeTab === 'our-team' ? 'Edit Team Member' : 
               activeTab === 'sub-contractors' ? 'Edit Sub Contractor' : 
               'Edit Vendor'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowEditModal(false);
                setItemToEdit(null);
              }}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {activeTab === 'our-team' && (
              <>
            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                    value={editOurTeamMember.name}
                onChangeText={(text) =>
                      setEditOurTeamMember(prev => ({ ...prev, name: text }))
                }
                placeholder="e.g. Carlos Rodriguez"
              />
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                    value={editOurTeamMember.email}
                onChangeText={(text) =>
                      setEditOurTeamMember(prev => ({ ...prev, email: text }))
                }
                placeholder="e.g. carlos@example.com"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Position *</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        editOurTeamMember.position === 'pm' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setEditOurTeamMember(prev => ({ ...prev, position: 'pm' }))}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        editOurTeamMember.position === 'pm' && styles.selectedRoleButtonText,
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        editOurTeamMember.position === 'sales' && styles.selectedRoleButton,
                      ]}
                      onPress={() => setEditOurTeamMember(prev => ({ ...prev, position: 'sales' }))}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        editOurTeamMember.position === 'sales' && styles.selectedRoleButtonText,
                      ]}>
                        SALES
                      </Text>
                    </TouchableOpacity>
                  </View>
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                    value={editOurTeamMember.jobTitle}
                onChangeText={(text) =>
                      setEditOurTeamMember(prev => ({ ...prev, jobTitle: text }))
                }
                placeholder="e.g. Project Manager, Sales Representative"
              />
            </View>

            <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                    value={editOurTeamMember.phone}
                onChangeText={(text) =>
                      setEditOurTeamMember(prev => ({ ...prev, phone: text }))
                }
                placeholder="e.g. +1 305 123 4567"
                keyboardType="phone-pad"
              />
            </View>
              </>
            )}

            {activeTab === 'sub-contractors' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={editSubContractor.name}
                    onChangeText={(text) =>
                      setEditSubContractor(prev => ({ ...prev, name: text }))
                    }
                    placeholder="e.g. John Smith"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={editSubContractor.phone}
                    onChangeText={(text) =>
                      setEditSubContractor(prev => ({ ...prev, phone: text }))
                    }
                    placeholder="e.g. +1 305 123 4567"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Trade *</Text>
                  <TextInput
                    style={styles.input}
                    value={editSubContractor.trade}
                    onChangeText={(text) =>
                      setEditSubContractor(prev => ({ ...prev, trade: text }))
                    }
                    placeholder="e.g. Plumbing, Electrician, HVAC"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={editSubContractor.email}
                    onChangeText={(text) =>
                      setEditSubContractor(prev => ({ ...prev, email: text }))
                    }
                    placeholder="e.g. john@example.com"
                    keyboardType="email-address"
                  />
                </View>
              </>
            )}

            {activeTab === 'vendors' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={editVendor.companyName}
                    onChangeText={(text) =>
                      setEditVendor(prev => ({ ...prev, companyName: text }))
                    }
                    placeholder="e.g. ABC Supply Co."
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Representative Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={editVendor.repName}
                    onChangeText={(text) =>
                      setEditVendor(prev => ({ ...prev, repName: text }))
                    }
                    placeholder="e.g. Sarah Johnson"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={editVendor.email}
                    onChangeText={(text) =>
                      setEditVendor(prev => ({ ...prev, email: text }))
                    }
                    placeholder="e.g. sarah@abcsupply.com"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    value={editVendor.phone}
                    onChangeText={(text) =>
                      setEditVendor(prev => ({ ...prev, phone: text }))
                    }
                    placeholder="e.g. +1 305 123 4567"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateItem}>
              <Text style={styles.submitButtonText}>
                {activeTab === 'our-team' ? 'Update Team Member' : 
                 activeTab === 'sub-contractors' ? 'Update Sub Contractor' : 
                 'Update Vendor'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={cancelDelete}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>{t('deleteConfirmTitle')}</Text>
            <Text style={styles.deleteMessage}>
              {t('deleteConfirmItem')}
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelDeleteText}>{t('cancelButton')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>{t('deleteButton')}</Text>
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
    backgroundColor: '#236ecf', // Blue background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af', // Darker blue header
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
    color: '#ffcc00', // Yellow text
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalCloseButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  deleteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 24,
    color: '#ef4444',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffcc00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeTabText: {
    color: '#1e40af',
  },
  jobTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
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
    backgroundColor: '#ffcc00', // Yellow like other pages
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
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  passwordWarning: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  selectedRoleButton: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  selectedRoleButtonText: {
    color: '#ffffff',
  },
  generatePasswordButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    alignItems: 'center',
  },
  generatePasswordText: {
    fontSize: 12,
    color: '#236ecf',
    fontWeight: '500',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#ffffff', // White text on blue background
    textAlign: 'center',
    lineHeight: 20,
  },
  iconText: {
    fontSize: 16,
    marginRight: 8,
  },
  fabIconText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});