import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { TimeClockEntry, WeeklyTimeClock } from '@/types';

// Helper function to get local date string (YYYY-MM-DD) instead of UTC
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class TimeClockService {
  static async clockIn(
    userId: string, 
    userName: string, 
    userRole: 'pm' | 'sales' | 'office',
    location?: { latitude: number; longitude: number; address?: string }
  ): Promise<string> {
    try {
      const today = getLocalDateString();
      const now = new Date().toISOString();
      
      const entryData: any = {
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        clock_in: now,
        date: today,
        status: 'clocked_in',
        created_at: now,
      };

      if (location) {
        // Remove undefined fields to avoid Firestore errors
        entryData.location = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        if (location.address) {
          entryData.location.address = location.address;
        }
      }

      const docRef = await addDoc(collection(db, 'time_clock'), entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  }

  static async clockOut(
    entryId: string,
    location?: { latitude: number; longitude: number; address?: string }
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const entryRef = doc(db, 'time_clock', entryId);
      
      // Get the entry to calculate total hours
      const entryDoc = await getDocs(query(collection(db, 'time_clock'), where('__name__', '==', entryId)));
      if (entryDoc.empty) {
        throw new Error('Time clock entry not found');
      }
      
      const entryData = entryDoc.docs[0].data();
      const clockInTime = new Date(entryData.clock_in);
      const clockOutTime = new Date(now);
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const updateData: any = {
        clock_out: now,
        total_hours: Math.round(totalHours * 100) / 100,
        status: 'clocked_out',
        updated_at: now,
      };

      // Add clock out location if provided
      if (location) {
        // Remove undefined fields to avoid Firestore errors
        updateData.clock_out_location = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        if (location.address) {
          updateData.clock_out_location.address = location.address;
        }
      }

      await updateDoc(entryRef, updateData);
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
  }

  static async getTimeClockEntries(userId?: string): Promise<TimeClockEntry[]> {
    try {
      let q = query(collection(db, 'time_clock'), orderBy('created_at', 'desc'));
      
      if (userId) {
        q = query(collection(db, 'time_clock'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeClockEntry[];
    } catch (error) {
      console.error('Error getting time clock entries:', error);
      throw error;
    }
  }

  static async getWeeklyTimeClock(weekStart: string, weekEnd: string, userId?: string): Promise<WeeklyTimeClock> {
    try {
      let q = query(
        collection(db, 'time_clock'),
        where('date', '>=', weekStart),
        where('date', '<=', weekEnd),
        orderBy('date', 'asc')
      );

      if (userId) {
        q = query(
          collection(db, 'time_clock'),
          where('user_id', '==', userId),
          where('date', '>=', weekStart),
          where('date', '<=', weekEnd),
          orderBy('date', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TimeClockEntry[];

      const totalHours = entries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);

      return {
        week_start: weekStart,
        week_end: weekEnd,
        entries,
        total_hours: Math.round(totalHours * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting weekly time clock:', error);
      throw error;
    }
  }
}