import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { ProjectStep } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectTimelineProps {
  steps: ProjectStep[];
  showLabels?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  steps, 
  showLabels = true 
}) => {
  const { t } = useLanguage();
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const getStepColor = (status: ProjectStep['status']) => {
    switch (status) {
      case 'pending':
        return '#9ca3af'; // Grey for pending
      case 'in_progress':
        return '#f97316'; // Orange for in progress
      case 'finished':
        return '#22c55e'; // Green for finished
      default:
        return '#9ca3af'; // Default grey
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.order_index - b.order_index);
  const totalSteps = sortedSteps.length;
  
  // Calculate percentage per step (each work title gets equal share)
  const stepPercentage = totalSteps > 0 ? 100 / totalSteps : 0;
  
  // Calculate progress width for each step based on status
  const getStepProgressWidth = (status: ProjectStep['status']) => {
    switch (status) {
      case 'finished':
        return stepPercentage; // Full percentage (e.g., 20% if 5 steps)
      case 'in_progress':
        return stepPercentage * 0.5; // Half percentage (e.g., 10% if 5 steps)
      case 'pending':
        return 0; // No progress
      default:
        return 0;
    }
  };

  // Calculate minimum width per step for mobile
  // On mobile, use fixed minimum width to ensure scrollability
  const getStepMinWidth = () => {
    if (IS_MOBILE) {
      // On mobile, use fixed width so it scrolls properly
      if (totalSteps <= 5) {
        return SCREEN_WIDTH / totalSteps - 16; // Fit all on screen if 5 or less
      }
      return 80; // Fixed width for many steps
    }
    return undefined; // Use flex on desktop
  };

  const stepMinWidth = getStepMinWidth();

  return (
    <View style={styles.container}>
      {/* Progress bar showing overall progress - each work title gets equal space */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          {sortedSteps.map((step, index) => {
            const progressWidth = getStepProgressWidth(step.status);
            const color = getStepColor(step.status);
            
            // Calculate fill percentage: finished = 100%, in_progress = 50%, pending = 0%
            const fillPercentage = step.status === 'finished' ? 100 : 
                                   step.status === 'in_progress' ? 50 : 0;
            
            return (
              <View
                key={step.id}
                style={[
                  styles.progressBarSegment,
                  totalSteps > 0 ? {
                    width: `${100 / totalSteps}%`,
                  } : {},
                ]}
              >
                {fillPercentage > 0 && (
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${fillPercentage}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineContainer}
      >
        {sortedSteps.map((step, index) => {
          const color = getStepColor(step.status);
          const isCompleted = step.status === 'finished';
          const isLongName = step.name.length > 12;
          const isLast = index === sortedSteps.length - 1;
          const progressWidth = getStepProgressWidth(step.status);
          
          return (
            <View key={step.id} style={[styles.stepContainer, { flex: 1, minWidth: 0 }]}>
              {/* Arrow-shaped segment */}
              <View style={styles.stepRow}>
                <TouchableOpacity
                  style={styles.stepTouchable}
                  onPress={() => isLongName && setTooltipVisible(tooltipVisible === step.id ? null : step.id)}
                  activeOpacity={isLongName ? 0.7 : 1}
                >
                  <View style={[styles.arrowSegment, { backgroundColor: color }]}>
                    <Text style={styles.stepNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Connection line to next segment (except for last) */}
                {!isLast && (
                  <View style={[styles.connectionLine, { 
                    backgroundColor: step.status === 'finished' ? color : '#e5e7eb',
                    opacity: step.status === 'finished' ? 1 : 0.3,
                  }]} />
                )}
              </View>
              
              {/* Step label */}
              {showLabels && (
                <View style={styles.labelContainer}>
                  <Text style={[styles.stepLabel, { color }]} numberOfLines={2}>
                    {isLongName ? step.name.substring(0, 12) + '...' : step.name}
                  </Text>
                  <Text style={styles.progressLabel}>
                    {progressWidth.toFixed(0)}%
                  </Text>
                </View>
              )}
              
              {/* Tooltip */}
              {tooltipVisible === step.id && isLongName && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{step.name}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingVertical: 8,
  },
  progressBarContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    width: '100%',
    position: 'relative',
  },
  progressBarSegment: {
    height: '100%',
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  timelineScrollView: {
    maxHeight: 120,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    ...(IS_MOBILE ? {} : { width: '100%', justifyContent: 'space-between' }),
  },
  stepContainer: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTouchable: {
    alignItems: 'center',
  },
  arrowSegment: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  connectionLine: {
    width: 24,
    height: 4,
    marginLeft: -1,
    borderRadius: 2,
    alignSelf: 'center',
  },
  labelContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
    maxWidth: 80,
    alignItems: 'center',
  },
  labelContainerCompact: {
    maxWidth: 60,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
  stepLabelCompact: {
    fontSize: 9,
    lineHeight: 11,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: -40,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
    minWidth: 120,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});