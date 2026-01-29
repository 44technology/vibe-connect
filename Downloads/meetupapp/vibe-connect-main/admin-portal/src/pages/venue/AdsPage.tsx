import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Plus, Upload, Image, Video, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdsPage() {
  const [ads, setAds] = useState([
    { id: 1, title: 'Summer Campaign', type: 'image', status: 'approved', startDate: '2025-02-01', endDate: '2025-02-28' },
    { id: 2, title: 'New Menu Launch', type: 'video', status: 'pending', startDate: '2025-02-15', endDate: '2025-03-15' },
    { id: 3, title: 'Valentine Special', type: 'image', status: 'rejected', startDate: '2025-02-10', endDate: '2025-02-14' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!title.trim() || !startDate || !endDate || !selectedFile) {
      toast.error('Please fill all fields and upload media');
      return;
    }
    const newAd = {
      id: ads.length + 1,
      title,
      type,
      status: 'pending' as const,
      startDate,
      endDate,
    };
    setAds([newAd, ...ads]);
    setTitle('');
    setStartDate('');
    setEndDate('');
    setSelectedFile(null);
    setIsDialogOpen(false);
    toast.success('Ad uploaded successfully! Waiting for approval.');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ads</h1>
          <p className="text-muted-foreground mt-2">Upload and manage your advertisements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Ad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Ad</DialogTitle>
              <DialogDescription>Upload image or video advertisement</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ad Title</Label>
                <Input
                  placeholder="e.g., Summer Campaign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'image' ? 'default' : 'outline'}
                    onClick={() => setType('image')}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    variant={type === 'video' ? 'default' : 'outline'}
                    onClick={() => setType('video')}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upload Media</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept={type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Upload Ad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {ad.type === 'image' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {ad.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(ad.status)}
                  <Badge variant={ad.status === 'approved' ? 'default' : ad.status === 'pending' ? 'secondary' : 'destructive'}>
                    {ad.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{ad.startDate} - {ad.endDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
