import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Image, Video, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentPage() {
  const [posts, setPosts] = useState([
    { id: 1, type: 'post', content: 'New class starting next week!', image: null, createdAt: '2025-01-27' },
    { id: 2, type: 'story', content: 'Behind the scenes', image: null, createdAt: '2025-01-26' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<'post' | 'story'>('post');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }
    const newPost = {
      id: posts.length + 1,
      type: contentType,
      content,
      image: selectedFile ? URL.createObjectURL(selectedFile) : null,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPosts([newPost, ...posts]);
    setContent('');
    setSelectedFile(null);
    setIsDialogOpen(false);
    toast.success(`${contentType === 'post' ? 'Post' : 'Story'} created successfully!`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posts & Stories</h1>
          <p className="text-muted-foreground mt-2">Create and manage your content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>Share posts or stories with your students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={contentType === 'post' ? 'default' : 'outline'}
                  onClick={() => setContentType('post')}
                  className="flex-1"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Post
                </Button>
                <Button
                  variant={contentType === 'story' ? 'default' : 'outline'}
                  onClick={() => setContentType('story')}
                  className="flex-1"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Story
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Media (Image/Video)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Publish {contentType === 'post' ? 'Post' : 'Story'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm capitalize">{post.type}</CardTitle>
                <span className="text-xs text-muted-foreground">{post.createdAt}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{post.content}</p>
              {post.image && (
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                  <Image className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
