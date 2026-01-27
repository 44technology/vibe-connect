import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Export hooks as named exports for easier use
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ classId, status }: { classId: string; status: 'present' | 'late' | 'absent' }) => {
      const response = await apiRequest<{ success: boolean; data: AttendanceStatus }>(
        `${API_ENDPOINTS.CLASSES.DETAIL(classId)}/attendance`,
        {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id,
            status,
            timestamp: new Date().toISOString(),
          }),
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class', variables.classId, 'attendance'] });
    },
  });
};

export const useSendPaymentReminder = () => {
  return useMutation({
    mutationFn: async ({ userId, classId }: { userId: string; classId: string }) => {
      const response = await apiRequest<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.CLASSES.DETAIL(classId)}/payment-reminder`,
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );
      return response;
    },
  });
};

export const useCheckPaymentStatus = () => {
  return useMutation({
    mutationFn: async ({ userId, classId }: { userId: string; classId: string }): Promise<PaymentStatus> => {
      const response = await apiRequest<{ success: boolean; data: PaymentStatus }>(
        `${API_ENDPOINTS.CLASSES.DETAIL(classId)}/payment-status/${userId}`
      );
      return response.data;
    },
  });
};

export const useGetClassMaterials = () => {
  return useMutation({
    mutationFn: async (classId: string): Promise<ClassMaterials> => {
      const response = await apiRequest<{ success: boolean; data: ClassMaterials }>(
        `${API_ENDPOINTS.CLASSES.DETAIL(classId)}/materials`
      );
      return response.data;
    },
  });
};

export const useEscalateToTeacher = () => {
  return useMutation({
    mutationFn: async ({ classId, userId, message, reason }: { 
      classId: string; 
      userId: string; 
      message: string; 
      reason: string;
    }) => {
      const response = await apiRequest<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.CLASSES.DETAIL(classId)}/escalate`,
        {
          method: 'POST',
          body: JSON.stringify({ userId, message, reason }),
        }
      );
      return response;
    },
  });
};

// Re-export for convenience
export const useClassAssistant = {
  useMarkAttendance,
  useSendPaymentReminder,
  useCheckPaymentStatus,
  useGetClassMaterials,
  useEscalateToTeacher,
};

export interface ClassMaterials {
  title: string;
  outline: string[];
  rules: string[];
  faq: Array<{ question: string; answer: string }>;
  materials: Array<{ id: string; name: string; url: string; type: string }>;
}

export interface AttendanceStatus {
  userId: string;
  timestamp: string;
  status: 'present' | 'late' | 'absent';
}

export interface PaymentStatus {
  userId: string;
  classId: string;
  status: 'paid' | 'unpaid';
  lastReminder?: string;
}

export interface AssistantMessage {
  id: string;
  content: string;
  actionButton?: {
    emoji: string;
    label: string;
    command: string;
    data?: any;
  };
  type: 'attendance' | 'payment' | 'support' | 'moderation';
  timestamp: string;
}

// Check if message contains spam/profanity/off-topic
export const checkMessageModeration = (message: string, classTopic?: string): {
  needsModeration: boolean;
  reason?: 'spam' | 'profanity' | 'off_topic';
} => {
  const lowerMessage = message.toLowerCase();
  
  // Profanity check (basic - can be enhanced with a library)
  const profanityWords = ['bad', 'word', 'list']; // Replace with actual profanity list
  const hasProfanity = profanityWords.some(word => lowerMessage.includes(word));
  
  // Spam check (repeated characters/words)
  const repeatedChars = /(.)\1{4,}/.test(message);
  const repeatedWords = /\b(\w+)\s+\1\s+\1/.test(lowerMessage);
  const isSpam = repeatedChars || repeatedWords || message.length > 500;
  
  // Off-topic check (basic keyword matching - can be enhanced with AI)
  const isOffTopic = classTopic 
    ? !lowerMessage.includes(classTopic.toLowerCase()) && 
      !lowerMessage.match(/\b(class|lesson|homework|assignment|teacher|question|help)\b/)
    : false;
  
  if (hasProfanity) {
    return { needsModeration: true, reason: 'profanity' };
  }
  
  if (isSpam) {
    return { needsModeration: true, reason: 'spam' };
  }
  
  if (isOffTopic) {
    return { needsModeration: true, reason: 'off_topic' };
  }
  
  return { needsModeration: false };
};

// Get answer from class materials
export const getAnswerFromMaterials = (
  question: string,
  materials: ClassMaterials
): { answer: string; source: string } | null => {
  const lowerQuestion = question.toLowerCase();
  
  // Check FAQ
  for (const faqItem of materials.faq) {
    if (lowerQuestion.includes(faqItem.question.toLowerCase()) || 
        faqItem.question.toLowerCase().includes(lowerQuestion)) {
      return {
        answer: faqItem.answer,
        source: 'FAQ'
      };
    }
  }
  
  // Check outline
  for (const outlineItem of materials.outline) {
    if (lowerQuestion.includes(outlineItem.toLowerCase()) || 
        outlineItem.toLowerCase().includes(lowerQuestion)) {
      return {
        answer: `According to the course outline: ${outlineItem}`,
        source: 'Course Outline'
      };
    }
  }
  
  // Check rules
  for (const rule of materials.rules) {
    if (lowerQuestion.includes(rule.toLowerCase()) || 
        rule.toLowerCase().includes(lowerQuestion)) {
      return {
        answer: `As per class rules: ${rule}`,
        source: 'Class Rules'
      };
    }
  }
  
  // Check materials
  for (const material of materials.materials) {
    if (lowerQuestion.includes(material.name.toLowerCase()) || 
        material.name.toLowerCase().includes(lowerQuestion)) {
      return {
        answer: `You can find information about this in the materials section: ${material.name}`,
        source: 'Materials'
      };
    }
  }
  
  return null;
};
