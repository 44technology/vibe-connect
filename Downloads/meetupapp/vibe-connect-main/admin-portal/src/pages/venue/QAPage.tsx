import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MessageCircle, CheckCircle2, Clock, Search, Send, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

// Mock Q&A data - in production, fetch from API
const mockQuestions = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    question: 'Do you have vegetarian options on your menu?',
    createdAt: new Date('2025-01-24T10:30:00'),
    status: 'answered' as 'pending' | 'answered',
    answer: 'Yes! We have a dedicated vegetarian section with 15+ options including plant-based burgers, salads, and pasta dishes.',
    answeredAt: new Date('2025-01-24T11:00:00'),
    relatedTo: { type: 'venue', id: 'venue1', name: 'Main Venue' },
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    question: 'What are your opening hours on weekends?',
    createdAt: new Date('2025-01-24T14:20:00'),
    status: 'pending' as 'pending' | 'answered',
    answer: null,
    answeredAt: null,
    relatedTo: { type: 'venue', id: 'venue1', name: 'Main Venue' },
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Emma Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    question: 'Can I book a private event for 50 people?',
    createdAt: new Date('2025-01-23T16:45:00'),
    status: 'answered' as 'pending' | 'answered',
    answer: 'Absolutely! We offer private event bookings. Please contact us through the app or call directly for pricing and availability.',
    answeredAt: new Date('2025-01-23T17:30:00'),
    relatedTo: { type: 'event', id: 'event1', name: 'Private Events' },
  },
];

export default function QAPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<typeof mockQuestions[0] | null>(null);
  const [answer, setAnswer] = useState('');

  const filteredQuestions = mockQuestions.filter(q => {
    const matchesTab = activeTab === 'all' || q.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = mockQuestions.filter(q => q.status === 'pending').length;

  const handleAnswer = () => {
    if (!answer.trim()) {
      toast.error('Please enter an answer');
      return;
    }
    if (!selectedQuestion) return;

    // In production, update via API
    toast.success('Answer submitted successfully!');
    setAnswer('');
    setSelectedQuestion(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Q&A Management</h1>
        <p className="text-muted-foreground mt-2">
          Answer questions from users on the mobile app. Quick responses help build trust and drive bookings.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search questions or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'pending' | 'answered')}>
        <TabsList>
          <TabsTrigger value="all">All Questions</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="answered">Answered</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No questions found</p>
                </CardContent>
              </Card>
            ) : (
              filteredQuestions.map((question) => (
                <Card 
                  key={question.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedQuestion?.id === question.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedQuestion(question);
                    setAnswer(question.answer || '');
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {question.userAvatar ? (
                            <img src={question.userAvatar} alt={question.userName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">{question.userName}</p>
                            <Badge variant={question.status === 'answered' ? 'default' : 'secondary'}>
                              {question.status === 'answered' ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" />Answered</>
                              ) : (
                                <><Clock className="w-3 h-3 mr-1" />Pending</>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(question.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Question:</p>
                        <p className="text-sm text-foreground">{question.question}</p>
                      </div>
                      {question.relatedTo && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Related to: {question.relatedTo.name}
                        </div>
                      )}
                      {question.status === 'answered' && question.answer && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Your Answer:</p>
                          <p className="text-sm text-foreground">{question.answer}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Answered {formatDistanceToNow(question.answeredAt!, { addSuffix: true })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Answer Dialog */}
      {selectedQuestion && selectedQuestion.status === 'pending' && (
        <Card className="sticky bottom-0 border-t-2 border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Answer Question</CardTitle>
            <CardDescription>
              Respond to {selectedQuestion.userName}'s question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Question</Label>
              <div className="p-3 rounded-lg bg-muted mt-1">
                <p className="text-sm text-foreground">{selectedQuestion.question}</p>
              </div>
            </div>
            <div>
              <Label>Your Answer</Label>
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Be friendly, helpful, and concise. Quick responses improve customer satisfaction.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedQuestion(null);
                  setAnswer('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAnswer}
                className="flex-1"
                disabled={!answer.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
