import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DailyLog {
  id: string;
  project_id: string;
  date: string;
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    wind_speed: number;
    humidity: number;
  };
  workers: {
    name: string;
    role: string;
    hours_worked: number;
    attendance: 'present' | 'absent' | 'late';
  }[];
  work_completed: string;
  materials_used: string;
  equipment_used: string;
  issues_encountered: string;
  photos: string[];
  notes: string;
  created_by: string;
  created_by_id?: string;
  created_at: string;
  updated_at?: string;
}

const DAILY_LOGS_COLLECTION = 'daily_logs';

export class DailyLogService {
  // Get daily logs by project ID
  static async getDailyLogsByProjectId(projectId: string): Promise<DailyLog[]> {
    try {
      // First, try with index (if it exists)
      try {
        const logsQuery = query(
          collection(db, DAILY_LOGS_COLLECTION),
          where('project_id', '==', projectId),
          orderBy('date', 'desc')
        );
        const logsSnapshot = await getDocs(logsQuery);
        
        return logsSnapshot.docs.map(doc => ({
          ...doc.data() as DailyLog,
          id: doc.id
        }));
      } catch (indexError: any) {
        // If index doesn't exist, fallback to client-side sorting
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Index not found, using client-side sorting. Please create the index:', indexError.message);
          
          // Get all logs for the project without orderBy
          const logsQuery = query(
            collection(db, DAILY_LOGS_COLLECTION),
            where('project_id', '==', projectId)
          );
          const logsSnapshot = await getDocs(logsQuery);
          
          // Sort on client side
          const logs = logsSnapshot.docs.map(doc => ({
            ...doc.data() as DailyLog,
            id: doc.id
          }));
          
          // Sort by date descending
          return logs.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // descending
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error getting daily logs:', error);
      return [];
    }
  }

  // Get daily log by ID
  static async getDailyLogById(logId: string): Promise<DailyLog | null> {
    try {
      const logDoc = await getDoc(doc(db, DAILY_LOGS_COLLECTION, logId));
      
      if (!logDoc.exists()) {
        return null;
      }

      return {
        ...logDoc.data() as DailyLog,
        id: logDoc.id
      };
    } catch (error) {
      console.error('Error getting daily log:', error);
      return null;
    }
  }

  // Create daily log
  // created_at is generated here, so callers don't need to pass it.
  static async createDailyLog(log: Omit<DailyLog, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, DAILY_LOGS_COLLECTION), {
        ...log,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating daily log:', error);
      throw error;
    }
  }

  // Update daily log
  static async updateDailyLog(logId: string, updates: Partial<DailyLog>): Promise<void> {
    try {
      const logRef = doc(db, DAILY_LOGS_COLLECTION, logId);
      await updateDoc(logRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating daily log:', error);
      throw error;
    }
  }

  // Delete daily log
  static async deleteDailyLog(logId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, DAILY_LOGS_COLLECTION, logId));
    } catch (error) {
      console.error('Error deleting daily log:', error);
      throw error;
    }
  }
}


