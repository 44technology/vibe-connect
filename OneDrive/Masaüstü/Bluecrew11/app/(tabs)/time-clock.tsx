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
  Image,
} from 'react-native';
// Icons will be replaced with text for now
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { TimeClockEntry, WeeklyTimeClock } from '@/types';
import { TimeClockService } from '@/services/timeClockService';
import { UserService } from '@/services/userService';
import HamburgerMenu from '@/components/HamburgerMenu';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function TimeClockScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const router = useRouter();
  const [timeEntries, setTimeEntries] = useState<TimeClockEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyTimeClock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<'clocked_in' | 'clocked_out'>('clocked_out');
  const [currentClockIn, setCurrentClockIn] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  
  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'pm' | 'sales' | 'office'>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [searchName, setSearchName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  // Temporary filter states for modal
  const [tempSelectedRole, setTempSelectedRole] = useState<'all' | 'pm' | 'sales' | 'office'>('all');
  const [tempSelectedWeek, setTempSelectedWeek] = useState<string>('');
  const [tempSearchName, setTempSearchName] = useState('');
  const [tempSelectedUserId, setTempSelectedUserId] = useState<string>('all');
  
  // Helper function to get local date string (YYYY-MM-DD) instead of UTC
  const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Current week calculation
  const getCurrentWeek = () => {
    const now = new Date();
    // Get local date components to avoid timezone issues
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate days to subtract to get to Monday
    // If Sunday (0), subtract 6 days to get last Monday
    // Otherwise subtract (dayOfWeek - 1) to get this week's Monday
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Create Monday date using local date components
    const monday = new Date(year, month, day - daysToSubtract);
    const sunday = new Date(year, month, day - daysToSubtract + 6);
    
    return {
      start: getLocalDateString(monday),
      end: getLocalDateString(sunday),
    };
  };

  // Get user location
  const getUserLocation = async (): Promise<{ latitude: number; longitude: number; address?: string } | null> => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      let address: string | undefined;
      
      // Try expo-location reverse geocoding first (works better on mobile)
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode && reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          
          // Build address string with better formatting
          const addressParts: string[] = [];
          
          // Street address
          if (addr.streetNumber && addr.street) {
            addressParts.push(`${addr.streetNumber} ${addr.street}`);
          } else if (addr.street) {
            addressParts.push(addr.street);
          }
          
          // City
          if (addr.city) {
            addressParts.push(addr.city);
          }
          
          // Region/State
          if (addr.region) {
            addressParts.push(addr.region);
          }
          
          // Postal code
          if (addr.postalCode) {
            addressParts.push(addr.postalCode);
          }
          
          // Country
          if (addr.country) {
            addressParts.push(addr.country);
          }
          
          // If we have any address parts, join them
          if (addressParts.length > 0) {
            address = addressParts.join(', ');
          } else {
            // Fallback: try to use name or formatted address
            address = addr.name || addr.formattedAddress;
          }
        }
      } catch (geocodeError) {
        console.warn('Expo location reverse geocoding failed:', geocodeError);
      }
      
      // If expo-location didn't work or didn't return address, try OpenStreetMap Nominatim API (works on web)
      if (!address || address === 'Location address unavailable') {
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}&zoom=18&addressdetails=1`;
          
          const response = await fetch(nominatimUrl, {
            headers: {
              'User-Agent': 'BlueCrewApp/1.0', // Required by Nominatim
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data && data.address) {
              const addr = data.address;
              const addressParts: string[] = [];
              
              // Build address from Nominatim response
              if (addr.house_number && addr.road) {
                addressParts.push(`${addr.house_number} ${addr.road}`);
              } else if (addr.road) {
                addressParts.push(addr.road);
              }
              
              if (addr.neighbourhood || addr.suburb) {
                addressParts.push(addr.neighbourhood || addr.suburb);
              }
              
              if (addr.city || addr.town || addr.village) {
                addressParts.push(addr.city || addr.town || addr.village);
              }
              
              if (addr.state || addr.region) {
                addressParts.push(addr.state || addr.region);
              }
              
              if (addr.postcode) {
                addressParts.push(addr.postcode);
              }
              
              if (addr.country) {
                addressParts.push(addr.country);
              }
              
              if (addressParts.length > 0) {
                address = addressParts.join(', ');
              } else if (data.display_name) {
                // Use display_name as fallback
                address = data.display_name;
              }
            } else if (data.display_name) {
              address = data.display_name;
            }
          }
        } catch (nominatimError) {
          console.warn('Nominatim reverse geocoding failed:', nominatimError);
        }
      }
      
      // Final fallback: if still no address, show coordinates in a readable format
      if (!address) {
        address = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  // Load time clock data
  useEffect(() => {
    const loadTimeClockData = async () => {
      try {
        setLoading(true);
        
        // Load all users if admin
        if (userRole === 'admin') {
          const users = await UserService.getAllUsers();
          const timeClockUsers = users.filter(u => 
            u.role === 'pm' || u.role === 'sales' || u.role === 'office'
          );
          setAllUsers(timeClockUsers.map(u => ({ id: u.id, name: u.name, role: u.role })));
        }
        
        // Load time clock entries from Firebase
        // Admin sees all entries, others see only their own
        const entries = userRole === 'admin' 
          ? await TimeClockService.getTimeClockEntries()
          : await TimeClockService.getTimeClockEntries(user?.id);
        // Sort by created_at descending to show newest first
        const sortedEntries = entries.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTimeEntries(sortedEntries);
        
        // Check current user's status
        const userEntry = entries.find(entry => entry.user_id === user?.id && entry.status === 'clocked_in');
        if (userEntry) {
          setCurrentStatus('clocked_in');
            setCurrentClockIn(userEntry.clock_in);
        } else {
          setCurrentStatus('clocked_out');
        }
        
        // Generate weekly data
        const currentWeek = getCurrentWeek();
        const weeklyData = await TimeClockService.getWeeklyTimeClock(
          currentWeek.start, 
          currentWeek.end,
          userRole === 'admin' ? undefined : user?.id
        );
        setWeeklyData([weeklyData]);
        
      } catch (error) {
        console.error('Error loading time clock data:', error);
        Alert.alert('Error', 'Failed to load time clock data');
      } finally {
        setLoading(false);
      }
    };

    loadTimeClockData();
  }, [user?.id, userRole, selectedRole, searchName, selectedUserId]);

  // Clock in/out functions
  const handleClockIn = async () => {
    try {
      if (!user?.id || !user?.name || !user?.role) {
        Alert.alert('Error', 'User information not available');
        return;
      }

      // Get user location
      const location = await getUserLocation();
      if (!location) {
        Alert.alert(
          'Location Not Available',
          'Could not get your location. Clocking in without location.',
          [{ text: 'OK' }]
        );
      }

      const entryId = await TimeClockService.clockIn(
        user.id, 
        user.name, 
        user.role as 'pm' | 'sales' | 'office',
        location || undefined
      );
      
      setCurrentStatus('clocked_in');
      // Use local time for display
      const localNow = new Date();
      setCurrentClockIn(localNow.toISOString());
      
      // Reload data to get the new entry (sorted by created_at desc - newest first)
      const entries = userRole === 'admin' 
        ? await TimeClockService.getTimeClockEntries()
        : await TimeClockService.getTimeClockEntries(user.id);
      // Sort by created_at descending to show newest first
      const sortedEntries = entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTimeEntries(sortedEntries);
      
      Alert.alert('Success', `Clocked in successfully!${location?.address ? `\nLocation: ${location.address}` : ''}`);
    } catch (error) {
      console.error('Error clocking in:', error);
      Alert.alert('Error', 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'User information not available');
        return;
      }

      // Find the current clock-in entry
      const currentEntry = timeEntries.find(entry => 
        entry.user_id === user.id && entry.status === 'clocked_in'
      );

      if (!currentEntry) {
        Alert.alert('Error', 'No active clock-in found');
        return;
      }

      // Get user location
      const location = await getUserLocation();
      if (!location) {
        Alert.alert(
          'Location Not Available',
          'Could not get your location. Clocking out without location.',
          [{ text: 'OK' }]
        );
      }

      await TimeClockService.clockOut(currentEntry.id, location || undefined);
      
      setCurrentStatus('clocked_out');
      setCurrentClockIn(null);
      
      // Reload data to get the updated entry (sorted by created_at desc - newest first)
      const entries = userRole === 'admin' 
        ? await TimeClockService.getTimeClockEntries()
        : await TimeClockService.getTimeClockEntries(user.id);
      // Sort by created_at descending to show newest first
      const sortedEntries = entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTimeEntries(sortedEntries);
      
      Alert.alert('Success', `Clocked out successfully!${location?.address ? `\nLocation: ${location.address}` : ''}`);
    } catch (error) {
      console.error('Error clocking out:', error);
      Alert.alert('Error', 'Failed to clock out');
    }
  };

  // Manual clock out for admin
  const handleManualClockOut = async (entryId: string, userName: string) => {
    const doClockOut = async () => {
      try {
        await TimeClockService.clockOut(entryId);
        
        // Reload data to get the updated entry
        const entries = await TimeClockService.getTimeClockEntries();
        const sortedEntries = entries.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTimeEntries(sortedEntries);
        
        if (Platform.OS === 'web') {
          alert(`${userName} has been clocked out.`);
        } else {
          Alert.alert('Success', `${userName} has been clocked out.`);
        }
      } catch (error) {
        console.error('Error manually clocking out:', error);
        if (Platform.OS === 'web') {
          alert('Failed to clock out.');
        } else {
          Alert.alert('Error', 'Failed to clock out.');
        }
      }
    };

    try {
      if (Platform.OS === 'web') {
        // Use window.confirm for web
        const confirmed = window.confirm(`Are you sure you want to clock out ${userName}?`);
        if (confirmed) {
          await doClockOut();
        }
      } else {
        // Use Alert.alert for native
        Alert.alert(
          'Clock Out',
          `Are you sure you want to clock out ${userName}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: doClockOut,
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error in manual clock out:', error);
      if (Platform.OS === 'web') {
        alert('Manuel çıkış yapılırken bir hata oluştu.');
      } else {
        Alert.alert('Hata', 'Manuel çıkış yapılırken bir hata oluştu.');
      }
    }
  };

  // Calculate weekly hours per user
  const getUserWeeklyHours = (entries: TimeClockEntry[]) => {
    const userHoursMap = new Map<string, { user_name: string; user_role: string; total_hours: number }>();
    
    entries.forEach(entry => {
      const key = entry.user_id;
      if (!userHoursMap.has(key)) {
        userHoursMap.set(key, {
          user_name: entry.user_name,
          user_role: entry.user_role,
          total_hours: 0
        });
      }
      
      const userHours = userHoursMap.get(key)!;
      userHours.total_hours += entry.total_hours || 0;
    });
    
    return Array.from(userHoursMap.values()).sort((a, b) => b.total_hours - a.total_hours);
  };

  // Filter functions
  const getFilteredEntries = () => {
    let filtered = timeEntries;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(entry => entry.user_role === selectedRole);
    }
    
    if (selectedUserId !== 'all') {
      filtered = filtered.filter(entry => entry.user_id === selectedUserId);
    }
    
    if (selectedWeek === 'current') {
      const currentWeek = getCurrentWeek();
      filtered = filtered.filter(entry => 
        entry.date >= currentWeek.start && entry.date <= currentWeek.end
      );
    }
    
    if (searchName) {
      filtered = filtered.filter(entry => 
        entry.user_name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Group entries by user for admin view
  const getGroupedEntriesByUser = () => {
    const filtered = getFilteredEntries();
    const grouped = new Map<string, TimeClockEntry[]>();
    
    filtered.forEach(entry => {
      if (!grouped.has(entry.user_id)) {
        grouped.set(entry.user_id, []);
      }
      grouped.get(entry.user_id)!.push(entry);
    });
    
    return Array.from(grouped.entries()).map(([userId, entries]) => {
      const user = allUsers.find(u => u.id === userId);
      return {
        userId,
        userName: user?.name || entries[0]?.user_name || 'Unknown',
        userRole: entries[0]?.user_role || 'unknown',
        entries: entries.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      };
    }).sort((a, b) => a.userName.localeCompare(b.userName));
  };

  const formatTime = (timestamp: string) => {
    // Parse timestamp and format in local timezone
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  const formatDate = (dateString: string) => {
    // Parse the date string - if it's YYYY-MM-DD format, use local date
    // Otherwise parse as ISO string and convert to local
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // It's already a date string (YYYY-MM-DD), parse it as local date
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      // It's an ISO timestamp, parse and use local timezone
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  };

  const getWeekDays = () => {
    const currentWeek = getCurrentWeek();
    const days = [];
    // Parse the date string (YYYY-MM-DD) to create a date object using local date components
    const [startYear, startMonth, startDay] = currentWeek.start.split('-').map(Number);
    const today = getLocalDateString();
    
    for (let i = 0; i < 7; i++) {
      // Create date using local date components to avoid timezone issues
      const date = new Date(startYear, startMonth - 1, startDay + i);
      const dateString = getLocalDateString(date);
      const isToday = dateString === today;
      
      days.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: isToday
      });
    }
    
    return days;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading time clock data...</Text>
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
            <Text style={styles.title}>Time Clock</Text>
            <Text style={styles.subtitle}>Track your work hours</Text>
          </View>
        </View>

      {/* Filter Button - Moved to content area */}
      {userRole === 'admin' && (
        <View style={styles.contentActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setTempSelectedRole(selectedRole);
              setTempSelectedWeek(selectedWeek);
              setTempSearchName(searchName);
              setTempSelectedUserId(selectedUserId);
              setShowFilterModal(true);
            }}
          >
            <Text style={styles.filterButtonText}>🔍 Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Clock In/Out Section */}
      <View style={styles.clockSection}>
        <View style={styles.clockStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: currentStatus === 'clocked_in' ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.statusText}>
            {currentStatus === 'clocked_in' ? 'Currently Clocked In' : 'Currently Clocked Out'}
          </Text>
        </View>
        
        {currentStatus === 'clocked_in' && currentClockIn && (
          <Text style={styles.clockInTime}>
            Since: {formatTime(currentClockIn)}
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.clockButton, { backgroundColor: currentStatus === 'clocked_in' ? '#ef4444' : '#22c55e' }]}
          onPress={currentStatus === 'clocked_in' ? handleClockOut : handleClockIn}
        >
          <Text style={styles.clockButtonText}>
            {currentStatus === 'clocked_in' ? '⏰ Clock Out' : '⏰ Clock In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly View */}
      <View style={styles.weeklySection}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.weekDays}>
          {getWeekDays().map((day, index) => (
            <View key={index} style={[styles.dayColumn, day.isToday && styles.todayColumn]}>
              <Text style={[styles.dayName, day.isToday && styles.todayText]}>{day.dayName}</Text>
              <Text style={[styles.dayDate, day.isToday && styles.todayText]}>{day.fullDate}</Text>
              <View style={[styles.dayIndicator, day.isToday && styles.todayIndicator]} />
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Hours Summary */}
      {selectedWeek === 'current' && weeklyData.length > 0 && (
        <View style={styles.weeklySummaryContainer}>
          <Text style={styles.sectionTitle}>Weekly Hours Summary</Text>
          {weeklyData.map((week, index) => (
            <View key={index} style={styles.weeklyCard}>
              <View style={styles.weeklyHeader}>
                <Text style={styles.weeklyTitle}>
                  Week of {formatDate(week.week_start)} - {formatDate(week.week_end)}
                </Text>
                <Text style={styles.weeklyTotalHours}>
                  Total: {week.total_hours.toFixed(1)} hours
                </Text>
              </View>
              
              {/* User breakdown */}
              <View style={styles.userHoursList}>
                {getUserWeeklyHours(week.entries).map((userHours, userIndex) => (
                  <View key={userIndex} style={styles.userHoursRow}>
                    <View style={styles.userHoursInfo}>
                      <Text style={styles.userHoursName}>{userHours.user_name}</Text>
                      <Text style={styles.userHoursRole}>{userHours.user_role.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userHoursTotal}>
                      {userHours.total_hours.toFixed(1)}h
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Time Entries */}
      <ScrollView 
        style={styles.entriesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        scrollEventThrottle={16}
      >
        <Text style={styles.sectionTitle}>
          {userRole === 'admin' ? 'All Time Entries' : 'Recent Entries'}
        </Text>
        
        {userRole === 'admin' ? (
          // Admin view: Grouped by user
          getGroupedEntriesByUser().map((group) => (
            <View key={group.userId} style={styles.userGroupCard}>
              <View style={styles.userGroupHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {group.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{group.userName}</Text>
                    <Text style={styles.userRole}>{group.userRole.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              
              {group.entries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: entry.status === 'clocked_in' ? '#22c55e' : '#6b7280' }]}>
                      <Text style={styles.statusBadgeText}>
                        {entry.status === 'clocked_in' ? 'IN' : 'OUT'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>In:</Text>
                      <Text style={styles.timeValue}>{formatTime(entry.clock_in)}</Text>
                      {entry.clock_out && (
                        <>
                          <Text style={styles.timeLabel}>Out:</Text>
                          <Text style={styles.timeValue}>{formatTime(entry.clock_out)}</Text>
                        </>
                      )}
                    </View>
                    {entry.total_hours && entry.total_hours > 0 && (
                      <Text style={styles.totalHours}>
                        Total: {entry.total_hours} hours
                      </Text>
                    )}
                    {entry.location && entry.location.address && (
                      <View style={styles.locationRow}>
                        <MapPin size={14} color="#6b7280" />
                        <Text style={styles.locationText}>
                          Clock In: {entry.location.address}
                        </Text>
                      </View>
                    )}
                    {entry.clock_out_location && entry.clock_out_location.address && (
                      <View style={styles.locationRow}>
                        <MapPin size={14} color="#6b7280" />
                        <Text style={styles.locationText}>
                          Clock Out: {entry.clock_out_location.address}
                        </Text>
                      </View>
                    )}
                    {entry.status === 'clocked_in' && userRole === 'admin' && (
                      <TouchableOpacity
                        style={styles.manualClockOutButton}
                        onPress={() => handleManualClockOut(entry.id, entry.user_name)}
                      >
                        <Text style={styles.manualClockOutButtonText}>Clock Out</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          // Regular user view: Flat list
          getFilteredEntries().map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {entry.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{entry.user_name}</Text>
                    <Text style={styles.userRole}>{entry.user_role.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: entry.status === 'clocked_in' ? '#22c55e' : '#6b7280' }]}>
                  <Text style={styles.statusBadgeText}>
                    {entry.status === 'clocked_in' ? 'IN' : 'OUT'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.entryDetails}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>In:</Text>
                  <Text style={styles.timeValue}>{formatTime(entry.clock_in)}</Text>
                  {entry.clock_out && (
                    <>
                      <Text style={styles.timeLabel}>Out:</Text>
                      <Text style={styles.timeValue}>{formatTime(entry.clock_out)}</Text>
                    </>
                  )}
                </View>
                {entry.total_hours && entry.total_hours > 0 && (
                  <Text style={styles.totalHours}>
                    Total: {entry.total_hours} hours
                  </Text>
                )}
                {(entry.location || (entry as any).clock_out_location) && (
                  <View style={styles.locationRow}>
                    <MapPin size={14} color="#6b7280" />
                    <Text style={styles.locationText}>
                      {(entry.location || (entry as any).clock_out_location)?.address || 
                       `${(entry.location || (entry as any).clock_out_location)?.latitude.toFixed(4)}, ${(entry.location || (entry as any).clock_out_location)?.longitude.toFixed(4)}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Time Clock</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleSelector}>
                  {['all', 'pm', 'sales', 'office'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        tempSelectedRole === role && styles.selectedRoleButton,
                      ]}
                      onPress={() => setTempSelectedRole(role as any)}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        tempSelectedRole === role && styles.selectedRoleButtonText,
                      ]}>
                        {role.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Week Filter</Text>
                <View style={styles.weekSelector}>
                  <TouchableOpacity
                    style={[
                      styles.weekButton,
                      tempSelectedWeek === '' && styles.selectedWeekButton,
                    ]}
                    onPress={() => setTempSelectedWeek('')}
                  >
                    <Text style={[
                      styles.weekButtonText,
                      tempSelectedWeek === '' && styles.selectedWeekButtonText,
                    ]}>
                      All Weeks
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.weekButton,
                      tempSelectedWeek === 'current' && styles.selectedWeekButton,
                    ]}
                    onPress={() => setTempSelectedWeek('current')}
                  >
                    <Text style={[
                      styles.weekButtonText,
                      tempSelectedWeek === 'current' && styles.selectedWeekButtonText,
                    ]}>
                      Current Week
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {userRole === 'admin' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>User</Text>
                  <ScrollView style={styles.userSelector} nestedScrollEnabled>
                    <TouchableOpacity
                      style={[
                        styles.userOption,
                        tempSelectedUserId === 'all' && styles.selectedUserOption,
                      ]}
                      onPress={() => setTempSelectedUserId('all')}
                    >
                      <Text style={[
                        styles.userOptionText,
                        tempSelectedUserId === 'all' && styles.selectedUserOptionText,
                      ]}>
                        All Users
                      </Text>
                    </TouchableOpacity>
                    {allUsers.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={[
                          styles.userOption,
                          tempSelectedUserId === user.id && styles.selectedUserOption,
                        ]}
                        onPress={() => setTempSelectedUserId(user.id)}
                      >
                        <Text style={[
                          styles.userOptionText,
                          tempSelectedUserId === user.id && styles.selectedUserOptionText,
                        ]}>
                          {user.name} ({user.role.toUpperCase()})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Search by Name</Text>
                <TextInput
                  style={styles.input}
                  value={tempSearchName}
                  onChangeText={setTempSearchName}
                  placeholder="Enter name to search"
                />
              </View>
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setSelectedRole(tempSelectedRole);
                  setSelectedWeek(tempSelectedWeek);
                  setSearchName(tempSearchName);
                  if (userRole === 'admin') {
                    setSelectedUserId(tempSelectedUserId);
                  }
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#1e40af',
    borderBottomWidth: 2,
    borderBottomColor: '#ffcc00',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24',
    marginTop: 4,
  },
  contentActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterButton: {
    backgroundColor: '#ffcc00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
    fontWeight: '500',
  },
  clockSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clockInTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  clockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  weeklySection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  dayIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  todayColumn: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 8,
  },
  todayText: {
    color: '#236ecf',
    fontWeight: '700',
  },
  todayIndicator: {
    backgroundColor: '#236ecf',
  },
  entriesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  entryDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  entryDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
    minWidth: 30,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 16,
  },
  totalHours: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#236ecf',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalContent: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  selectedRoleButtonText: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#236ecf',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Week filter styles
  weekSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  weekButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  selectedWeekButton: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedWeekButtonText: {
    color: '#ffffff',
  },
  // Weekly summary styles
  weeklySummaryContainer: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  weeklyCard: {
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
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  weeklyTotalHours: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
  },
  userHoursList: {
    gap: 8,
  },
  userHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  userHoursInfo: {
    flex: 1,
  },
  userHoursName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  userHoursRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  userHoursTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  userGroupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userGroupHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  userSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  userOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedUserOption: {
    backgroundColor: '#236ecf',
  },
  userOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedUserOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  manualClockOutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  manualClockOutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
