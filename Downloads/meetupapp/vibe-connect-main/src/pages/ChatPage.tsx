import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Phone, Video, Send, Mic, MapPin, Calendar, Clock, ChevronRight, X, Star, GraduationCap, MessageCircle, Plus, Users, Sparkles, CheckCircle2, Info, ArrowRight, MessageSquare, Camera, Box, Eye, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { venues } from '@/data/mockData';
import { toast } from 'sonner';
import { useChats, useChat, useMessages, useChatSocket, useCreateDirectChat, useSendMessage, Message } from '@/hooks/useChat';
import { apiRequest, API_ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/hooks/useClasses';
import { useMeetups } from '@/hooks/useMeetups';
import { useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { useMarkAttendance, useCheckPaymentStatus, useEscalateToTeacher } from '@/hooks/useClassAssistant';
import ClassAssistant from '@/components/ClassAssistant';

const chats = [
  {
    id: '1',
    name: 'Sarah M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    lastMessage: 'See you at the coffee shop! ☕',
    time: '2m ago',
    unread: 2,
    type: 'friendme',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Coffee Enthusiasts Group',
    avatar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150',
    lastMessage: 'Mike: Who else is coming Saturday?',
    time: '15m ago',
    unread: 5,
    type: 'group',
    members: 6,
  },
  {
    id: '3',
    name: 'James K.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    lastMessage: 'Great tennis match yesterday!',
    time: '1h ago',
    unread: 0,
    type: 'friendme',
    isOnline: false,
  },
];

const venueTypes = [
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'bar', label: 'Bar', emoji: '🍸' },
  { id: 'park', label: 'Park', emoji: '🌳' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
];

// Sample menu items for restaurants
const sampleMenuItems = [
  {
    id: '1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce',
    price: 28,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    arModel: '/models/salmon.glb',
    ingredients: ['Salmon', 'Lemon', 'Butter', 'Herbs', 'Olive Oil'],
    calories: 420,
    category: 'Main Course',
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan and croutons',
    price: 16,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    arModel: '/models/caesar.glb',
    ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
    calories: 280,
    category: 'Salad',
  },
  {
    id: '3',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    price: 12,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    arModel: '/models/cake.glb',
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour'],
    calories: 450,
    category: 'Dessert',
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella and basil',
    price: 18,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    arModel: '/models/pizza.glb',
    ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'],
    calories: 320,
    category: 'Main Course',
  },
  {
    id: '5',
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 22,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    arModel: '/models/burger.glb',
    ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Onion', 'Special Sauce'],
    calories: 580,
    category: 'Main Course',
  },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showReadyToMeet, setShowReadyToMeet] = useState(false);
  const [meetStep, setMeetStep] = useState<'datetime' | 'venuetype' | 'venue'>('datetime');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedVenueType, setSelectedVenueType] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<Array<{id: string; content: string; actionButton?: any}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats from backend
  const { data: backendChats, isLoading: chatsLoading } = useChats();
  const { data: chatData } = useChat(selectedChat);
  const { data: messagesData = [] } = useMessages(selectedChat);
  const sendMessageMutation = useSendMessage();
  
  // Fetch enrolled classes for class chats
  const { data: enrolledClasses } = useClasses(undefined, undefined, undefined, undefined, true);
  
  // Fetch joined meetups for meetup chats
  const { data: joinedMeetups } = useMeetups();

  // Class Assistant hooks (must be at component level)
  const markAttendanceMutation = useMarkAttendance();
  const checkPaymentMutation = useCheckPaymentStatus();
  const escalateMutation = useEscalateToTeacher();

  // Real-time socket connection
  const { sendMessage: sendSocketMessage } = useChatSocket(selectedChat, (newMessage) => {
    // Message received via socket, will be updated by React Query
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // Use backend chats if available, otherwise use mock data
  const allChats = backendChats && backendChats.length > 0
    ? backendChats.map((chat: any) => {
        const otherMember = chat.members?.find((m: any) => m.user.id !== user?.id);
        const lastMessage = chat.messages?.[0];
        return {
          id: chat.id,
          name: chat.type === 'direct' 
            ? (otherMember?.user.displayName || `${otherMember?.user.firstName} ${otherMember?.user.lastName}`)
            : chat.name || chat.meetup?.title || chat.class?.title || 'Group Chat',
          avatar: chat.type === 'direct' 
            ? (otherMember?.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
            : (chat.meetup?.image || chat.class?.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150'),
          lastMessage: lastMessage?.content || 'No messages yet',
          time: lastMessage?.createdAt ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true }) : '',
          unread: 0, // TODO: Calculate unread count
          type: chat.type === 'direct' ? 'friendme' : (chat.meetup ? 'vibe' : chat.class ? 'class' : 'group'),
          isOnline: false, // TODO: Check online status
          members: chat.members?.length || 0,
          meetup: chat.meetup,
          class: chat.class,
        };
      })
    : chats;
  
  // Add class chats from enrolled classes
  const classChats = enrolledClasses?.map((classItem: any) => {
    // Find existing chat for this class, or create a placeholder
    const existingChat = allChats.find((c: any) => c.class?.id === classItem.id);
    if (existingChat) return existingChat;
    
    return {
      id: `class-${classItem.id}`,
      name: classItem.title || 'Class Chat',
      avatar: classItem.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150',
      lastMessage: 'No messages yet',
      time: '',
      unread: 0,
      type: 'class',
      isOnline: false,
      members: classItem._count?.enrollments || 0,
      class: classItem,
    };
  }) || [];
  
  // Add meetup chats from joined meetups
  const meetupChats = joinedMeetups?.map((meetup: any) => {
    // Find existing chat for this meetup, or create a placeholder
    const existingChat = allChats.find((c: any) => c.meetup?.id === meetup.id);
    if (existingChat) return existingChat;
    
    return {
      id: `meetup-${meetup.id}`,
      name: meetup.title || 'Vibe Chat',
      avatar: meetup.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150',
      lastMessage: 'No messages yet',
      time: '',
      unread: 0,
      type: 'vibe',
      isOnline: false,
      members: meetup._count?.members || 0,
      meetup: meetup,
    };
  }) || [];
  
  // Combine all chats
  const combinedChats = [
    ...allChats.filter((c: any) => c.type === 'friendme'),
    ...allChats.filter((c: any) => c.type === 'group' && !c.meetup && !c.class),
    ...meetupChats,
    ...classChats,
  ];

  const currentChat = combinedChats.find(c => c.id === selectedChat) || allChats.find(c => c.id === selectedChat);
  const isDirectChat = chatData?.type === 'direct';
  
  // Check if current chat is a class chat
  const isClassChat = currentChat?.type === 'class' || currentChat?.class;
  const isVibeChat = currentChat?.type === 'vibe' || currentChat?.meetup;
  const classId = currentChat?.class?.id;
  
  // Get other user for direct chat
  const otherUser = chatData?.type === 'direct' 
    ? chatData.members?.find((m: any) => m.user.id !== user?.id)?.user 
    : null;
  
  // Check if there's already a meetup request in this chat
  const hasPendingRequest = useMemo(() => {
    if (!messagesData || messagesData.length === 0) return false;
    // Check if there's a meetup request message from current user
    return messagesData.some((msg: Message) => 
      msg.senderId === user?.id && 
      msg.content.includes('📍 Meetup Request:') &&
      !msg.content.includes('✅ Accepted') &&
      !msg.content.includes('❌ Declined')
    );
  }, [messagesData, user?.id]);
  
  // Check URL params for meetupId, classId, or chatId and auto-select chat
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meetupId = params.get('meetupId');
    const classId = params.get('classId');
    const chatId = params.get('chatId');
    
    // If chatId is provided, select that chat directly
    if (chatId) {
      setSelectedChat(chatId);
      return;
    }
    
    if (meetupId && meetupChats.length > 0) {
      // Try to find existing chat for this meetup
      const meetupChat = meetupChats.find((c: any) => c.meetup?.id === meetupId);
      if (meetupChat && !meetupChat.id.startsWith('meetup-')) {
        setSelectedChat(meetupChat.id);
      }
    }
    
    if (classId && classChats.length > 0) {
      // Try to find existing chat for this class
      const classChat = classChats.find((c: any) => c.class?.id === classId);
      if (classChat && !classChat.id.startsWith('class-')) {
        setSelectedChat(classChat.id);
      }
    }
  }, [meetupChats, classChats]);
  
  // Check if this is a blind meetup chat
  const isBlindMeetupChat = chatData?.meetup?.isBlindMeet || false;
  
  // Check if meetup details should be revealed (2 hours before)
  const shouldRevealBlindDetails = () => {
    if (!isBlindMeetupChat || !chatData?.meetup?.startTime) return false;
    const startTime = new Date(chatData.meetup.startTime);
    const now = new Date();
    const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    return now >= twoHoursBefore;
  };
  
  const revealBlindDetails = shouldRevealBlindDetails();
  
  // Filter venues by selected type
  const filteredVenues = selectedVenueType 
    ? venues.filter(v => v.category.toLowerCase().includes(selectedVenueType.toLowerCase()))
    : venues;

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !isAuthenticated) return;

    try {
      // If this is a class chat, process message with AI assistant
      if (isClassChat && classId && (window as any).classAssistantProcessMessage) {
        const result = await (window as any).classAssistantProcessMessage(message.trim(), user?.id);
        
        // If moderation needed, show warning and don't send
        if (result.response && !result.escalate) {
          // This is a moderation warning, show it as assistant message
          const assistantMsg = {
            id: `assistant-${Date.now()}`,
            content: result.response,
            actionButton: result.actionButton,
          };
          setAssistantMessages(prev => [...prev, assistantMsg]);
          setMessage('');
          return;
        }
      }

      // Send via socket for real-time
      sendSocketMessage(message.trim());
      
      // Also send via REST API as backup
      await sendMessageMutation.mutateAsync({
        chatId: selectedChat,
        content: message.trim(),
      });

      // Process with AI assistant for class chats
      if (isClassChat && classId && (window as any).classAssistantProcessMessage) {
        setTimeout(async () => {
          const result = await (window as any).classAssistantProcessMessage(message.trim(), user?.id);
          if (result.response) {
            const assistantMsg = {
              id: `assistant-${Date.now()}`,
              content: result.response,
              actionButton: result.actionButton,
            };
            setAssistantMessages(prev => [...prev, assistantMsg]);
            
            // Send assistant response as a message
            if (result.escalate && result.actionButton) {
              // Escalate to teacher
              const escalateMutation = useClassAssistant.useEscalateToTeacher();
              await escalateMutation.mutateAsync({
                classId,
                userId: user?.id || '',
                message: message.trim(),
                reason: 'Information not in materials',
              });
            }
          }
        }, 1000);
      }

      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleAssistantAction = async (action: string, data?: any) => {
    switch (action) {
      case 'mark_attendance':
        if (data?.classId) {
          await markAttendanceMutation.mutateAsync({ classId: data.classId, status: 'present' });
          toast.success('Attendance marked!');
        }
        break;
      case 'initiate_payment':
        // Navigate to payment page or open payment dialog
        if (data?.classId) {
          navigate(`/class/${data.classId}?payment=true`);
        }
        break;
      case 'view_materials':
        if (data?.classId) {
          navigate(`/class/${data.classId}?tab=materials`);
        }
        break;
      case 'escalate_to_teacher':
        toast.info('Your question has been forwarded to the teacher.');
        break;
    }
  };

  if (selectedChat && currentChat) {
    return (
      <MobileLayout hideNav>
        <div className="min-h-screen flex flex-col">
          {/* Chat header */}
          <div className="sticky top-0 z-40 glass safe-top">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.button
                  onClick={() => setSelectedChat(null)}
                  className="text-foreground font-medium flex-shrink-0"
                  whileTap={{ scale: 0.95 }}
                >
                  ←
                </motion.button>
                
                {/* Class/Vibe/Profile Link */}
                {isClassChat && currentChat?.class?.id ? (
                  <motion.button
                    onClick={() => navigate(`/class/${currentChat.class.id}`)}
                    className="flex items-center gap-2 flex-1 min-w-0"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs text-muted-foreground">Class</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {currentChat.class.title || currentChat.name}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ) : isVibeChat && currentChat?.meetup?.id ? (
                  <motion.button
                    onClick={() => navigate(`/meetup/${currentChat.meetup.id}`)}
                    className="flex items-center gap-2 flex-1 min-w-0"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs text-muted-foreground">Vibe</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {currentChat.meetup.title || currentChat.name}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ) : isDirectChat && otherUser ? (
                  <motion.button
                    onClick={() => navigate(`/user/${otherUser.id}`)}
                    className="flex items-center gap-2 flex-1 min-w-0"
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserAvatar 
                      src={isBlindMeetupChat && !revealBlindDetails
                        ? undefined
                        : otherUser.avatar || currentChat.avatar
                      } 
                      alt={isBlindMeetupChat && !revealBlindDetails
                        ? 'Anonymous'
                        : otherUser.displayName || `${otherUser.firstName} ${otherUser.lastName}` || currentChat.name
                      } 
                      size="sm"
                      isOnline={currentChat.isOnline}
                      className={isBlindMeetupChat && !revealBlindDetails ? 'blur-md' : ''}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs text-muted-foreground">Profile</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {isBlindMeetupChat && !revealBlindDetails
                          ? 'Anonymous'
                          : otherUser.displayName || `${otherUser.firstName} ${otherUser.lastName}` || currentChat.name
                        }
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <UserAvatar 
                      src={currentChat.avatar} 
                      alt={currentChat.name} 
                      size="sm"
                      isOnline={currentChat.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-foreground truncate">{currentChat.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {currentChat.isOnline ? 'Online' : chatData?.type === 'group' ? `${chatData.members?.length || 0} members` : 'Offline'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isDirectChat && (
                  <motion.button 
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReadyToMeet(true)}
                  >
                    <MapPin className="w-4 h-4" />
                    Ready to Meet
                  </motion.button>
                )}
                <motion.button className="p-2" whileTap={{ scale: 0.9 }}>
                  <Phone className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button className="p-2" whileTap={{ scale: 0.9 }}>
                  <Video className="w-5 h-5 text-primary" />
                </motion.button>
                <motion.button className="p-2" whileTap={{ scale: 0.9 }}>
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Assistant Messages */}
            {assistantMessages.map((assistantMsg) => (
              <motion.div
                key={assistantMsg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl px-4 py-2 max-w-[75%] bg-primary/10 border border-primary/20 rounded-tl-md">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium text-primary">Ulikme Class Assistant</p>
                  </div>
                  <p className="text-foreground text-sm mb-2">{assistantMsg.content}</p>
                  {assistantMsg.actionButton && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleAssistantAction(assistantMsg.actionButton.command, assistantMsg.actionButton.data)}
                    >
                      <span className="mr-1">{assistantMsg.actionButton.emoji}</span>
                      {assistantMsg.actionButton.label}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
            
            {messagesData.length === 0 && assistantMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messagesData.map((msg: Message) => {
                const isOwnMessage = msg.senderId === user?.id;
                const isMeetupRequest = msg.content.includes('📍 Meetup Request:');
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-2xl px-4 py-2 max-w-[75%] ${
                      isMeetupRequest
                        ? isOwnMessage
                          ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-tr-md border-2 border-primary/30'
                          : 'bg-gradient-to-r from-muted to-muted/80 border-2 border-primary/20 rounded-tl-md'
                        : isOwnMessage 
                          ? 'bg-primary text-primary-foreground rounded-tr-md' 
                          : 'bg-muted rounded-tl-md'
                    }`}>
                      {!isOwnMessage && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {isBlindMeetupChat && !revealBlindDetails
                            ? 'Anonymous'
                            : (msg.sender.displayName || `${msg.sender.firstName} ${msg.sender.lastName}`)
                          }
                        </p>
                      )}
                      {isMeetupRequest && (
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className={`w-4 h-4 ${isOwnMessage ? 'text-primary-foreground' : 'text-primary'}`} />
                          <span className={`text-xs font-semibold ${isOwnMessage ? 'text-primary-foreground' : 'text-primary'}`}>
                            Meetup Request
                          </span>
                        </div>
                      )}
                      {msg.image && (
                        <img src={msg.image} alt="Message" className="rounded-lg mb-2 max-w-full" />
                      )}
                      <p className={`whitespace-pre-line ${isOwnMessage ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="sticky bottom-0 glass safe-bottom">
            <div className="flex items-center gap-2 px-4 py-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 h-12 px-4 rounded-full bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={sendMessageMutation.isPending}
              />
              <motion.button 
                className="p-2"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // TODO: Implement voice recording
                  console.log('Start voice recording');
                }}
              >
                <Mic className="w-6 h-6 text-primary" />
              </motion.button>
              {message.trim() && (
                <motion.button 
                  className="p-2"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                >
                  <Send className="w-6 h-6 text-primary" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Ready to Meet Dialog */}
        <Dialog open={showReadyToMeet} onOpenChange={setShowReadyToMeet}>
          <DialogContent className="max-w-md mx-4 rounded-3xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl">
            {/* Elegant Header with Gradient */}
            <div className="relative bg-gradient-to-br from-primary via-secondary to-primary p-6 rounded-t-3xl">
              <div className="absolute inset-0 bg-black/10 rounded-t-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold">Ready to Meet</h2>
                      <p className="text-white/80 text-sm">
                        {meetStep === 'datetime' && 'Plan your meetup'}
                        {meetStep === 'venuetype' && 'Choose venue type'}
                        {meetStep === 'venue' && 'Select location'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowReadyToMeet(false)}
                    className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-4 flex gap-2">
                  <div className={`h-1.5 rounded-full flex-1 transition-all ${
                    meetStep === 'datetime' ? 'bg-white' : 'bg-white/30'
                  }`} />
                  <div className={`h-1.5 rounded-full flex-1 transition-all ${
                    meetStep === 'venuetype' ? 'bg-white' : meetStep === 'venue' ? 'bg-white/50' : 'bg-white/30'
                  }`} />
                  <div className={`h-1.5 rounded-full flex-1 transition-all ${
                    meetStep === 'venue' ? 'bg-white' : 'bg-white/30'
                  }`} />
                </div>
              </div>
            </div>

            <div className="p-6">

            <AnimatePresence mode="wait">
              {meetStep === 'datetime' && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Select Date
                      </label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-14 rounded-xl bg-muted border-2 border-border focus:border-primary transition-colors text-base"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Select Time
                      </label>
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="h-14 rounded-xl bg-muted border-2 border-border focus:border-primary transition-colors text-base"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowReadyToMeet(false)}
                      className="flex-1 h-12 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedDate && selectedTime) {
                          setMeetStep('venuetype');
                        } else {
                          toast.error('Please select both date and time');
                        }
                      }}
                      disabled={!selectedDate || !selectedTime}
                      className="flex-1 h-12 rounded-xl bg-gradient-primary text-primary-foreground shadow-lg"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {meetStep === 'venuetype' && (
                <motion.div
                  key="venuetype"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Choose Venue Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {venueTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          onClick={() => {
                            setSelectedVenueType(type.id);
                            setMeetStep('venue');
                          }}
                          className="p-5 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3 group"
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                            <span className="text-3xl">{type.emoji}</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">{type.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setMeetStep('datetime')}
                      className="flex-1 h-12 rounded-xl"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                      Back
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReadyToMeet(false)}
                      className="flex-1 h-12 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {meetStep === 'venue' && (
                <motion.div
                  key="venue"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Select a Venue
                    </label>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {filteredVenues.map((venue, index) => (
                        <motion.button
                          key={venue.id}
                          onClick={() => setSelectedVenue(venue.id)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                            selectedVenue === venue.id
                              ? 'border-primary bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg'
                              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ${
                              selectedVenue === venue.id ? 'ring-2 ring-primary' : ''
                            }`}>
                              <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                              {selectedVenue === venue.id && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-foreground text-base mb-1 truncate">{venue.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{venue.category}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                                  <span className="text-sm font-medium text-foreground">{venue.rating}</span>
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{venue.distance}</span>
                                {venue.priceRange && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">{venue.priceRange}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {filteredVenues.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">No venues found for this type.</p>
                      <p className="text-sm text-muted-foreground mt-1">Try selecting a different venue type.</p>
                    </div>
                  )}
                  
                  {/* View Menu Button for Restaurants */}
                  {selectedVenue && selectedVenueType === 'restaurant' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <Button
                        onClick={() => setShowMenuModal(true)}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-2 border-primary/50 bg-primary/5 hover:bg-primary/10"
                      >
                        <UtensilsCrossed className="w-4 h-4 mr-2 text-primary" />
                        View Menu
                      </Button>
                    </motion.div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVenue(null);
                        setMeetStep('venuetype');
                      }}
                      className="flex-1 h-12 rounded-xl"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                      Back
                    </Button>
                    <Button
                      onClick={async () => {
                        if (selectedVenue && selectedChat && !hasPendingRequest) {
                          const venue = venues.find(v => v.id === selectedVenue);
                          const dateTime = new Date(`${selectedDate}T${selectedTime}`);
                          
                          // Create meetup request message
                          const requestMessage = `📍 Meetup Request:\n\n${venue?.name}\n📅 ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n🕐 ${selectedTime}\n\nWould you like to meet here?`;
                          
                          try {
                            // Send request as a message in the chat
                            await sendMessageMutation.mutateAsync({
                              chatId: selectedChat,
                              content: requestMessage,
                            });
                            
                            toast.success(`Meetup request sent to ${currentChat?.name}!`, {
                              description: `${venue?.name} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}`
                            });
                            
                            setShowReadyToMeet(false);
                            setMeetStep('datetime');
                            setSelectedDate('');
                            setSelectedTime('');
                            setSelectedVenueType('');
                            setSelectedVenue(null);
                          } catch (error: any) {
                            toast.error(error.message || 'Failed to send meetup request');
                          }
                        } else if (hasPendingRequest) {
                          toast.error('You already have a pending meetup request with this person');
                        } else {
                          toast.error('Please select a venue');
                        }
                      }}
                      disabled={!selectedVenue || hasPendingRequest}
                      className="flex-1 h-12 rounded-xl bg-gradient-primary text-primary-foreground shadow-lg disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {hasPendingRequest ? 'Request Already Sent' : 'Send Request'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Modal */}
        <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
          <DialogContent className="max-w-md mx-4 rounded-3xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary via-secondary to-primary p-6 rounded-t-3xl">
              <div className="absolute inset-0 bg-black/10 rounded-t-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">Menu</h2>
                    <p className="text-white/80 text-sm">Browse our delicious offerings</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowMenuModal(false)}
                  className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {sampleMenuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setSelectedMenuItem(item);
                    setMenuViewMode('2d');
                  }}
                  className="w-full text-left border-b border-border pb-4 last:border-0 last:pb-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-primary/90 backdrop-blur-sm">
                        <Camera className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">${item.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                      
                      {/* Ingredients */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-muted text-xs text-foreground"
                          >
                            {ingredient}
                          </span>
                        ))}
                        {item.ingredients.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                            +{item.ingredients.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Calories & AR Button */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Calories:</span>
                        <span className="text-xs font-medium text-foreground">{item.calories} kcal</span>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMenuItem(item);
                            setMenuViewMode('ar');
                          }}
                          className="ml-auto px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Sparkles className="w-3 h-3" />
                          View in AR
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Item Detail Modal with 3D/AR View */}
        <AnimatePresence>
          {selectedMenuItem && (
            <Dialog open={!!selectedMenuItem} onOpenChange={() => setSelectedMenuItem(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold">{selectedMenuItem.name}</DialogTitle>
                    <button
                      onClick={() => setSelectedMenuItem(null)}
                      className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-4">
                  {/* View Mode Tabs */}
                  <div className="flex gap-2 border-b border-border">
                    <button
                      onClick={() => setMenuViewMode('2d')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        menuViewMode === '2d'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => setMenuViewMode('3d')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        menuViewMode === '3d'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Box className="w-4 h-4 inline mr-2" />
                      3D Model
                    </button>
                    <button
                      onClick={() => setMenuViewMode('ar')}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        menuViewMode === 'ar'
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Camera className="w-4 h-4 inline mr-2" />
                      AR View
                    </button>
                  </div>

                  {/* Content Area */}
                  <AnimatePresence mode="wait">
                    {menuViewMode === '2d' && (
                      <motion.div
                        key="2d"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {/* Image */}
                        <div className="relative aspect-video rounded-xl overflow-hidden">
                          <img
                            src={selectedMenuItem.image}
                            alt={selectedMenuItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-foreground">{selectedMenuItem.name}</h3>
                              <p className="text-sm text-muted-foreground">{selectedMenuItem.category}</p>
                            </div>
                            <span className="text-2xl font-bold text-primary">${selectedMenuItem.price}</span>
                          </div>

                          <p className="text-foreground">{selectedMenuItem.description}</p>

                          {/* Ingredients */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Ingredients</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedMenuItem.ingredients.map((ingredient: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 rounded-full bg-muted text-sm text-foreground"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Nutrition Info */}
                          <div className="p-4 rounded-xl bg-muted">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Calories</span>
                              <span className="text-sm font-semibold text-foreground">{selectedMenuItem.calories} kcal</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {menuViewMode === '3d' && (
                      <motion.div
                        key="3d"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10" style={{
                              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                              backgroundSize: '20px 20px'
                            }} />
                            <div className="relative z-10 text-center">
                              <Box className="w-24 h-24 mx-auto mb-4 text-primary/50" />
                              <p className="text-lg font-semibold text-foreground mb-2">3D Model View</p>
                              <p className="text-sm text-muted-foreground mb-4">
                                {selectedMenuItem.name}
                              </p>
                              <p className="text-xs text-muted-foreground px-4">
                                In production, this would display an interactive 3D model using Three.js, react-three-fiber, or model-viewer.
                              </p>
                            </div>
                          </div>
                          
                          {/* Controls */}
                          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => toast.info('Rotate model - Use mouse/touch to interact')}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Rotate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => toast.info('Zoom in/out - Pinch or scroll')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Zoom
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="text-sm text-foreground">
                            <strong>3D Model:</strong> {selectedMenuItem.arModel}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Interactive 3D model allows you to rotate, zoom, and explore the dish from all angles.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {menuViewMode === 'ar' && (
                      <motion.div
                        key="ar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="aspect-square bg-black rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 opacity-20" />
                            <div className="relative z-10 text-center">
                              <Camera className="w-24 h-24 mx-auto mb-4 text-white/50" />
                              <p className="text-lg font-semibold text-white mb-2">AR View</p>
                              <p className="text-sm text-white/80 mb-4">
                                {selectedMenuItem.name}
                              </p>
                              <p className="text-xs text-white/60 px-4 mb-4">
                                Point your camera at a flat surface to place the 3D model in your environment.
                              </p>
                              <div className="flex flex-col gap-2">
                                <Button
                                  className="bg-white text-black hover:bg-white/90"
                                  onClick={() => toast.info('AR view would activate camera. In production, this uses AR.js, WebXR, or 8th Wall.')}
                                >
                                  <Camera className="w-4 h-4 mr-2" />
                                  Start AR Experience
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="text-sm font-semibold text-foreground mb-2">AR Features:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Place the dish in your real environment</li>
                            <li>• View it from different angles</li>
                            <li>• See accurate size and proportions</li>
                            <li>• Share AR experience with friends</li>
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-muted">
                          <p className="text-sm text-foreground mb-2">
                            <strong>AR Model:</strong> {selectedMenuItem.arModel}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            In production, this would use WebXR API, AR.js, 8th Wall, or similar AR framework to overlay the 3D model onto your camera view.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-foreground mb-3">Messages</h1>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Tabs defaultValue="all" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted rounded-xl p-1 h-10">
            <TabsTrigger value="all" className="rounded-lg text-sm data-[state=active]:bg-card">
              All
            </TabsTrigger>
            <TabsTrigger value="friends" className="rounded-lg text-sm data-[state=active]:bg-card">
              Friends
            </TabsTrigger>
            <TabsTrigger value="vibes" className="rounded-lg text-sm data-[state=active]:bg-card">
              Vibes
            </TabsTrigger>
            <TabsTrigger value="classes" className="rounded-lg text-sm data-[state=active]:bg-card">
              Classes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {chatsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading chats...</p>
              </div>
            ) : combinedChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No chats yet</p>
              </div>
            ) : (
              combinedChats.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className="w-full p-3 rounded-xl bg-card flex items-center gap-3 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <UserAvatar 
                      src={chat.avatar} 
                      alt={chat.name} 
                      size="md"
                      isOnline={chat.isOnline}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {chat.unread}
                    </span>
                  )}
                </motion.button>
              ))
            )}
          </TabsContent>

          <TabsContent value="friends" className="mt-4 space-y-2">
            {combinedChats.filter(c => c.type === 'friendme').map((chat) => (
              <motion.button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className="w-full p-3 rounded-xl bg-card flex items-center gap-3 text-left"
                whileTap={{ scale: 0.98 }}
              >
                <UserAvatar 
                  src={chat.avatar} 
                  alt={chat.name} 
                  size="md"
                  isOnline={chat.isOnline}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChat(chat.id);
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                    </motion.button>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-friendme text-friendme-foreground text-xs flex items-center justify-center font-medium">
                    {chat.unread}
                  </span>
                )}
              </motion.button>
            ))}
          </TabsContent>

          <TabsContent value="vibes" className="mt-4 space-y-2">
            {meetupChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No vibe chats yet</p>
              </div>
            ) : (
              meetupChats.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => {
                    if (chat.id.startsWith('meetup-')) {
                      navigate(`/meetup/${chat.meetup.id}`);
                    } else {
                      setSelectedChat(chat.id);
                    }
                  }}
                  className="w-full p-3 rounded-xl bg-card flex items-center gap-3 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{chat.members} members</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {chat.unread}
                    </span>
                  )}
                </motion.button>
              ))
            )}
          </TabsContent>

          <TabsContent value="classes" className="mt-4 space-y-2">
            {classChats.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No class chats yet</p>
                <p className="text-xs text-muted-foreground mt-2">Enroll in a class to join its chat</p>
              </div>
            ) : (
              classChats.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => {
                    if (chat.id.startsWith('class-')) {
                      navigate(`/class/${chat.class.id}`);
                    } else {
                      setSelectedChat(chat.id);
                    }
                  }}
                  className="w-full p-3 rounded-xl bg-card flex items-center gap-3 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                    <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center">
                      <GraduationCap className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{chat.members} students</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {chat.unread}
                    </span>
                  )}
                </motion.button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Community Dialog */}
      <Dialog open={showCreateCommunity} onOpenChange={setShowCreateCommunity}>
        <DialogContent className="max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create a Community</DialogTitle>
            <DialogDescription>
              Start a new community channel where people can connect and chat together.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Community Name
              </label>
              <Input
                placeholder="e.g., Tech Enthusiasts, Book Club..."
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                placeholder="What is this community about?"
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateCommunity(false);
                setCommunityName('');
                setCommunityDescription('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!communityName.trim()) {
                  toast.error('Please enter a community name');
                  return;
                }

                if (!isAuthenticated) {
                  toast.error('Please login to create a community');
                  navigate('/login');
                  return;
                }

                try {
                  const response = await apiRequest<{ success: boolean; data: any }>(
                    API_ENDPOINTS.CHATS.GROUP,
                    {
                      method: 'POST',
                      body: JSON.stringify({
                        name: communityName,
                        userIds: [], // Empty array for public community
                        description: communityDescription || undefined,
                      }),
                    }
                  );
                  
                  toast.success('Community created successfully!');
                  setShowCreateCommunity(false);
                  setCommunityName('');
                  setCommunityDescription('');
                  // Refresh chats
                  queryClient.invalidateQueries({ queryKey: ['chats'] });
                } catch (error: any) {
                  toast.error(error.message || 'Failed to create community');
                }
              }}
              disabled={!communityName.trim()}
              className="flex-1 bg-gradient-primary"
            >
              <Users className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileLayout>
  );
};

export default ChatPage;
