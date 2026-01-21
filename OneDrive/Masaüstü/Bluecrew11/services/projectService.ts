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
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectStep } from '@/types';
import { ChangeOrderService } from './changeOrderService';
import { CommentService } from './commentService';

const PROJECTS_COLLECTION = 'projects';
const STEPS_COLLECTION = 'steps';

export class ProjectService {
  // Get all projects
  static async getProjects(): Promise<Project[]> {
    try {
      const projectsSnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      const projects: Project[] = [];
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data() as Project;
        projectData.id = projectDoc.id;
        
        // Get steps for this project
        const stepsQuery = query(
          collection(db, STEPS_COLLECTION),
          where('project_id', '==', projectDoc.id),
          orderBy('order_index')
        );
        const stepsSnapshot = await getDocs(stepsQuery);
        
        const allSteps: ProjectStep[] = stepsSnapshot.docs.map(stepDoc => ({
          ...stepDoc.data() as ProjectStep,
          id: stepDoc.id
        }));
        
        // Organize steps: parent steps with their child steps
        const parentSteps = allSteps.filter(step => step.step_type === 'parent' || !step.parent_step_id);
        const childSteps = allSteps.filter(step => step.step_type === 'child' && step.parent_step_id);
        
        // Attach child steps to their parent steps
        const steps: ProjectStep[] = parentSteps.map(parentStep => ({
          ...parentStep,
          child_steps: childSteps.filter(child => child.parent_step_id === parentStep.id)
        }));
        
        projectData.steps = steps;
        projects.push(projectData);
      }
      
      return projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  // Get project by ID
  static async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      
      if (!projectDoc.exists()) {
        return null;
      }
      
      const projectData = projectDoc.data() as Project;
      projectData.id = projectDoc.id;
      
      // Get steps for this project
      const stepsQuery = query(
        collection(db, STEPS_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('order_index')
      );
      const stepsSnapshot = await getDocs(stepsQuery);
      
      const allSteps: ProjectStep[] = stepsSnapshot.docs.map(stepDoc => ({
        ...stepDoc.data() as ProjectStep,
        id: stepDoc.id
      }));
      
      // Organize steps: parent steps with their child steps
      const parentSteps = allSteps.filter(step => step.step_type === 'parent' || !step.parent_step_id);
      const childSteps = allSteps.filter(step => step.step_type === 'child' && step.parent_step_id);
      
      // Attach child steps to their parent steps
      const steps: ProjectStep[] = parentSteps.map(parentStep => ({
        ...parentStep,
        child_steps: childSteps.filter(child => child.parent_step_id === parentStep.id)
      }));
      
      projectData.steps = steps;
      return projectData;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  // Create new project
  static async createProject(project: Omit<Project, 'id' | 'steps'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...project,
        created_at: new Date().toISOString(),
        progress_percentage: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      await updateDoc(projectRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(projectId: string): Promise<void> {
    try {
      // Delete all steps first
      const stepsQuery = query(
        collection(db, STEPS_COLLECTION),
        where('project_id', '==', projectId)
      );
      const stepsSnapshot = await getDocs(stepsQuery);
      
      for (const stepDoc of stepsSnapshot.docs) {
        await deleteDoc(doc(db, STEPS_COLLECTION, stepDoc.id));
      }
      
      // Delete all change orders for this project
      try {
        const changeOrders = await ChangeOrderService.getChangeOrderRequestsByProjectId(projectId);
        for (const changeOrder of changeOrders) {
          await ChangeOrderService.deleteChangeOrderRequest(changeOrder.id);
        }
      } catch (error) {
        console.error('Error deleting change orders:', error);
        // Continue even if change order deletion fails
      }
      
      // Delete all comments for this project
      try {
        const comments = await CommentService.getCommentsByProjectId(projectId);
        for (const comment of comments) {
          await CommentService.deleteComment(comment.id);
        }
      } catch (error) {
        console.error('Error deleting comments:', error);
        // Continue even if comment deletion fails
      }
      
      // Delete project
      await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Add step to project
  static async addStep(projectId: string, step: Omit<ProjectStep, 'id' | 'project_id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, STEPS_COLLECTION), {
        ...step,
        project_id: projectId,
        created_at: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding step:', error);
      throw error;
    }
  }

  // Update step
  static async updateStep(stepId: string, updates: Partial<ProjectStep>): Promise<void> {
    try {
      const stepRef = doc(db, STEPS_COLLECTION, stepId);
      await updateDoc(stepRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  }

  // Delete step
  static async deleteStep(stepId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, STEPS_COLLECTION, stepId));
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  }

  // Real-time listener for projects
  static subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    const unsubscribe = onSnapshot(collection(db, PROJECTS_COLLECTION), async (snapshot) => {
      const projects: Project[] = [];
      
      for (const projectDoc of snapshot.docs) {
        const projectData = projectDoc.data() as Project;
        projectData.id = projectDoc.id;
        
        // Get steps for this project
        const stepsQuery = query(
          collection(db, STEPS_COLLECTION),
          where('project_id', '==', projectDoc.id),
          orderBy('order_index')
        );
        const stepsSnapshot = await getDocs(stepsQuery);
        
        const allSteps: ProjectStep[] = stepsSnapshot.docs.map(stepDoc => ({
          ...stepDoc.data() as ProjectStep,
          id: stepDoc.id
        }));
        
        // Organize steps: parent steps with their child steps
        const parentSteps = allSteps.filter(step => step.step_type === 'parent' || !step.parent_step_id);
        const childSteps = allSteps.filter(step => step.step_type === 'child' && step.parent_step_id);
        
        // Attach child steps to their parent steps
        const steps: ProjectStep[] = parentSteps.map(parentStep => ({
          ...parentStep,
          child_steps: childSteps.filter(child => child.parent_step_id === parentStep.id)
        }));
        
        projectData.steps = steps;
        projects.push(projectData);
      }
      
      callback(projects);
    });
    
    return unsubscribe;
  }

  // Update project
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      await updateDoc(projectRef, updates);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }
}

