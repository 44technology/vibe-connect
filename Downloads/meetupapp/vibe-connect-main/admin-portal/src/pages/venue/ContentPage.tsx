import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Image, Video, Plus, Upload, Film, Sparkles, Calendar, Clock, Eye, Heart, MessageCircle, Share2, Edit, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'stories' | 'reels'>('all');
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      type: 'post', 
      content: 'New menu item available! Try our signature dish this weekend.', 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      createdAt: '2025-01-27',
      scheduledFor: null,
      views: 1250,
      likes: 89,
      comments: 12,
      shares: 5,
      status: 'published' as 'published' | 'scheduled' | 'draft',
    },
    { 
      id: 2, 
      type: 'story', 
      content: 'Weekend special - 20% off all drinks!', 
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      createdAt: '2025-01-26',
      scheduledFor: null,
      views: 890,
      likes: 45,
      comments: 8,
      shares: 3,
      status: 'published' as 'published' | 'scheduled' | 'draft',
    },
    { 
      id: 3, 
      type: 'reel', 
      content: 'Behind the scenes: How we prepare our signature cocktails', 
      video: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
      createdAt: '2025-01-25',
      scheduledFor: null,
      views: 3450,
      likes: 234,
      comments: 45,
      shares: 18,
      status: 'published' as 'published' | 'scheduled' | 'draft',
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<'post' | 'story' | 'reel'>('post');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const handleSubmit = () => {
    if (!content.trim() && !selectedFile) {
      toast.error('Please enter content or upload media');
      return;
    }
    
    const scheduledFor = scheduledDate && scheduledTime 
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : null;
    
    const newPost = {
      id: posts.length + 1,
      type: contentType,
      content,
      image: (contentType === 'post' || contentType === 'story') && selectedFile ? URL.createObjectURL(selectedFile) : null,
      video: contentType === 'reel' && selectedFile ? URL.createObjectURL(selectedFile) : null,
      createdAt: new Date().toISOString().split('T')[0],
      scheduledFor,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      status: saveAsDraft ? 'draft' : (scheduledFor ? 'scheduled' : 'published') as 'published' | 'scheduled' | 'draft',
    };
    setPosts([newPost, ...posts]);
    setContent('');
    setSelectedFile(null);
    setScheduledDate('');
    setScheduledTime('');
    setSaveAsDraft(false);
    setIsDialogOpen(false);
    
    const contentTypeLabels = {
      post: 'Post',
      story: 'Story',
      reel: 'Reel'
    };
    const statusLabel = saveAsDraft ? 'saved as draft' : scheduledFor ? 'scheduled' : 'published';
    toast.success(`${contentTypeLabels[contentType]} ${statusLabel} successfully!`);
  };

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(p => p.type === activeTab.slice(0, -1)); // Remove 's' from 'posts', 'stories', 'reels'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Flywheel</h1>
          <p className="text-muted-foreground mt-2">Create posts, stories, and reels to engage your audience and drive bookings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>Share posts, stories, or reels with your audience</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={contentType === 'post' ? 'default' : 'outline'}
                  onClick={() => setContentType('post')}
                  className="flex-1"
                  type="button"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Post
                </Button>
                <Button
                  variant={contentType === 'story' ? 'default' : 'outline'}
                  onClick={() => setContentType('story')}
                  className="flex-1"
                  type="button"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Story
                </Button>
                <Button
                  variant={contentType === 'reel' ? 'default' : 'outline'}
                  onClick={() => setContentType('reel')}
                  className="flex-1"
                  type="button"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Reel
                </Button>
              </div>
              
              {contentType === 'reel' && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Content Flywheel</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reels help grow your audience and drive bookings. Share venue highlights, menu items, events, and behind-the-scenes content.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder={
                    contentType === 'post' 
                      ? "What's happening at your venue?"
                      : contentType === 'story'
                      ? "Share a moment with your audience..."
                      : "Create engaging video content..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {contentType === 'reel' 
                    ? 'Tip: Keep it short and engaging. Show your venue, menu items, or events.'
                    : 'Add hashtags to increase visibility (e.g., #mexicocity #foodie #events)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Media ({contentType === 'reel' ? 'Video' : 'Image'})</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept={contentType === 'reel' ? 'video/*' : 'image/*'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground mt-2">{selectedFile.name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Schedule Post</Label>
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="draft"
                  checked={saveAsDraft}
                  onChange={(e) => setSaveAsDraft(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="draft" className="text-sm cursor-pointer">
                  Save as draft
                </Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  type="button"
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {saveAsDraft 
                    ? 'Save Draft' 
                    : scheduledDate && scheduledTime
                    ? 'Schedule'
                    : `Publish ${contentType === 'post' ? 'Post' : contentType === 'story' ? 'Story' : 'Reel'}`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.likes, 0).toLocaleString()}</p>
              </div>
              <Heart className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">
                  {posts.length > 0 
                    ? ((posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0) / posts.reduce((sum, p) => sum + p.views, 1)) * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No content yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first {activeTab === 'all' ? 'content' : activeTab.slice(0, -1)}</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={post.status === 'published' ? 'default' : post.status === 'scheduled' ? 'secondary' : 'outline'}>
                          {post.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{post.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {post.scheduledFor && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        Scheduled for {new Date(post.scheduledFor).toLocaleString()}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 line-clamp-3">{post.content}</p>
                    {(post.image || post.video) && (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {post.image ? (
                          <img src={post.image} alt={post.content} className="w-full h-full object-cover" />
                        ) : (
                          <Video className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {post.shares}
                        </div>
                      </div>
                      <span>{post.createdAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
