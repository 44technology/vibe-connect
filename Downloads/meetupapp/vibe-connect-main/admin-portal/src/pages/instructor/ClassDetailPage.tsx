import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  ArrowLeft, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Monitor, 
  Building,
  Plus,
  Upload,
  FileText,
  Video,
  Image,
  File,
  Download,
  BookOpen,
  Edit,
  ListChecks,
  PlayCircle,
  ShoppingBag,
  Package,
  Gift
} from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

// Mock data - In real app, this would come from API
const mockClasses = [
  { 
    id: 1, 
    title: 'Diction Class', 
    type: 'online', 
    price: 50, 
    maxStudents: 20, 
    currentStudents: 12, 
    location: 'Zoom', 
    meetingPlatform: 'zoom',
    meetingLink: 'https://zoom.us/j/123456789',
    date: '2025-02-05', 
    time: '18:00', 
    duration: '1 hour', 
    frequency: 'Monday, Wednesday, Friday',
    description: 'Learn proper diction and pronunciation techniques',
    syllabus: [
      {
        id: 'module-1',
        title: 'Introduction to Diction',
        description: 'Learn the fundamentals of proper diction',
        lessons: [
          { id: 'lesson-1', title: 'Diction Basics', duration: '30 min', description: 'Understanding proper pronunciation' },
          { id: 'lesson-2', title: 'Vowel Sounds', duration: '45 min', description: 'Mastering vowel pronunciation' },
        ],
      },
      {
        id: 'module-2',
        title: 'Advanced Techniques',
        description: 'Advanced diction and speech techniques',
        lessons: [
          { id: 'lesson-3', title: 'Consonant Clarity', duration: '40 min', description: 'Clear consonant pronunciation' },
          { id: 'lesson-4', title: 'Speech Flow', duration: '50 min', description: 'Natural speech patterns' },
        ],
      },
    ],
    digitalProducts: [
      { id: 'dp1', name: 'Diction Workbook', description: 'Complete practice exercises', price: 29 },
    ],
    courseMaterials: [
      { id: 'cm1', name: 'Pronunciation Guide', type: 'pdf' },
    ],
    bonusContent: [
      { id: 'bc1', name: 'Q&A Recording', description: 'Access to live Q&A session' },
    ],
  },
  { 
    id: 2, 
    title: 'AutoCAD Basics', 
    type: 'onsite', 
    price: 75, 
    maxStudents: 15, 
    currentStudents: 8, 
    location: 'Training Center', 
    date: '2025-02-10', 
    time: '14:00', 
    duration: '2 hours', 
    frequency: 'weekly',
    description: 'Master the basics of AutoCAD design software',
    syllabus: [
      {
        id: 'module-1',
        title: 'AutoCAD Interface',
        description: 'Understanding the AutoCAD workspace',
        lessons: [
          { id: 'lesson-1', title: 'Interface Overview', duration: '45 min', description: 'Navigating AutoCAD interface' },
          { id: 'lesson-2', title: 'Basic Tools', duration: '60 min', description: 'Essential drawing tools' },
        ],
      },
    ],
  },
];

const mockMaterials = [
  { id: 1, title: 'Diction Exercises PDF', type: 'pdf', classId: 1, lessonId: null, uploadedAt: '2025-01-25' },
  { id: 2, title: 'Pronunciation Guide', type: 'image', classId: 1, lessonId: 1, uploadedAt: '2025-01-23' },
  { id: 3, title: 'AutoCAD Tutorial Video', type: 'video', classId: 2, lessonId: null, uploadedAt: '2025-01-24' },
  { id: 4, title: 'General Study Material', type: 'pdf', classId: null, lessonId: null, uploadedAt: '2025-01-20' },
];

