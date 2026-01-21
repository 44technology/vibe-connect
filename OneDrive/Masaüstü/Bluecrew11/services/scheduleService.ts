import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PMSchedule } from '@/types';

export class ScheduleService {
  private static collectionName = 'schedules';

  static async createSchedule(schedule: Omit<PMSchedule, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  }

  static async getSchedules(): Promise<PMSchedule[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PMSchedule[];
    } catch (error) {
      console.error('Error getting schedules:', error);
      throw new Error('Failed to get schedules');
    }
  }

  static async getSchedulesByPM(pmId: string): Promise<PMSchedule[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('pm_id', '==', pmId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PMSchedule[];
    } catch (error) {
      console.error('Error getting schedules by PM:', error);
      throw new Error('Failed to get schedules by PM');
    }
  }

  static async updateSchedule(scheduleId: string, updates: Partial<PMSchedule>): Promise<void> {
    try {
      const scheduleRef = doc(db, this.collectionName, scheduleId);
      await updateDoc(scheduleRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  }

  static async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      const scheduleRef = doc(db, this.collectionName, scheduleId);
      await deleteDoc(scheduleRef);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  }
}





















