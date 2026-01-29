import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Plus, Upload, FileText, Video, Image, File, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([
    { id: 1, title: 'Diction Exercises PDF', type: 'pdf', classId: 1, className: 'Diction Class', uploadedAt: '2025-01-25' },
    { id: 2, title: 'AutoCAD Tutorial Video', type: 'video', classId: 2, className: 'AutoCAD Basics', uploadedAt: '2025-01-24' },
    { id: 3, title: 'Pronunciation Guide', type: 'image', classId: 1, className: 'Diction Class', uploadedAt: '2025-01-23' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'video' | 'image'>('pdf');
  const [classId, setClassId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!title.trim() || !classId || !selectedFile) {
      toast.error('Please fill all fields and upload file');
      return;
    }
    const newMaterial = {
      id: materials.length + 1,
      title,
      type,
      classId: parseInt(classId),
      className: 'Sample Class',
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMaterials([newMaterial, ...materials]);
    setTitle('');
    setClassId('');
    setSelectedFile(null);
    setIsDialogOpen(false);
    toast.success('Material uploaded successfully!');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Materials</h1>
          <p className="text-muted-foreground mt-2">Upload and manage class materials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Material</DialogTitle>
              <DialogDescription>Add materials for your classes</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Material Title</Label>
                <Input
                  placeholder="e.g., Diction Exercises PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'pdf' ? 'default' : 'outline'}
                    onClick={() => setType('pdf')}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant={type === 'video' ? 'default' : 'outline'}
                    onClick={() => setType('video')}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button
                    variant={type === 'image' ? 'default' : 'outline'}
                    onClick={() => setType('image')}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Image
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Class ID</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    type="file"
                    accept={type === 'pdf' ? 'application/pdf' : type === 'video' ? 'video/*' : 'image/*'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Upload Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => (
          <Card key={material.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(material.type)}
                  {material.title}
                </CardTitle>
                <Badge>{material.type.toUpperCase()}</Badge>
              </div>
              <CardDescription>{material.className}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uploaded: {material.uploadedAt}</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