const mockCourseContent = [
  { 
    id: 1, 
    classId: 1, 
    lesson: 'Lesson 1: Introduction', 
    hours: 2, 
    schedule: 'Weekly on Mondays', 
    description: 'Introduction to diction basics',
    videos: ['https://example.com/video1.mp4'],
    images: ['https://example.com/image1.jpg']
  },
  { 
    id: 2, 
    classId: 1, 
    lesson: 'Lesson 2: Vowels', 
    hours: 2, 
    schedule: 'Weekly on Mondays', 
    description: 'Mastering vowel pronunciation',
    videos: [],
    images: ['https://example.com/image2.jpg', 'https://example.com/image3.jpg']
  },
  { 
    id: 3, 
    classId: 2, 
    lesson: 'Module 1: Interface', 
    hours: 3, 
    schedule: 'Weekly on Wednesdays', 
    description: 'Understanding AutoCAD interface',
    videos: ['https://example.com/video2.mp4'],
    images: []
  },
];

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const classId = parseInt(id || '0');
  
  const classData = useMemo(() => mockClasses.find(c => c.id === classId), [classId]);
  // Materials: class'a bağlı olanlar (lesson'a bağlı veya değil) + bağımsız olanlar (classId: null)
  const initialMaterials = useMemo(() => {
    const classRelatedMaterials = mockMaterials.filter(m => m.classId === classId);
    const independentMaterials = mockMaterials.filter(m => m.classId === null);
    return [...classRelatedMaterials, ...independentMaterials];
  }, [classId]);
  const initialContent = useMemo(() => mockCourseContent.filter(c => c.classId === classId), [classId]);

  const [materials, setMaterials] = useState(initialMaterials);
  const [contents, setContents] = useState(initialContent);
  
  // Material dialog state
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'image'>('pdf');
  const [materialLessonId, setMaterialLessonId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Content dialog state
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [lesson, setLesson] = useState('');
  const [hours, setHours] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  
  // Lesson media dialog state
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isLessonMediaDialogOpen, setIsLessonMediaDialogOpen] = useState(false);
  const [lessonMediaType, setLessonMediaType] = useState<'video' | 'image'>('video');
  const [lessonMediaFile, setLessonMediaFile] = useState<File | null>(null);
  
  // Edit class dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'online' | 'onsite' | 'hybrid'>('online');
  const [editPrice, setEditPrice] = useState('');
  const [editMaxStudents, setEditMaxStudents] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMeetingPlatform, setEditMeetingPlatform] = useState<'zoom' | 'teams' | 'meet' | 'webex' | ''>('');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editFrequency, setEditFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState('');
  
  const weekDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];
  
  const toggleEditDay = (day: string) => {
    setEditSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  
  // Initialize edit form when dialog opens
  const handleEditClick = () => {
    if (classData) {
      setEditTitle(classData.title);
      setEditType(classData.type);
      setEditPrice(classData.price.toString());
      setEditMaxStudents(classData.maxStudents.toString());
      setEditLocation(classData.location);
      setEditDate(classData.date);
      setEditTime(classData.time);
      setEditDuration(classData.duration);
      setEditFrequency(classData.frequency as 'daily' | 'weekly' | 'monthly');
      setEditDescription(classData.description);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleEditSubmit = () => {
    if (!editTitle.trim() || !editPrice || !editMaxStudents || !editDate || !editTime || !editDuration) {
      toast.error('Please fill all required fields');
      return;
    }
    if (editFrequency === 'custom' && editSelectedDays.length === 0) {
      toast.error('Please select at least one day for custom frequency');
      return;
    }
    
    const frequencyDisplay = editFrequency === 'custom' && editSelectedDays.length > 0
      ? editSelectedDays.map(d => weekDays.find(w => w.value === d)?.label).join(', ')
      : editFrequency;
    
    const updatedClass = {
      ...classData!,
      title: editTitle,
      type: editType,
      price: parseFloat(editPrice),
      maxStudents: parseInt(editMaxStudents),
      location: (editType === 'online' || editType === 'hybrid') ? (editMeetingPlatform ? editMeetingPlatform.charAt(0).toUpperCase() + editMeetingPlatform.slice(1) : '') : editLocation,
      meetingPlatform: (editType === 'online' || editType === 'hybrid') ? editMeetingPlatform : undefined,
      meetingLink: (editType === 'online' || editType === 'hybrid') ? editMeetingLink : undefined,
      date: editDate,
      time: editTime,
      duration: editDuration,
      frequency: frequencyDisplay,
      description: editDescription,
    };
    // Update mock data
    const classIndex = mockClasses.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
      mockClasses[classIndex] = updatedClass;
    }
    setClassData(updatedClass);
    setIsEditDialogOpen(false);
    toast.success('Class updated successfully!');
  };

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Class not found</p>
          <Button onClick={() => navigate('/classes')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const handleMaterialSubmit = () => {
    if (!materialTitle.trim() || !selectedFile) {
      toast.error('Please fill all fields and upload file');
      return;
    }
    const newMaterial = {
      id: materials.length + 1,
      title: materialTitle,
      type: materialType,
      classId: materialLessonId ? classId : null, // Bağımsız materyal için null
      lessonId: materialLessonId ? parseInt(materialLessonId) : null,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMaterials([newMaterial, ...materials]);
    setMaterialTitle('');
    setMaterialLessonId('');
    setSelectedFile(null);
    setIsMaterialDialogOpen(false);
    toast.success('Material uploaded successfully!');
  };

  const handleContentSubmit = () => {
    if (!lesson.trim() || !hours || !schedule.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    const newContent = {
      id: contents.length + 1,
      classId: classId,
      lesson,
      hours: parseInt(hours),
      schedule,
      description,
      videos: [],
      images: [],
    };
    setContents([newContent, ...contents]);
    setLesson('');
    setHours('');
    setSchedule('');
    setDescription('');
    setIsContentDialogOpen(false);
    toast.success('Course content added successfully!');
  };

  const handleLessonMediaSubmit = () => {
    if (!lessonMediaFile || !selectedLesson) {
      toast.error('Please select a file');
      return;
    }
    const lessonIndex = contents.findIndex(c => c.id === selectedLesson);
    if (lessonIndex === -1) return;

    const updatedContents = [...contents];
    const mediaUrl = URL.createObjectURL(lessonMediaFile);
    
    if (lessonMediaType === 'video') {
      updatedContents[lessonIndex].videos = [...updatedContents[lessonIndex].videos, mediaUrl];
    } else {
      updatedContents[lessonIndex].images = [...updatedContents[lessonIndex].images, mediaUrl];
    }
    
    setContents(updatedContents);
    setLessonMediaFile(null);
    setIsLessonMediaDialogOpen(false);
    setSelectedLesson(null);
    toast.success(`${lessonMediaType === 'video' ? 'Video' : 'Image'} added to lesson successfully!`);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/classes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-8 h-8" />
              {classData.title}
            </h1>
            <p className="text-muted-foreground mt-1">{classData.description}</p>
          </div>
        </div>
        <Button onClick={handleEditClick}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Class
        </Button>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>Update class information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Class Title</Label>
                <Input
                  placeholder="e.g., Diction Class"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={editType === 'online' ? 'default' : 'outline'}
                    onClick={() => setEditType('online')}
                    className="flex-1"
                    type="button"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Online
                  </Button>
                  <Button
                    variant={editType === 'onsite' ? 'default' : 'outline'}
                    onClick={() => setEditType('onsite')}
                    className="flex-1"
                    type="button"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Onsite
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 20"
                    value={editMaxStudents}
                    onChange={(e) => setEditMaxStudents(e.target.value)}
                  />
                </div>
              </div>
              {(editType === 'online' || editType === 'hybrid') && (
                <>
                  <div className="space-y-2">
                    <Label>Meeting Platform</Label>
                    <Select value={editMeetingPlatform} onValueChange={(value) => setEditMeetingPlatform(value as 'zoom' | 'teams' | 'meet' | 'webex')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                        <SelectItem value="meet">Google Meet</SelectItem>
                        <SelectItem value="webex">Webex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting Link</Label>
                    <Input
                      placeholder="e.g., https://zoom.us/j/123456789"
                      value={editMeetingLink}
                      onChange={(e) => setEditMeetingLink(e.target.value)}
                    />
                  </div>
                </>
              )}
              {editType === 'hybrid' && (
                <div className="space-y-2">
                  <Label>Physical Location</Label>
                  <Input
                    placeholder="e.g., Training Center, Room 101"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
              )}
              {editType === 'onsite' && (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Training Center"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 1 hour"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={editFrequency === 'daily' ? 'default' : 'outline'}
                        onClick={() => {
                          setEditFrequency('daily');
                          setEditSelectedDays([]);
                        }}
                        size="sm"
                        type="button"
                      >
                        Daily
                      </Button>
                      <Button
                        variant={editFrequency === 'weekly' ? 'default' : 'outline'}
                        onClick={() => {
                          setEditFrequency('weekly');
                          setEditSelectedDays([]);
                        }}
                        size="sm"
                        type="button"
                      >
                        Weekly
                      </Button>
                      <Button
                        variant={editFrequency === 'monthly' ? 'default' : 'outline'}
                        onClick={() => {
                          setEditFrequency('monthly');
                          setEditSelectedDays([]);
                        }}
                        size="sm"
                        type="button"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={editFrequency === 'custom' ? 'default' : 'outline'}
                        onClick={() => setEditFrequency('custom')}
                        size="sm"
                        type="button"
                      >
                        Custom Days
                      </Button>
                    </div>
                    {editFrequency === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/50">
                        {weekDays.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-day-${day.value}`}
                              checked={editSelectedDays.includes(day.value)}
                              onCheckedChange={() => toggleEditDay(day.value)}
                            />
                            <label
                              htmlFor={`edit-day-${day.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {editFrequency === 'custom' && editSelectedDays.length === 0 && (
                      <p className="text-xs text-muted-foreground">Please select at least one day</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your class..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleEditSubmit} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={classData.type === 'online' ? 'default' : 'secondary'}>
                {classData.type === 'online' ? <Monitor className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                {classData.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>${classData.price}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{classData.currentStudents}/{classData.maxStudents} students</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{classData.date} at {classData.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{classData.duration} ({classData.frequency})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{classData.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Materials and Course Content */}
      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
        </TabsList>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Materials</h2>
              <p className="text-muted-foreground mt-1">Upload and manage class materials</p>
            </div>
            <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Material</DialogTitle>
                  <DialogDescription>Add materials for this class</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Material Title</Label>
                    <Input
                      placeholder="e.g., Diction Exercises PDF"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={materialType === 'pdf' ? 'default' : 'outline'}
                        onClick={() => setMaterialType('pdf')}
                        className="flex-1"
                        type="button"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button
                        variant={materialType === 'video' ? 'default' : 'outline'}
                        onClick={() => setMaterialType('video')}
                        className="flex-1"
                        type="button"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </Button>
                      <Button
                        variant={materialType === 'image' ? 'default' : 'outline'}
                        onClick={() => setMaterialType('image')}
                        className="flex-1"
                        type="button"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Image
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Material Type</Label>
                    <div className="space-y-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={materialLessonId}
                        onChange={(e) => setMaterialLessonId(e.target.value)}
                      >
                        <option value="class">Class Material (Linked to this class)</option>
                        {contents.map((content) => (
                          <option key={content.id} value={content.id.toString()}>
                            Lesson Material: {content.lesson}
                          </option>
                        ))}
                        <option value="independent">Independent Material (Not linked)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Choose if material is for the class, a specific lesson, or independent
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        type="file"
                        accept={materialType === 'pdf' ? 'application/pdf' : materialType === 'video' ? 'video/*' : 'image/*'}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>
                  <Button onClick={handleMaterialSubmit} className="w-full">
                    Upload Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No materials uploaded yet
              </div>
            ) : (
              materials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        {material.title}
                      </CardTitle>
                      <Badge>{material.type.toUpperCase()}</Badge>
                    </div>
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
              ))
            )}
          </div>
        </TabsContent>

        {/* Course Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Course Content</h2>
              <p className="text-muted-foreground mt-1">Manage lesson plans and schedules</p>
            </div>
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Course Content</DialogTitle>
                  <DialogDescription>Define lesson plans and schedules</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lesson Title</Label>
                    <Input
                      placeholder="e.g., Lesson 1: Introduction"
                      value={lesson}
                      onChange={(e) => setLesson(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hours per Session</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Input
                      placeholder="e.g., Weekly on Mondays"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the lesson content..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleContentSubmit} className="w-full">
                    Add Content
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {contents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No course content added yet
              </div>
            ) : (
              contents.map((content) => (
                <Card key={content.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {content.lesson}
                        </CardTitle>
                        <CardDescription className="mt-2">{content.description}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLesson(content.id);
                          setIsLessonMediaDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Media
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{content.hours} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{content.schedule}</span>
                        </div>
                      </div>

                      {/* Videos */}
                      {content.videos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Videos ({content.videos.length})
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {content.videos.map((video, idx) => (
                              <div key={idx} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                <video
                                  src={video}
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {content.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Images ({content.images.length})
                          </h4>
                          <div className="grid gap-2 md:grid-cols-3">
                            {content.images.map((image, idx) => (
                              <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                <img
                                  src={image}
                                  alt={`${content.lesson} - Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Lesson Media Dialog */}
          <Dialog open={isLessonMediaDialogOpen} onOpenChange={setIsLessonMediaDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Media to Lesson</DialogTitle>
                <DialogDescription>
                  Add video or image to {contents.find(c => c.id === selectedLesson)?.lesson}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Media Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={lessonMediaType === 'video' ? 'default' : 'outline'}
                      onClick={() => setLessonMediaType('video')}
                      className="flex-1"
                      type="button"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                    <Button
                      variant={lessonMediaType === 'image' ? 'default' : 'outline'}
                      onClick={() => setLessonMediaType('image')}
                      className="flex-1"
                      type="button"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Image
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Upload {lessonMediaType === 'video' ? 'Video' : 'Image'}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      type="file"
                      accept={lessonMediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => setLessonMediaFile(e.target.files?.[0] || null)}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
                <Button onClick={handleLessonMediaSubmit} className="w-full">
                  Add {lessonMediaType === 'video' ? 'Video' : 'Image'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Monetization Tab */}
        <TabsContent value="monetization" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Monetization</h2>
              <p className="text-muted-foreground mt-1">Manage digital products, course materials, and bonus content</p>
            </div>
          </div>

          {/* Digital Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle>Digital Products</CardTitle>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
              <CardDescription>Sell digital products alongside your class</CardDescription>
            </CardHeader>
            <CardContent>
              {classData.digitalProducts && Array.isArray(classData.digitalProducts) && classData.digitalProducts.length > 0 ? (
                <div className="space-y-3">
                  {classData.digitalProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No digital products added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Course Materials */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Course Materials</CardTitle>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </div>
              <CardDescription>Free downloadable materials for enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              {classData.courseMaterials && Array.isArray(classData.courseMaterials) && classData.courseMaterials.length > 0 ? (
                <div className="space-y-3">
                  {classData.courseMaterials.map((material: any) => (
                    <div key={material.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{material.name}</p>
                          {material.type && (
                            <p className="text-xs text-muted-foreground mt-1">{material.type.toUpperCase()}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No course materials added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Bonus Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-orange-500" />
                  <CardTitle>Bonus Content</CardTitle>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bonus
                </Button>
              </div>
              <CardDescription>Exclusive bonus content for enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              {classData.bonusContent && Array.isArray(classData.bonusContent) && classData.bonusContent.length > 0 ? (
                <div className="space-y-3">
                  {classData.bonusContent.map((bonus: any) => (
                    <div key={bonus.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{bonus.name}</p>
                        {bonus.description && (
                          <p className="text-sm text-muted-foreground mt-1">{bonus.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No bonus content added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Platform Fee Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Platform Fee</p>
                  <p className="text-sm text-muted-foreground">Ulikme charges a 3% platform fee on all paid classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
