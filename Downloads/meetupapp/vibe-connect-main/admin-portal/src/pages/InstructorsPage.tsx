import { useState } from 'react';
import { Search, DollarSign, Award, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

// Mock data
const mockInstructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    category: 'Public Speaking & Diction',
    totalEarnings: 12500,
    monthlyEarnings: 3200,
    totalStudents: 245,
    activeClasses: 8,
    rating: 4.9,
    certifications: ['Certified Public Speaker', 'Diction Master', 'TEDx Speaker'],
    skills: ['Public Speaking', 'Voice Training', 'Presentation Skills', 'Confidence Building'],
    joinedDate: '2023-06-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    category: 'Yoga & Meditation',
    totalEarnings: 8900,
    monthlyEarnings: 2100,
    totalStudents: 156,
    activeClasses: 5,
    rating: 4.8,
    certifications: ['Yoga Alliance Certified', 'Meditation Teacher', '200-Hour YTT'],
    skills: ['Hatha Yoga', 'Vinyasa Flow', 'Meditation', 'Breathwork'],
    joinedDate: '2023-08-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    category: 'Cooking & Baking',
    totalEarnings: 15200,
    monthlyEarnings: 3800,
    totalStudents: 312,
    activeClasses: 12,
    rating: 4.95,
    certifications: ['Culinary Institute Graduate', 'Pastry Chef Certified'],
    skills: ['Italian Cuisine', 'Pastry Making', 'Baking', 'Food Styling'],
    joinedDate: '2023-05-10',
    status: 'active',
  },
];

export default function InstructorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const filteredInstructors = mockInstructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Instructors</h1>
          <p className="text-muted-foreground mt-1">Manage instructors, teachers, and mentors</p>
        </div>
        <Button>Add New Instructor</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search instructors by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Instructors List */}
      <div className="grid gap-4">
        {filteredInstructors.map((instructor) => (
          <Card key={instructor.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <GraduationCap className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{instructor.name}</h3>
                        <Badge>{instructor.category}</Badge>
                        <Badge variant={instructor.status === 'active' ? 'default' : 'outline'}>
                          {instructor.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{instructor.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Rating: {instructor.rating} ⭐</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Joined: {instructor.joinedDate}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedInstructor(instructor);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>

                  {/* Earnings & Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Earnings</p>
                        <p className="text-sm font-semibold text-foreground">
                          ${instructor.totalEarnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="text-sm font-semibold text-foreground">
                          ${instructor.monthlyEarnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                        <p className="text-sm font-semibold text-foreground">{instructor.totalStudents}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Active Classes</p>
                        <p className="text-sm font-semibold text-foreground">{instructor.activeClasses}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {instructor.skills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                      {instructor.skills.length > 4 && (
                        <Badge variant="outline">+{instructor.skills.length - 4} more</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructor Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Instructor Details</DialogTitle>
            <DialogDescription>Complete information and payment history</DialogDescription>
          </DialogHeader>
          {selectedInstructor && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedInstructor.avatar}
                  alt={selectedInstructor.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{selectedInstructor.name}</h3>
                  <p className="text-muted-foreground mb-2">{selectedInstructor.email}</p>
                  <Badge>{selectedInstructor.category}</Badge>
                </div>
              </div>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedInstructor.totalEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Monthly Earnings</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${selectedInstructor.monthlyEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                      <p className="text-xl font-semibold">{selectedInstructor.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active Classes</p>
                      <p className="text-xl font-semibold">{selectedInstructor.activeClasses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications & Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedInstructor.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Competencies */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Competencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstructor.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button className="flex-1">View Payment History</Button>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
