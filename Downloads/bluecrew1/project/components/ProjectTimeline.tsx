import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStep } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectTimelineProps {
  steps: ProjectStep[];
  showLabels?: boolean;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  steps, 
  showLabels = true 
}) => {
  const { t } = useLanguage();

  const getStepColor = (status: ProjectStep['status']) => {
    switch (status) {
      case 'completed':
        return '#236ecf'; // BlueCrew primary blue
      case 'ongoing':
        return '#236ecf'; // BlueCrew primary blue
      case 'pending':
        return '#b8860b'; // Dark yellow
      default:
        return '#d1d5db';
    }
  };

  const getStepBackgroundColor = (status: ProjectStep['status']) => {
    switch (status) {
      case 'completed':
        return '#236ecf20';
      case 'ongoing':
        return '#236ecf20';
      case 'pending':
        return '#b8860b20';
      default:
        return '#f3f4f6';
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.order_index - b.order_index);

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        {sortedSteps.slice(0, 3).map((step, index) => {
          const color = getStepColor(step.status);
          
          return (
            <View key={step.id} style={styles.stepWrapper}>
              <View 
                style={[
                  styles.stepCircle, 
                  { 
                    backgroundColor: color,
                    borderColor: color 
                  }
                ]}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              {showLabels && (
                <Text style={[styles.stepText, { color }]} numberOfLines={1}>
                  {step.name.length > 8 ? step.name.substring(0, 8) + '...' : step.name}
                </Text>
              )}
            </View>
          );
        })}
        {sortedSteps.length > 3 && (
          <View style={styles.moreSteps}>
            <Text style={styles.moreText}>+{sortedSteps.length - 3}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    maxWidth: '30%',
    minHeight: 60,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 6,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
    maxWidth: '100%',
  },
  moreSteps: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: '25%',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});