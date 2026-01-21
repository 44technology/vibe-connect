import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Lead, LeadNote } from '@/types';

const LEADS_COLLECTION = 'leads';

export const LeadService = {
  async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
        ...leadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  async getLeads(): Promise<Lead[]> {
    try {
      const leadsCol = collection(db, LEADS_COLLECTION);
      const q = query(leadsCol, orderBy('created_at', 'desc'));
      const leadSnapshot = await getDocs(q);
      const leadsList = leadSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      return leadsList;
    } catch (error) {
      console.error('Error getting leads:', error);
      return [];
    }
  },

  async getLeadById(leadId: string): Promise<Lead | null> {
    try {
      const leadDocRef = doc(db, LEADS_COLLECTION, leadId);
      const leadDocSnap = await getDoc(leadDocRef);

      if (leadDocSnap.exists()) {
        return { id: leadDocSnap.id, ...leadDocSnap.data() } as Lead;
      }
      return null;
    } catch (error) {
      console.error('Error getting lead by ID:', error);
      return null;
    }
  },

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<void> {
    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      await updateDoc(leadRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  async deleteLead(leadId: string): Promise<void> {
    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      await deleteDoc(leadRef);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  async addNoteToLead(leadId: string, note: Omit<LeadNote, 'id'>): Promise<void> {
    try {
      const lead = await this.getLeadById(leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }

      const newNote: LeadNote = {
        id: `note_${Date.now()}`,
        ...note,
      };

      const updatedNotes = [...lead.notes, newNote];
      await this.updateLead(leadId, { notes: updatedNotes });
    } catch (error) {
      console.error('Error adding note to lead:', error);
      throw error;
    }
  },

  async convertLeadToClient(leadId: string, clientId: string): Promise<void> {
    try {
      await this.updateLead(leadId, {
        status: 'converted',
        converted_to_client_id: clientId,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error converting lead to client:', error);
      throw error;
    }
  },
};

