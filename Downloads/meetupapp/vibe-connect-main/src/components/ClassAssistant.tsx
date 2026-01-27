import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  useMarkAttendance, 
  useSendPaymentReminder, 
  useCheckPaymentStatus, 
  useGetClassMaterials,
  getAnswerFromMaterials, 
  checkMessageModeration 
} from '@/hooks/useClassAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ClassAssistantProps {
  classId: string;
  classTitle?: string;
  isClassStarted?: boolean;
  onSendMessage?: (message: string, actionButton?: any) => void;
}

const ClassAssistant = ({
  classId,
  classTitle,
  isClassStarted = false,
  onSendMessage,
}: ClassAssistantProps) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [paymentReminded, setPaymentReminded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | null>(null);

  const markAttendance = useMarkAttendance();
  const checkPayment = useCheckPaymentStatus();
  const getMaterials = useGetClassMaterials();
  const sendPaymentReminder = useSendPaymentReminder();

  // Load class materials on mount
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await getMaterials.mutateAsync(classId);
        setMaterials(data);
      } catch (error) {
        console.error('Failed to load class materials:', error);
      }
    };
    loadMaterials();
  }, [classId]);

  // Check payment status on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const checkStatus = async () => {
      try {
        const status = await checkPayment.mutateAsync({ userId: user.id, classId });
        setPaymentStatus(status.status);
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    };
    checkStatus();
  }, [user?.id, classId]);

  // Send attendance reminder when class starts
  useEffect(() => {
    if (isClassStarted && !attendanceMarked && onSendMessage) {
      const attendanceMessage = "Class is starting! Please mark your attendance by clicking the button below.";
      onSendMessage(attendanceMessage, {
        emoji: '✅',
        label: "I'm Here",
        command: 'mark_attendance',
        data: { classId },
      });
    }
  }, [isClassStarted, attendanceMarked, classId, onSendMessage]);

  // Send payment reminder for unpaid users
  useEffect(() => {
    if (paymentStatus === 'unpaid' && !paymentReminded && onSendMessage) {
      const paymentMessage = "Your payment for this class is pending. Complete your payment to continue accessing all materials.";
      onSendMessage(paymentMessage, {
        emoji: '💳',
        label: 'Pay Now',
        command: 'initiate_payment',
        data: { classId },
      });
      setPaymentReminded(true);
    }
  }, [paymentStatus, paymentReminded, classId, onSendMessage]);

  const handleMarkAttendance = async () => {
    if (!user?.id) return;

    try {
      // Determine if late (more than 5 minutes after class start)
      const status = 'present'; // Can be enhanced to check actual time
      await markAttendance.mutateAsync({ classId, status });
      setAttendanceMarked(true);
      toast.success('Attendance marked!');
      
      if (onSendMessage) {
        onSendMessage('Thank you! Your attendance has been recorded.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance');
    }
  };

  const handlePaymentReminder = async () => {
    if (!user?.id) return;

    try {
      await sendPaymentReminder.mutateAsync({ userId: user.id, classId });
      toast.info('Payment reminder sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reminder');
    }
  };

  // Process incoming messages and provide AI responses
  const processMessage = async (message: string, senderId: string): Promise<{
    response?: string;
    actionButton?: any;
    escalate?: boolean;
  }> => {
    // Check moderation
    const moderation = checkMessageModeration(message, classTitle);
    if (moderation.needsModeration) {
      const warningMessages = {
        spam: "Let's keep our discussion focused and avoid repetitive messages.",
        profanity: "Please maintain a respectful tone in our class discussions.",
        off_topic: "Let's keep our discussion focused on the class topic. Feel free to ask questions about today's lesson!",
      };
      
      return {
        response: warningMessages[moderation.reason!],
      };
    }

    // Try to answer from materials
    if (materials) {
      const answer = getAnswerFromMaterials(message, materials);
      if (answer) {
        return {
          response: answer.answer,
          actionButton: {
            emoji: '📎',
            label: 'Materials',
            command: 'view_materials',
            data: { classId },
          },
        };
      }
    }

    // If no answer found, escalate to teacher
    return {
      response: "I don't see this information in the class materials. Let me connect you with the teacher for clarification.",
      actionButton: {
        emoji: '🙋‍♂️',
        label: 'Ask Teacher',
        command: 'escalate_to_teacher',
        data: { classId, userId: senderId, message },
      },
      escalate: true,
    };
  };

  // Expose processMessage function for parent component
  useEffect(() => {
    if (onSendMessage) {
      // This will be called from ChatPage when messages arrive
      (window as any).classAssistantProcessMessage = processMessage;
    }
  }, [materials, classTitle]);

  return null; // This component works behind the scenes
};

export default ClassAssistant;
