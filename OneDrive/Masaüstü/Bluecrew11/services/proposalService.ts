import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Proposal } from '@/types';

const PROPOSALS_COLLECTION = 'proposals';

export const ProposalService = {
  async createProposal(proposalData: Omit<Proposal, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, PROPOSALS_COLLECTION), {
        ...proposalData,
        created_at: new Date().toISOString(),
        proposal_date: proposalData.proposal_date || new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },

  async getProposals(): Promise<Proposal[]> {
    try {
      const proposalsCol = collection(db, PROPOSALS_COLLECTION);
      const q = query(proposalsCol, orderBy('created_at', 'desc'));
      const proposalSnapshot = await getDocs(q);
      const proposalsList = proposalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Proposal[];
      return proposalsList;
    } catch (error) {
      console.error('Error getting proposals:', error);
      return [];
    }
  },

  async getProposalsByClient(clientId: string): Promise<Proposal[]> {
    try {
      const proposalsCol = collection(db, PROPOSALS_COLLECTION);
      const q = query(proposalsCol, where('client_id', '==', clientId), orderBy('created_at', 'desc'));
      const proposalSnapshot = await getDocs(q);
      return proposalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Proposal[];
    } catch (error) {
      console.error('Error getting proposals by client:', error);
      return [];
    }
  },

  async getProposalById(proposalId: string): Promise<Proposal | null> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      const proposalDocSnap = await getDoc(proposalDocRef);

      if (proposalDocSnap.exists()) {
        return { id: proposalDocSnap.id, ...proposalDocSnap.data() } as Proposal;
      }
      return null;
    } catch (error) {
      console.error('Error getting proposal by ID:', error);
      return null;
    }
  },

  async updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await updateDoc(proposalDocRef, updates);
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  },

  async approveProposalByManagement(proposalId: string, approvedBy: string, approvedByName: string): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await updateDoc(proposalDocRef, {
        management_approval: 'approved',
        management_approved_at: new Date().toISOString(),
        management_approved_by: approvedBy,
        management_approved_by_name: approvedByName,
        client_approval: 'pending', // Now send to client for approval
      });
    } catch (error) {
      console.error('Error approving proposal by management:', error);
      throw error;
    }
  },

  async getProposalsByClientName(clientName: string): Promise<Proposal[]> {
    try {
      const proposalsCol = collection(db, PROPOSALS_COLLECTION);
      const q = query(proposalsCol, where('client_name', '==', clientName), orderBy('created_at', 'desc'));
      const proposalSnapshot = await getDocs(q);
      return proposalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Proposal[];
    } catch (error) {
      console.error('Error getting proposals by client name:', error);
      return [];
    }
  },

  async rejectProposalByManagement(proposalId: string, rejectedBy: string, rejectedByName: string, reason: string): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await updateDoc(proposalDocRef, {
        management_approval: 'rejected',
        management_rejected_at: new Date().toISOString(),
        management_rejected_by: rejectedBy,
        management_rejected_by_name: rejectedByName,
        management_rejection_reason: reason,
        client_approval: null, // Keep as null so sales can edit and resubmit
      });
    } catch (error) {
      console.error('Error rejecting proposal by management:', error);
      throw error;
    }
  },

  async approveProposalByClient(proposalId: string): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await updateDoc(proposalDocRef, {
        client_approval: 'approved',
        client_approved_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error approving proposal by client:', error);
      throw error;
    }
  },

  async rejectProposalByClient(proposalId: string, reason: string): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await updateDoc(proposalDocRef, {
        client_approval: 'rejected',
        client_rejected_at: new Date().toISOString(),
        client_rejection_reason: reason,
      });
    } catch (error) {
      console.error('Error rejecting proposal by client:', error);
      throw error;
    }
  },

  async requestChangesByClient(proposalId: string, reason: string): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await updateDoc(proposalDocRef, {
        client_approval: 'request_changes',
        client_change_request_reason: reason,
        client_rejected_at: new Date().toISOString(), // Use same field to track when change was requested
      });
    } catch (error) {
      console.error('Error requesting changes by client:', error);
      throw error;
    }
  },

  async deleteProposal(proposalId: string): Promise<void> {
    try {
      const proposalDocRef = doc(db, PROPOSALS_COLLECTION, proposalId);
      await deleteDoc(proposalDocRef);
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  },

  async generateProposalNumber(): Promise<string> {
    try {
      const proposals = await this.getProposals();
      const currentYear = new Date().getFullYear();
      const yearProposals = proposals.filter(p => {
        const proposalYear = new Date(p.proposal_date || p.created_at).getFullYear();
        return proposalYear === currentYear;
      });
      const nextNumber = yearProposals.length + 1;
      return `PROP-${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating proposal number:', error);
      const currentYear = new Date().getFullYear();
      return `PROP-${currentYear}-0001`;
    }
  },
};

