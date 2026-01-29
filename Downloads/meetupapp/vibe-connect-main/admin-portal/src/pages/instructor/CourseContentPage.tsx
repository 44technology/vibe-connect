import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Plus, BookOpen, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseContentPage() {
  const [contents, setContents] = useState([
    { id: 1, classId: 1, className: 'Diction Class', lesson: 'Lesson 1: Introduction', hours: 2, schedule: 'Weekly on Mondays' },
    { id: 2, classId: 1, className: 'Diction Class', lesson: 'Lesson 2: Vowels', hours: 2, schedule: 'Weekly on Mondays' },
    { id: 3, classId: 2, className: 'AutoCAD Basics', lesson: 'Module 1: Interface', hours: 3, schedule: 'Weekly on Wednesdays' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classId, setClassId] = useState('');
  const [lesson, setLesson] = useState('');
  const [hours, setHours] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!classId || !lesson.trim() || !hours || !schedule.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    const newContent = {
      id: contents.length + 1,
      classId: parseInt(classId),
      className: 'Sample Class',
      lesson,
      hours: parseInt(hours),
      schedule,
    };
    setContents([newContent, ...contents]);
    setClassId('');
    setLesson('');
    setHours('');
    setSchedule('');
    setDescription('');
    setIsDialogOpen(false);
    toast.success('Course content added successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Content</h1>
          <p className="text-muted-foreground mt-2">Manage lesson plans and schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Course Content</DialogTitle>
              <DialogDescription>Define lesson plans and schedules</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
              <Button onClick={handleSubmit} className="w-full">
                Add Content
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {content.lesson}
              </CardTitle>
              <CardDescription>{content.className}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{content.hours} hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{content.schedule}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
