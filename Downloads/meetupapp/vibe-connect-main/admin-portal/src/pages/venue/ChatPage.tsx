import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Send, User, MessageCircle, Phone, Video, MoreVertical, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

// Mock chat data - in production, fetch from API
const mockChats = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    lastMessage: 'Thanks for the quick response!',
    lastMessageTime: new Date('2025-01-24T15:30:00'),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    lastMessage: 'Can I book a table for tonight?',
    lastMessageTime: new Date('2025-01-24T14:20:00'),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Emma Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    lastMessage: 'Perfect! See you then.',
    lastMessageTime: new Date('2025-01-24T12:15:00'),
    unreadCount: 0,
    isOnline: true,
  },
];

const mockMessages: Record<string, Array<{
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}>> = {
  '1': [
    { id: 'm1', senderId: 'user1', content: 'Hi! Do you have vegetarian options?', timestamp: new Date('2025-01-24T15:00:00'), read: true },
    { id: 'm2', senderId: 'venue', content: 'Yes! We have a dedicated vegetarian section with 15+ options.', timestamp: new Date('2025-01-24T15:05:00'), read: true },
    { id: 'm3', senderId: 'user1', content: 'Thanks for the quick response!', timestamp: new Date('2025-01-24T15:30:00'), read: false },
  ],
  '2': [
    { id: 'm4', senderId: 'user2', content: 'Can I book a table for tonight?', timestamp: new Date('2025-01-24T14:20:00'), read: true },
  ],
  '3': [
    { id: 'm5', senderId: 'user3', content: 'What time do you close?', timestamp: new Date('2025-01-24T12:00:00'), read: true },
    { id: 'm6', senderId: 'venue', content: 'We close at 11 PM on weekdays and midnight on weekends.', timestamp: new Date('2025-01-24T12:05:00'), read: true },
    { id: 'm7', senderId: 'user3', content: 'Perfect! See you then.', timestamp: new Date('2025-01-24T12:15:00'), read: true },
  ],
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChatData = selectedChat ? mockChats.find(c => c.id === selectedChat) : null;
  const messages = selectedChat ? (mockMessages[selectedChat] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    // In production, send via API/WebSocket
    toast.success('Message sent');
    setMessage('');
  };

  const filteredChats = mockChats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chat</h1>
        <p className="text-muted-foreground mt-2">Communicate with your customers directly</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 mt-6 min-h-0">
        {/* Chat List */}
        <div className="border rounded-lg flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No conversations found</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedChat === chat.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {chat.userAvatar ? (
                          <img src={chat.userAvatar} alt={chat.userName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-foreground truncate">{chat.userName}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(chat.lastMessageTime, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        {chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 flex-shrink-0">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="col-span-2 border rounded-lg flex flex-col">
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedChatData.userAvatar ? (
                        <img src={selectedChatData.userAvatar} alt={selectedChatData.userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    {selectedChatData.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedChatData.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedChatData.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isVenue = msg.senderId === 'venue';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isVenue ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isVenue ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} rounded-lg p-3`}>
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {format(msg.timestamp, 'HH:mm')}
                          </span>
                          {isVenue && (
                            msg.read ? (
                              <CheckCircle2 className="w-3 h-3 opacity-70" />
                            ) : (
                              <Clock className="w-3 h-3 opacity-70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
