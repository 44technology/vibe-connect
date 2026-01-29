import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { GraduationCap, Sparkles, Calendar, Monitor, Building, Video, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionCreatePage() {
  const [activeTab, setActiveTab] = useState<'class' | 'event' | 'vibe' | 'qa'>('class');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'online' | 'onsite' | 'hybrid'>('online');
  const [eventType, setEventType] = useState<'networking' | 'qa' | 'masterclass'>('networking');

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    const labels = {
      class: 'Class',
      event: 'Event',
      qa: 'Q&A Session',
      vibe: 'Vibe'
    };
    toast.success(`${labels[activeTab]} created successfully!`);
    setTitle('');
    setDescription('');
    setEventType('networking');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Content</h1>
        <p className="text-muted-foreground mt-2">Create classes, events, or vibes</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'class' | 'event' | 'vibe' | 'qa')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="class" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Class
          </TabsTrigger>
          <TabsTrigger value="event" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Event
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Q&A
          </TabsTrigger>
          <TabsTrigger value="vibe" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Vibe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Class</CardTitle>
              <CardDescription>Set up a new class for students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Class Title</Label>
                <Input
                  placeholder="e.g., Diction Class"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your class..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'online' ? 'default' : 'outline'}
                    onClick={() => setType('online')}
                    type="button"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Online
                  </Button>
                  <Button
                    variant={type === 'hybrid' ? 'default' : 'outline'}
                    onClick={() => setType('hybrid')}
                    type="button"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Hybrid
                  </Button>
                  <Button
                    variant={type === 'onsite' ? 'default' : 'outline'}
                    onClick={() => setType('onsite')}
                    type="button"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Onsite
                  </Button>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Class
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="event" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
              <CardDescription>Organize a new event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  placeholder="e.g., Networking Night"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Event
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vibe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Vibe</CardTitle>
              <CardDescription>Create a new vibe/meetup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Vibe Title</Label>
                <Input
                  placeholder="e.g., Coffee & Code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your vibe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Vibe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
