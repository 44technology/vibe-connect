import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Calendar, Clock, User, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { ProjectTimeline } from './ProjectTimeline';
import { Project } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onDelete, 
  onEdit 
}) => {
  const { t } = useLanguage();
  const { userRole } = useAuth();

  const handleCardPress = () => {
    router.push(`/(tabs)/project/${project.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysUntilDeadline = () => {
    const today = new Date();
    const deadline = new Date(project.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft <= 7 && daysLeft >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.category}>{t(project.category)}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>
        </View>
        {userRole === 'pm' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit?.(project)}>
              <Edit3 size={18} color="#236ecf" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {project.steps && project.steps.length > 0 && (
        <View style={styles.timelineContainer}>
          <ProjectTimeline steps={project.steps} showLabels={true} />
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${project.progress_percentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{project.progress_percentage}%</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {formatDate(project.start_date)} - {formatDate(project.deadline)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#6b7280'} />
          <Text style={[
            styles.detailText,
            { color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#6b7280' }
          ]}>
            {isOverdue 
              ? `${Math.abs(daysLeft)} days overdue`
              : daysLeft === 0 
                ? 'Due today'
                : `${daysLeft} days left`
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#236ecf',
    maxWidth: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  titleSection: {
    flex: 1,
    minWidth: '65%',
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 3,
    lineHeight: 18,
  },
  category: {
    fontSize: 10,
    color: '#b8860b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f9fafb',
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#b8860b30',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#236ecf',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#236ecf',
    minWidth: 30,
    textAlign: 'right',
  },
  details: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    flexWrap: 'wrap',
  },
  timelineContainer: {
    marginBottom: 6,
    overflow: 'hidden',
  },
});