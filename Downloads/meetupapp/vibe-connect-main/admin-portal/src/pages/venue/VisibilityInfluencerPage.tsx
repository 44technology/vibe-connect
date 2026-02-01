import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Star, Users, TrendingUp, Plus, Film, Image, Upload, Eye, Heart, Share2, Calendar, DollarSign, Target, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

type AdType = 'reel' | 'story';
type AdStatus = 'draft' | 'scheduled' | 'active' | 'completed';

type AdCampaign = {
  id: number;
  title: string;
  type: AdType;
  content: string;
  media?: string;
  budget: number;
  spent: number;
  targetAudience: string;
  status: AdStatus;
  createdAt: string;
  scheduledFor?: string;
  views: number;
  likes: number;
  shares: number;
  clicks: number;
};

export default function VisibilityInfluencerPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'create'>('campaigns');
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    { 
      id: 1, 
      title: 'Weekend Special Promotion', 
      type: 'story',
      content: '20% off all drinks this weekend!',
      media: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      budget: 400,
      spent: 250,
      targetAudience: '25-45, Professionals',
      status: 'active',
      createdAt: '2025-01-20',
      views: 15200,
      likes: 680,
      shares: 120,
      clicks: 340,
    },
    { 
      id: 2, 
      title: 'New Menu Launch', 
      type: 'reel',
      content: 'Check out our new signature dishes!',
      media: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      budget: 600,
      spent: 420,
      targetAudience: '18-35, Food Enthusiasts',
      status: 'active',
      createdAt: '2025-01-22',
      views: 18900,
      likes: 890,
      shares: 156,
      clicks: 456,
    },
    { 
      id: 3, 
      title: 'Event Announcement', 
      type: 'story',
      content: 'Join us for our grand opening event!',
      budget: 500,
      spent: 0,
      targetAudience: 'All Ages, General',
      status: 'draft',
      createdAt: '2025-01-25',
      views: 0,
      likes: 0,
      shares: 0,
      clicks: 0,
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [adType, setAdType] = useState<AdType>('reel');
  const [adTitle, setAdTitle] = useState('');
  const [adContent, setAdContent] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleCreateAd = () => {
    if (!adTitle.trim() || !adContent.trim() || !adBudget || !targetAudience) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!selectedFile && adType === 'reel') {
      toast.error('Please upload a video for reel ads');
      return;
    }

    if (!selectedFile && adType === 'story') {
      toast.error('Please upload an image for story ads');
      return;
    }

    const scheduledFor = scheduledDate && scheduledTime 
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : undefined;

    const newCampaign: AdCampaign = {
      id: campaigns.length + 1,
      title: adTitle,
      type: adType,
      content: adContent,
      media: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      budget: parseFloat(adBudget),
      spent: 0,
      targetAudience,
      status: scheduledFor ? 'scheduled' : 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      scheduledFor,
      views: 0,
      likes: 0,
      shares: 0,
      clicks: 0,
    };

    setCampaigns([newCampaign, ...campaigns]);
    
    // Reset form
    setAdTitle('');
    setAdContent('');
    setAdBudget('');
    setTargetAudience('');
    setSelectedFile(null);
    setScheduledDate('');
    setScheduledTime('');
    setIsCreateDialogOpen(false);
    
    toast.success('Ad campaign created successfully!');
  };

  const handlePublishAd = (id: number) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, status: 'active' as AdStatus } : c
    ));
    toast.success('Ad published successfully!');
  };

  const getStatusColor = (status: AdStatus) => {
    switch (status) {
      case 'active': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: AdStatus) => {
    switch (status) {
      case 'active': return 'Active';
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      default: return 'Draft';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ad Campaigns</h1>
          <p className="text-muted-foreground mt-2">Create and manage sponsored reels and stories to reach your target audience</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ad Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Ad Campaign</DialogTitle>
              <DialogDescription>Create sponsored content for reels or stories</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={adType === 'reel' ? 'default' : 'outline'}
                    onClick={() => setAdType('reel')}
                    className="flex-1"
                    type="button"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Reel
                  </Button>
                  <Button
                    variant={adType === 'story' ? 'default' : 'outline'}
                    onClick={() => setAdType('story')}
                    className="flex-1"
                    type="button"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Story
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Campaign Title</Label>
                <Input
                  placeholder="e.g., Weekend Special Promotion"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Content / Caption</Label>
                <Textarea
                  placeholder="Write your ad content..."
                  value={adContent}
                  onChange={(e) => setAdContent(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {adType === 'reel' 
                    ? 'Tip: Keep it engaging and include a clear call-to-action'
                    : 'Tip: Stories are best for time-sensitive promotions'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Media ({adType === 'reel' ? 'Video' : 'Image'})</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept={adType === 'reel' ? 'video/*' : 'image/*'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-2">{selectedFile.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {adType === 'reel' 
                      ? 'Upload a video (max 60 seconds recommended)'
                      : 'Upload an image (1080x1920 recommended for stories)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={adBudget}
                    onChange={(e) => setAdBudget(e.target.value)}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">Total campaign budget</p>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25, Students">18-25, Students</SelectItem>
                      <SelectItem value="25-35, Young Professionals">25-35, Young Professionals</SelectItem>
                      <SelectItem value="35-45, Professionals">35-45, Professionals</SelectItem>
                      <SelectItem value="18-30, Entrepreneurs">18-30, Entrepreneurs</SelectItem>
                      <SelectItem value="All Ages, General">All Ages, General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Schedule Ad</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (scheduledDate && scheduledTime) {
                        setScheduledDate('');
                        setScheduledTime('');
                      }
                    }}
                    type="button"
                  >
                    {scheduledDate && scheduledTime ? 'Remove Schedule' : 'Add Schedule'}
                  </Button>
                </div>
                {(scheduledDate || scheduledTime) && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Time</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAd} className="flex-1">
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'campaigns' | 'create')}>
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {campaign.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{campaign.content}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaign.media && (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {campaign.type === 'reel' ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={campaign.media} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Film className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={campaign.media} 
                          alt={campaign.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-semibold">${campaign.budget}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-semibold">${campaign.spent}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="w-3 h-3" />
                      <span>{campaign.targetAudience}</span>
                    </div>
                    {campaign.scheduledFor && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Scheduled: {new Date(campaign.scheduledFor).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {campaign.status === 'active' && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <Eye className="w-3 h-3" />
                          Views
                        </div>
                        <p className="text-sm font-semibold">{campaign.views.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <Heart className="w-3 h-3" />
                          Likes
                        </div>
                        <p className="text-sm font-semibold">{campaign.likes.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <Share2 className="w-3 h-3" />
                          Shares
                        </div>
                        <p className="text-sm font-semibold">{campaign.shares.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <BarChart3 className="w-3 h-3" />
                          Clicks
                        </div>
                        <p className="text-sm font-semibold">{campaign.clicks.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {campaign.status === 'draft' && (
                    <Button 
                      onClick={() => handlePublishAd(campaign.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Publish Ad
                    </Button>
                  )}

                  {campaign.status === 'scheduled' && (
                    <div className="text-center py-2 text-xs text-muted-foreground">
                      Will be published automatically
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Ad Campaign</CardTitle>
              <CardDescription>Click the button above to create a new sponsored reel or story</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Reel Ads
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create engaging video ads up to 60 seconds. Perfect for showcasing venue, events, or promotions.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Story Ads
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create time-sensitive story ads that disappear after 24 hours. Great for limited-time offers and announcements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
