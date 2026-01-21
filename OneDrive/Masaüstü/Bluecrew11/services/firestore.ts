import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectStep, MaterialRequest, PMSchedule } from '@/types';

// Projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

export const getProject = async (id: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, 'projects', id);
    const snapshot = await getDoc(projectRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Project;
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

export const createProject = async (project: Omit<Project, 'id'>): Promise<string> => {
  try {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      ...project,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
  try {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Project Steps
export const getProjectSteps = async (projectId: string): Promise<ProjectStep[]> => {
  try {
    const stepsRef = collection(db, 'projects', projectId, 'steps');
    const q = query(stepsRef, orderBy('order_index'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      project_id: projectId,
      ...doc.data()
    })) as ProjectStep[];
  } catch (error) {
    console.error('Error getting project steps:', error);
    throw error;
  }
};

export const createProjectStep = async (projectId: string, step: Omit<ProjectStep, 'id' | 'project_id'>): Promise<string> => {
  try {
    const stepsRef = collection(db, 'projects', projectId, 'steps');
    const docRef = await addDoc(stepsRef, {
      ...step,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project step:', error);
    throw error;
  }
};

export const updateProjectStep = async (projectId: string, stepId: string, updates: Partial<ProjectStep>): Promise<void> => {
  try {
    const stepRef = doc(db, 'projects', projectId, 'steps', stepId);
    await updateDoc(stepRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating project step:', error);
    throw error;
  }
};

export const deleteProjectStep = async (projectId: string, stepId: string): Promise<void> => {
  try {
    const stepRef = doc(db, 'projects', projectId, 'steps', stepId);
    await deleteDoc(stepRef);
  } catch (error) {
    console.error('Error deleting project step:', error);
    throw error;
  }
};

// Material Requests
export const getMaterialRequests = async (): Promise<MaterialRequest[]> => {
  try {
    const requestsRef = collection(db, 'materialRequests');
    const q = query(requestsRef, orderBy('requested_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MaterialRequest[];
  } catch (error) {
    console.error('Error getting material requests:', error);
    throw error;
  }
};

export const createMaterialRequest = async (request: Omit<MaterialRequest, 'id'>): Promise<string> => {
  try {
    const requestsRef = collection(db, 'materialRequests');
    const docRef = await addDoc(requestsRef, {
      ...request,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating material request:', error);
    throw error;
  }
};

export const updateMaterialRequest = async (id: string, updates: Partial<MaterialRequest>): Promise<void> => {
  try {
    const requestRef = doc(db, 'materialRequests', id);
    await updateDoc(requestRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating material request:', error);
    throw error;
  }
};

// PM Schedules
export const getPMSchedules = async (): Promise<PMSchedule[]> => {
  try {
    const schedulesRef = collection(db, 'pmSchedules');
    const q = query(schedulesRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PMSchedule[];
  } catch (error) {
    console.error('Error getting PM schedules:', error);
    throw error;
  }
};

export const createPMSchedule = async (schedule: Omit<PMSchedule, 'id'>): Promise<string> => {
  try {
    const schedulesRef = collection(db, 'pmSchedules');
    const docRef = await addDoc(schedulesRef, {
      ...schedule,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating PM schedule:', error);
    throw error;
  }
};

export const updatePMSchedule = async (id: string, updates: Partial<PMSchedule>): Promise<void> => {
  try {
    const scheduleRef = doc(db, 'pmSchedules', id);
    await updateDoc(scheduleRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating PM schedule:', error);
    throw error;
  }
};

