import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Not connected');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Test Firebase connection
    if (auth && db) {
      setStatus('Firebase connected!');
    } else {
      setStatus('Firebase connection failed');
    }
  }, []);

  const testAuth = async () => {
    try {
      // Test authentication
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword123';
      
      // Try to create a test user
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      setUser(userCredential.user);
      Alert.alert('Success', 'Authentication test passed!');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Try to sign in instead
        try {
          const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          setUser(userCredential.user);
          Alert.alert('Success', 'Authentication test passed!');
        } catch (signInError: any) {
          Alert.alert('Error', `Sign in failed: ${signInError.message}`);
        }
      } else {
        Alert.alert('Error', `Auth test failed: ${error.message}`);
      }
    }
  };

  const testFirestore = async () => {
    try {
      // Test Firestore connection
      const testData = {
        message: 'Hello Firebase!',
        timestamp: new Date(),
        test: true
      };
      
      const docRef = await addDoc(collection(db, 'test'), testData);
      Alert.alert('Success', `Firestore test passed! Document ID: ${docRef.id}`);
    } catch (error: any) {
      Alert.alert('Error', `Firestore test failed: ${error.message}`);
    }
  };

  const testReadFirestore = async () => {
    try {
      // Test reading from Firestore
      const querySnapshot = await getDocs(collection(db, 'test'));
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      Alert.alert('Success', `Read test passed! Found ${docs.length} documents`);
    } catch (error: any) {
      Alert.alert('Error', `Read test failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusText, status.includes('connected') ? styles.success : styles.error]}>
          {status}
        </Text>
      </View>

      {user && (
        <View style={styles.userContainer}>
          <Text style={styles.userLabel}>User:</Text>
          <Text style={styles.userText}>{user.email}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.testButton} onPress={testAuth}>
          <Text style={styles.buttonText}>Test Authentication</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testFirestore}>
          <Text style={styles.buttonText}>Test Firestore Write</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testReadFirestore}>
          <Text style={styles.buttonText}>Test Firestore Read</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4e4a6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 8,
    marginBottom: 20,
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
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    backgroundColor: '#236ecf',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

