import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ScheduleCapacityPage() {
  const [schedules, setSchedules] = useState([
    { id: 1, title: 'Diction Class', date: '2025-02-05', time: '18:00', capacity: 20, enrolled: 12, status: 'active' },
    { id: 2, title: 'AutoCAD Basics', date: '2025-02-10', time: '14:00', capacity: 15, enrolled: 8, status: 'active' },
  ]);

  const [newSchedule, setNewSchedule] = useState({
    title: '',
    date: '',
    time: '',
    capacity: '',
  });

  const handleAddSchedule = () => {
    if (!newSchedule.title || !newSchedule.date || !newSchedule.time || !newSchedule.capacity) {
      toast.error('Please fill all fields');
      return;
    }
    const schedule = {
      id: schedules.length + 1,
      ...newSchedule,
      capacity: parseInt(newSchedule.capacity),
      enrolled: 0,
      status: 'active' as const,
    };
    setSchedules([...schedules, schedule]);
    setNewSchedule({ title: '', date: '', time: '', capacity: '' });
    toast.success('Schedule added successfully!');
  };

  const getCapacityStatus = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return { color: 'text-red-500', label: 'Almost Full' };
    if (percentage >= 70) return { color: 'text-yellow-500', label: 'Filling Up' };
    return { color: 'text-green-500', label: 'Available' };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Schedule & Capacity</h1>
        <p className="text-muted-foreground mt-2">Manage your class schedules and capacity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Schedule</CardTitle>
          <CardDescription>Create a new scheduled session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Class Title</Label>
              <Input
                placeholder="e.g., Diction Class"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                placeholder="e.g., 20"
                value={newSchedule.capacity}
                onChange={(e) => setNewSchedule({ ...newSchedule, capacity: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddSchedule} className="mt-4">
            Add Schedule
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => {
          const status = getCapacityStatus(schedule.enrolled, schedule.capacity);
          return (
            <Card key={schedule.id}>
              <CardHeader>
                <CardTitle className="text-lg">{schedule.title}</CardTitle>
                <CardDescription>
                  <span className={`font-semibold ${status.color}`}>{status.label}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{schedule.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{schedule.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{schedule.enrolled} / {schedule.capacity} enrolled</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(schedule.enrolled / schedule.capacity) * 100}%` }}
                  />
                </div>
                {schedule.enrolled >= schedule.capacity * 0.9 && (
                  <div className="flex items-center gap-2 text-xs text-yellow-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Consider adding more capacity</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
