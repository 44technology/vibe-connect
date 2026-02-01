import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Image, Video, Plus, Upload, Film, Sparkles, MessageCircle, Send, User, Eye, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

export default function ContentPage() {
  const [posts, setPosts] = useState([
    { id: 1, type: 'post', content: 'New class starting next week!', image: null, createdAt: '2025-01-27' },
    { id: 2, type: 'story', content: 'Behind the scenes', image: null, createdAt: '2025-01-26' },
    { id: 3, type: 'reel', content: 'Quick tip: How to start your e-commerce journey', video: null, createdAt: '2025-01-25' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<'post' | 'story' | 'reel'>('post');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Comments dialog state
  const [selectedPost, setSelectedPost] = useState<PostWithComments | null>(null);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }
    const newPost = {
      id: posts.length + 1,
      type: contentType,
      content,
      image: (contentType === 'post' || contentType === 'story') && selectedFile ? URL.createObjectURL(selectedFile) : null,
      video: contentType === 'reel' && selectedFile ? URL.createObjectURL(selectedFile) : null,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPosts([newPost, ...posts]);
    setContent('');
    setSelectedFile(null);
    setIsDialogOpen(false);
    const contentTypeLabels = {
      post: 'Post',
      story: 'Story',
      reel: 'Reel'
    };
    toast.success(`${contentTypeLabels[contentType]} created successfully!`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Flywheel</h1>
          <p className="text-muted-foreground mt-2">Create posts, stories, and reels to grow your audience. FOMO-driven content that drives enrollments.</p>
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
                <Button
                  variant={contentType === 'reel' ? 'default' : 'outline'}
                  onClick={() => setContentType('reel')}
                  className="flex-1"
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
                    Reels help grow your audience and drive enrollments. Share quick tips, behind-the-scenes, and class highlights.
                  </p>
                </div>
              )}
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
          <Card 
            key={post.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setSelectedPost(post);
              setIsCommentsDialogOpen(true);
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{post.type}</Badge>
                  <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 line-clamp-3">{post.content}</p>
              {(post.image || post.video) && (
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {post.image ? (
                    <img src={post.image} alt={post.content} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {post.comments || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  {post.shares || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comments Dialog */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments & Replies</DialogTitle>
            <DialogDescription>
              {selectedPost && (
                <>
                  {selectedPost.type.charAt(0).toUpperCase() + selectedPost.type.slice(1)}: {selectedPost.content}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* Post Preview */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs capitalize">{selectedPost.type}</Badge>
                </div>
                <p className="text-sm text-foreground mb-3">{selectedPost.content}</p>
                {(selectedPost.image || selectedPost.video) && (
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                    {selectedPost.image ? (
                      <img src={selectedPost.image} alt={selectedPost.content} className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {selectedPost.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {selectedPost.likes || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {selectedPost.comments || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {selectedPost.shares || 0}
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comments ({selectedPost.commentList?.length || 0})
                </h3>
                
                {selectedPost.commentList && selectedPost.commentList.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPost.commentList.map((comment) => (
                      <div key={comment.id} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-foreground">{comment.userName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mb-2">{comment.text}</p>
                            
                            {/* Reply Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplyingToCommentId(comment.id);
                                setReplyText('');
                              }}
                              className="h-7 text-xs"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Reply
                            </Button>

                            {/* Reply Input */}
                            {replyingToCommentId === comment.id && (
                              <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-start gap-2">
                                  <Textarea
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={2}
                                    className="flex-1 text-sm"
                                    autoFocus
                                  />
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!replyText.trim()) {
                                          toast.error('Please enter a reply');
                                          return;
                                        }
                                        // Add reply to comment
                                        const updatedPosts = posts.map(p => {
                                          if (p.id === selectedPost.id) {
                                            const updatedComments = (p.commentList || []).map(c => {
                                              if (c.id === comment.id) {
                                                return {
                                                  ...c,
                                                  replies: [
                                                    ...(c.replies || []),
                                                    {
                                                      id: Date.now(),
                                                      userName: 'You (Instructor)',
                                                      text: replyText,
                                                      createdAt: new Date().toISOString(),
                                                    }
                                                  ]
                                                };
                                              }
                                              return c;
                                            });
                                            return {
                                              ...p,
                                              commentList: updatedComments,
                                              comments: updatedComments.length + (updatedComments.reduce((sum, c) => sum + (c.replies?.length || 0), 0)),
                                            };
                                          }
                                          return p;
                                        });
                                        setPosts(updatedPosts);
                                        setSelectedPost(updatedPosts.find(p => p.id === selectedPost.id) || null);
                                        setReplyText('');
                                        setReplyingToCommentId(null);
                                        toast.success('Reply posted successfully!');
                                      }}
                                      className="h-7"
                                    >
                                      <Send className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReplyText('');
                                        setReplyingToCommentId(null);
                                      }}
                                      className="h-7 text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Show Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 ml-4 space-y-2 border-l-2 border-primary/20 pl-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="p-2 rounded bg-muted/30">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs text-foreground">{reply.userName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-foreground">{reply.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentsDialogOpen(false);
                setSelectedPost(null);
                setReplyText('');
                setReplyingToCommentId(null);
              }}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
