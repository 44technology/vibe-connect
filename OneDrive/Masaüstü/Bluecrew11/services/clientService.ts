import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Client, ClientNote } from '@/types';

const USERS_COLLECTION = 'users';

export const ClientService = {
  async getClientById(clientId: string): Promise<Client | null> {
    try {
      const clientDocRef = doc(db, USERS_COLLECTION, clientId);
      const clientDocSnap = await getDoc(clientDocRef);

      if (clientDocSnap.exists()) {
        const data = clientDocSnap.data();
        return {
          id: clientDocSnap.id,
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          address: data.address || undefined,
          notes: data.notes || [],
          converted_from_lead_id: data.converted_from_lead_id || undefined,
          created_at: data.created_at,
        } as Client;
      }
      return null;
    } catch (error) {
      console.error('Error getting client by ID:', error);
      return null;
    }
  },

  async addNoteToClient(clientId: string, note: Omit<ClientNote, 'id'>): Promise<void> {
    try {
      const client = await this.getClientById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const newNote: ClientNote = {
        id: `note_${Date.now()}`,
        ...note,
      };

      const updatedNotes = [...(client.notes || []), newNote];
      const clientRef = doc(db, USERS_COLLECTION, clientId);
      await updateDoc(clientRef, {
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding note to client:', error);
      throw error;
    }
  },

  async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    try {
      const clientRef = doc(db, USERS_COLLECTION, clientId);
      await updateDoc(clientRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },
};

