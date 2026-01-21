import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, X, CheckCircle2 } from 'lucide-react-native';
import { TodoItem } from '@/types';
import { TodoService } from '@/services/todoService';
import { TodoCard } from './TodoCard';
import { useAuth } from '@/contexts/AuthContext';

interface TodoListProps {
  projectId: string;
  canCreate: boolean; // Only admin can create
  canEdit: boolean; // Admin and PM can edit
  canDelete: boolean; // Only admin can delete
}

export const TodoList: React.FC<TodoListProps> = ({
  projectId,
  canCreate,
  canEdit,
  canDelete,
}) => {
  const authContext = useAuth();
  const user = authContext?.user || null;

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTodos();

    // Subscribe to real-time updates
    const unsubscribe = TodoService.subscribeToTodos(projectId, (updatedTodos) => {
      setTodos(updatedTodos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const projectTodos = await TodoService.getTodosByProjectId(projectId);
      setTodos(projectTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      Alert.alert('Error', 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setCreating(true);
      console.log('Creating todo with:', {
        project_id: projectId,
        title: newTodoTitle.trim(),
        created_by: user.id,
        created_by_name: user.name
      });
      
      const todoId = await TodoService.createTodo({
        project_id: projectId,
        title: newTodoTitle.trim(),
        description: '',
        status: 'pending',
        created_by: user.id,
        created_by_name: user.name || 'Unknown',
        images: [],
        comments: [],
        checklist: [],
      });
      
      console.log('Todo created successfully with ID:', todoId);
      
      // Reload todos to ensure it appears
      await loadTodos();
      
      setNewTodoTitle('');
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating todo:', error);
      const errorMessage = error?.message || 'Failed to create todo';
      Alert.alert('Error', `Failed to create todo: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TodoService.deleteTodo(todoId);
              loadTodos();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete todo');
            }
          },
        },
      ]
    );
  };

  const pendingTodos = todos.filter(todo => todo.status === 'pending');
  const inProgressTodos = todos.filter(todo => todo.status === 'in_progress');
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>To-Do List</Text>
        {canCreate && (
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>New Todo</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pending Todos */}
        {pendingTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending ({pendingTodos.length})</Text>
            {pendingTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </View>
        )}

        {/* In Progress Todos */}
        {inProgressTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress ({inProgressTodos.length})</Text>
            {inProgressTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </View>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Completed ({completedTodos.length})
            </Text>
            {completedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={loadTodos}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No todos yet</Text>
            {canCreate && (
              <Text style={styles.emptySubtext}>
                Tap "New Todo" to create your first todo item
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Todo Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Todo</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeModalButton}
                disabled={creating}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
              placeholder="Todo title..."
              placeholderTextColor="#9ca3af"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCancelButton}
                disabled={creating}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTodo}
                style={[styles.modalCreateButton, creating && styles.modalCreateButtonDisabled]}
                disabled={creating || !newTodoTitle.trim()}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalCreateButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeModalButton: {
    padding: 4,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCreateButtonDisabled: {
    opacity: 0.5,
  },
  modalCreateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
