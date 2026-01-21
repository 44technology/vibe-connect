import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Phone, Video, Send, Mic, MapPin, Calendar, Clock, ChevronRight, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import UserAvatar from '@/components/ui/UserAvatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats from backend
  const { data: backendChats, isLoading: chatsLoading } = useChats();
  const { data: chatData } = useChat(selectedChat);
  const { data: messagesData = [] } = useMessages(selectedChat);
  const sendMessageMutation = useSendMessage();

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
            : chat.name || 'Group Chat',
          avatar: chat.type === 'direct' 
            ? (otherMember?.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
            : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150',
          lastMessage: lastMessage?.content || 'No messages yet',
          time: lastMessage?.createdAt ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true }) : '',
          unread: 0, // TODO: Calculate unread count
          type: chat.type === 'direct' ? 'friendme' : 'group',
          isOnline: false, // TODO: Check online status
          members: chat.members?.length || 0,
        };
      })
    : chats;

  const currentChat = allChats.find(c => c.id === selectedChat);
  const isDirectChat = chatData?.type === 'direct';
  
  // Filter venues by selected type
  const filteredVenues = selectedVenueType 
    ? venues.filter(v => v.category.toLowerCase().includes(selectedVenueType.toLowerCase()))
    : venues;

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !isAuthenticated) return;

    try {
      // Send via socket for real-time
      sendSocketMessage(message.trim());
      
      // Also send via REST API as backup
      await sendMessageMutation.mutateAsync({
        chatId: selectedChat,
        content: message.trim(),
      });

      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  if (selectedChat && currentChat) {
    return (
      <MobileLayout hideNav>
        <div className="min-h-screen flex flex-col">
          {/* Chat header */}
          <div className="sticky top-0 z-40 glass safe-top">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setSelectedChat(null)}
                  className="text-foreground font-medium"
                  whileTap={{ scale: 0.95 }}
                >
                  ←
                </motion.button>
                <UserAvatar 
                  src={chatData?.type === 'direct' 
                    ? chatData.members?.find((m: any) => m.user.id !== user?.id)?.user.avatar || currentChat.avatar
                    : currentChat.avatar
                  } 
                  alt={chatData?.type === 'direct'
                    ? (chatData.members?.find((m: any) => m.user.id !== user?.id)?.user.displayName || currentChat.name)
                    : currentChat.name
                  } 
                  size="sm"
                  isOnline={currentChat.isOnline}
                />
                <div>
                  <h2 className="font-semibold text-foreground">
                    {chatData?.type === 'direct'
                      ? (chatData.members?.find((m: any) => m.user.id !== user?.id)?.user.displayName || currentChat.name)
                      : currentChat.name
                    }
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {currentChat.isOnline ? 'Online' : chatData?.type === 'group' ? `${chatData.members?.length || 0} members` : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
            {messagesData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messagesData.map((msg: Message) => {
                const isOwnMessage = msg.senderId === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-2xl px-4 py-2 max-w-[75%] ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground rounded-tr-md' 
                        : 'bg-muted rounded-tl-md'
                    }`}>
                      {!isOwnMessage && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {msg.sender.displayName || `${msg.sender.firstName} ${msg.sender.lastName}`}
                        </p>
                      )}
                      {msg.image && (
                        <img src={msg.image} alt="Message" className="rounded-lg mb-2 max-w-full" />
                      )}
                      <p className={isOwnMessage ? 'text-primary-foreground' : 'text-foreground'}>
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
          <DialogContent className="max-w-md mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ready to Meet</DialogTitle>
              <DialogDescription>
                {meetStep === 'datetime' && 'Select date and time for your meetup'}
                {meetStep === 'venuetype' && 'Choose a venue type'}
                {meetStep === 'venue' && 'Select a venue'}
              </DialogDescription>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {meetStep === 'datetime' && (
                <motion.div
                  key="datetime"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 py-4"
                >
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-12"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowReadyToMeet(false)}
                      className="flex-1"
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
                      className="flex-1 bg-gradient-primary"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {meetStep === 'venuetype' && (
                <motion.div
                  key="venuetype"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 py-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {venueTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => {
                          setSelectedVenueType(type.id);
                          setMeetStep('venue');
                        }}
                        className="p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-2xl">{type.emoji}</span>
                        <span className="text-xs font-medium text-foreground">{type.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setMeetStep('datetime')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReadyToMeet(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {meetStep === 'venue' && (
                <motion.div
                  key="venue"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 py-4"
                >
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredVenues.map((venue) => (
                      <motion.button
                        key={venue.id}
                        onClick={() => setSelectedVenue(venue.id)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                          selectedVenue === venue.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm truncate">{venue.name}</h4>
                            <p className="text-xs text-muted-foreground">{venue.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-secondary text-secondary" />
                                <span className="text-xs text-muted-foreground">{venue.rating}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{venue.distance}</span>
                            </div>
                          </div>
                          {selectedVenue === venue.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <X className="w-3 h-3 text-primary-foreground rotate-45" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  {filteredVenues.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No venues found for this type.</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedVenue(null);
                        setMeetStep('venuetype');
                      }}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedVenue) {
                          // TODO: Send meetup request to the other user
                          const venue = venues.find(v => v.id === selectedVenue);
                          toast.success(`Meetup request sent to ${currentChat?.name}!`, {
                            description: `${venue?.name} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}`
                          });
                          setShowReadyToMeet(false);
                          setMeetStep('datetime');
                          setSelectedDate('');
                          setSelectedTime('');
                          setSelectedVenueType('');
                          setSelectedVenue(null);
                        } else {
                          toast.error('Please select a venue');
                        }
                      }}
                      disabled={!selectedVenue}
                      className="flex-1 bg-gradient-primary"
                    >
                      Send Request
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
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
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1 h-10">
            <TabsTrigger value="all" className="rounded-lg text-sm data-[state=active]:bg-card">
              All
            </TabsTrigger>
            <TabsTrigger value="friends" className="rounded-lg text-sm data-[state=active]:bg-card">
              Friends
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg text-sm data-[state=active]:bg-card">
              Vibes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {chatsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading chats...</p>
              </div>
            ) : allChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No chats yet</p>
              </div>
            ) : (
              allChats.map((chat) => (
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
            {allChats.filter(c => c.type === 'friendme').map((chat) => (
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
                    <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
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

          <TabsContent value="groups" className="mt-4 space-y-2">
            {allChats.filter(c => c.type === 'group').map((chat) => (
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
                />
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
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default ChatPage;
