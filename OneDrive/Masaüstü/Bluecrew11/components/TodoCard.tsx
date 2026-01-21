import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  Plus,
  X,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Pencil,
} from 'lucide-react-native';
import { TodoItem, TodoComment, TodoChecklistItem } from '@/types';
import { TodoService } from '@/services/todoService';
import { ImageDrawing } from './ImageDrawing';
import { useAuth } from '@/contexts/AuthContext';

interface TodoCardProps {
  todo: TodoItem;
  onUpdate: () => void;
  canEdit: boolean; // Admin can edit, PM can mark complete
  canDelete: boolean; // Only admin can delete
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onUpdate,
  canEdit,
  canDelete,
}) => {
  const authContext = useAuth();
  const user = authContext?.user || null;
  const userRole = authContext?.userRole || 'admin';

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState(todo.description || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageForDrawing, setSelectedImageForDrawing] = useState<string | null>(null);
  const [drawingImageUrl, setDrawingImageUrl] = useState<string | null>(null);
  const [drawingData, setDrawingData] = useState<string | undefined>(undefined);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const asset = result.assets[0];
        
        // Convert to File/Blob
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });

        await TodoService.uploadTodoImage(
          todo.id,
          file,
          `image_${Date.now()}.jpg`,
          user?.id || '',
          user?.name || 'Unknown'
        );

        setUploadingImage(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TodoService.deleteTodoImage(todo.id, imageId);
              onUpdate();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await TodoService.addComment(todo.id, {
        user_id: user?.id || '',
        user_name: user?.name || 'Unknown',
        comment: newComment.trim(),
      });
      setNewComment('');
      setShowCommentModal(false);
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    try {
      await TodoService.addChecklistItem(todo.id, {
        text: newChecklistItem.trim(),
        completed: false,
      });
      setNewChecklistItem('');
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to add checklist item');
    }
  };

  const handleToggleChecklistItem = async (itemId: string, currentStatus: boolean) => {
    try {
      await TodoService.updateChecklistItem(todo.id, itemId, {
        completed: !currentStatus,
        completed_by: !currentStatus ? (user?.id || '') : undefined,
        completed_by_name: !currentStatus ? (user?.name || 'Unknown') : undefined,
        completed_at: !currentStatus ? new Date().toISOString() : undefined,
      });
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to update checklist item');
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      await TodoService.deleteChecklistItem(todo.id, itemId);
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete checklist item');
    }
  };

  const handleSaveDescription = async () => {
    try {
      await TodoService.updateTodo(todo.id, { description });
      setEditingDescription(false);
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to save description');
    }
  };

  const handleCompleteTodo = async () => {
    try {
      await TodoService.completeTodo(
        todo.id,
        user?.id || '',
        user?.name || 'Unknown'
      );
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete todo');
    }
  };

  const handleOpenDrawing = (imageUrl: string, existingDrawingData?: string) => {
    setDrawingImageUrl(imageUrl);
    setDrawingData(existingDrawingData);
    setSelectedImageForDrawing(imageUrl);
  };

  const handleSaveDrawing = async (drawingData: string) => {
    if (!selectedImageForDrawing || !todo.images) return;

    const image = todo.images.find(img => img.url === selectedImageForDrawing);
    if (image) {
      try {
        await TodoService.updateImageDrawing(todo.id, image.id, drawingData);
        setSelectedImageForDrawing(null);
        setDrawingImageUrl(null);
        setDrawingData(undefined);
        onUpdate();
      } catch (error) {
        Alert.alert('Error', 'Failed to save drawing');
      }
    }
  };

  const completedChecklistCount = todo.checklist?.filter(item => item.completed).length || 0;
  const totalChecklistCount = todo.checklist?.length || 0;
  
  // PM can only toggle checklist items, not add or delete
  const canManageChecklist = userRole === 'admin';
  const canToggleChecklist = canEdit; // Both admin and PM can toggle
  const canEditDescription = userRole === 'admin'; // Only admin can edit description
  const canManageImages = userRole === 'admin'; // Only admin can add/delete images

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {canEdit && userRole === 'pm' && todo.status !== 'completed' && (
            <TouchableOpacity
              onPress={handleCompleteTodo}
              style={styles.completeButton}
            >
              <CheckCircle2 size={24} color="#10b981" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{todo.title}</Text>
        </View>
        {todo.status === 'completed' && (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={16} color="#10b981" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        {editingDescription && canEditDescription ? (
          <View>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Add description..."
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                onPress={handleSaveDescription}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditingDescription(false);
                  setDescription(todo.description || '');
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {todo.description || 'No description'}
            </Text>
            {canEditDescription && (
              <TouchableOpacity
                onPress={() => setEditingDescription(true)}
                style={styles.editIcon}
              >
                <Pencil size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Images */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Images</Text>
          {canManageImages && (
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles.addButton}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <>
                  <Plus size={16} color="#3b82f6" />
                  <Text style={styles.addButtonText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        {todo.images && todo.images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {todo.images.map((image) => (
              <View key={image.id} style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {image.drawing_data && (
                  <View style={styles.drawingIndicator}>
                    <Pencil size={12} color="#fff" />
                  </View>
                )}
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    onPress={() => handleOpenDrawing(image.url, image.drawing_data)}
                    style={styles.imageActionButton}
                  >
                    <Pencil size={16} color="#fff" />
                  </TouchableOpacity>
                  {canManageImages && (
                    <TouchableOpacity
                      onPress={() => handleDeleteImage(image.id)}
                      style={styles.imageActionButton}
                    >
                      <Trash2 size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No images</Text>
        )}
      </View>

      {/* Checklist */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Checklist ({completedChecklistCount}/{totalChecklistCount})
          </Text>
          {canManageChecklist && (
            <TouchableOpacity
              onPress={handleAddChecklistItem}
              style={styles.addButton}
            >
              <Plus size={16} color="#3b82f6" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        {todo.checklist && todo.checklist.length > 0 ? (
          <View style={styles.checklistContainer}>
            {todo.checklist.map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <TouchableOpacity
                  onPress={() => canToggleChecklist && handleToggleChecklistItem(item.id, item.completed)}
                  style={styles.checkbox}
                  disabled={!canToggleChecklist}
                >
                  {item.completed ? (
                    <CheckSquare size={20} color="#10b981" />
                  ) : (
                    <Square size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.checklistText,
                    item.completed && styles.checklistTextCompleted,
                  ]}
                >
                  {item.text}
                </Text>
                {canManageChecklist && (
                  <TouchableOpacity
                    onPress={() => handleDeleteChecklistItem(item.id)}
                    style={styles.deleteChecklistButton}
                  >
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No checklist items</Text>
        )}
      </View>

      {/* Comments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Comments ({todo.comments?.length || 0})
          </Text>
          <TouchableOpacity
            onPress={() => setShowCommentModal(true)}
            style={styles.addButton}
          >
            <MessageSquare size={16} color="#3b82f6" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {todo.comments && todo.comments.length > 0 ? (
          <View style={styles.commentsContainer}>
            {todo.comments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                <Text style={styles.commentText}>{comment.comment}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No comments</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Created by {todo.created_by_name}
        </Text>
        <Text style={styles.footerText}>
          {new Date(todo.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TouchableOpacity
                onPress={() => setShowCommentModal(false)}
                style={styles.closeModalButton}
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              placeholder="Write a comment..."
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowCommentModal(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddComment}
                style={styles.modalSaveButton}
                disabled={!newComment.trim()}
              >
                <Text style={styles.modalSaveButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Drawing Modal */}
      {drawingImageUrl && (
        <ImageDrawing
          imageUrl={drawingImageUrl}
          drawingData={drawingData}
          onSave={handleSaveDrawing}
          onClose={() => {
            setSelectedImageForDrawing(null);
            setDrawingImageUrl(null);
            setDrawingData(undefined);
          }}
          visible={selectedImageForDrawing !== null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  completeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
  },
  addButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  editIcon: {
    padding: 4,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  imagesContainer: {
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  drawingIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  imageActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    gap: 4,
  },
  imageActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 4,
  },
  checklistContainer: {
    marginTop: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  checkbox: {
    padding: 4,
  },
  checklistText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  deleteChecklistButton: {
    padding: 4,
  },
  commentsContainer: {
    marginTop: 8,
  },
  comment: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 11,
    color: '#9ca3af',
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
    maxHeight: '80%',
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
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
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
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
