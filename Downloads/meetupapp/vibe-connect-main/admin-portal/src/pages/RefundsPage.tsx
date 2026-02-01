import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  BookOpen,
  Search,
  Filter,
  ArrowLeftRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

type RefundRequest = {
  id: string;
  paymentId: string;
  paymentNumber: string;
  userId: string;
  userName: string;
  classId: string;
  className: string;
  amount: number;
  enrollmentDate: string;
  requestDate: string;
  hoursSinceEnrollment: number;
  status: RefundStatus;
  reason?: string;
  adminNotes?: string;
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([
    {
      id: 'ref-1',
      paymentId: 'pay-1',
      paymentNumber: 'PAY-2025-001234',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      classId: 'class-1',
      className: 'Diction Class',
      amount: 50,
      enrollmentDate: '2025-01-24T10:30:00',
      requestDate: '2025-01-24T18:45:00',
      hoursSinceEnrollment: 8.25,
      status: 'pending',
      reason: 'Schedule conflict',
    },
    {
      id: 'ref-2',
      paymentId: 'pay-2',
      paymentNumber: 'PAY-2025-001235',
      userId: 'user-2',
      userName: 'Mike Chen',
      classId: 'class-2',
      className: 'AutoCAD Basics',
      amount: 75,
      enrollmentDate: '2025-01-23T14:00:00',
      requestDate: '2025-01-24T13:30:00',
      hoursSinceEnrollment: 23.5,
      status: 'pending',
      reason: 'Found a better alternative',
    },
    {
      id: 'ref-3',
      paymentId: 'pay-3',
      paymentNumber: 'PAY-2025-001200',
      userId: 'user-3',
      userName: 'Emma Rodriguez',
      classId: 'class-1',
      className: 'Diction Class',
      amount: 50,
      enrollmentDate: '2025-01-20T09:00:00',
      requestDate: '2025-01-20T10:30:00',
      hoursSinceEnrollment: 1.5,
      status: 'approved',
      reason: 'Change of plans',
    },
    {
      id: 'ref-4',
      paymentId: 'pay-4',
      paymentNumber: 'PAY-2025-001150',
      userId: 'user-4',
      userName: 'David Martinez',
      classId: 'class-2',
      className: 'AutoCAD Basics',
      amount: 75,
      enrollmentDate: '2025-01-18T16:00:00',
      requestDate: '2025-01-19T20:00:00',
      hoursSinceEnrollment: 28,
      status: 'rejected',
      reason: 'Not satisfied',
      adminNotes: 'Requested after 24 hours - policy violation',
    },
  ]);

  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');

  const handleApprove = (refund: RefundRequest) => {
    if (refund.hoursSinceEnrollment > 24) {
      toast.error('Cannot approve refund after 24 hours');
      return;
    }
    setSelectedRefund(refund);
    setIsRefundDialogOpen(true);
  };

  const handleReject = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setAdminNotes('');
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = (status: 'approved' | 'rejected') => {
    if (!selectedRefund) return;

    if (status === 'approved' && selectedRefund.hoursSinceEnrollment > 24) {
      toast.error('Cannot approve refund after 24 hours');
      return;
    }

    setRefunds(refunds.map(r => 
      r.id === selectedRefund.id 
        ? { 
            ...r, 
            status: status === 'approved' ? 'approved' : 'rejected',
            adminNotes: adminNotes || undefined,
          }
        : r
    ));
    
    setIsRefundDialogOpen(false);
    setSelectedRefund(null);
    setAdminNotes('');
    
    toast.success(`Refund ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = searchQuery === '' || 
      refund.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingRefunds = filteredRefunds.filter(r => r.status === 'pending');
  const approvedRefunds = filteredRefunds.filter(r => r.status === 'approved');
  const rejectedRefunds = filteredRefunds.filter(r => r.status === 'rejected');

  const getStatusColor = (status: RefundStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'processed': return 'outline';
    }
  };

  const getStatusLabel = (status: RefundStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'processed': return 'Processed';
    }
  };

  const renderRefundCard = (refund: RefundRequest) => {
    const isEligible = refund.hoursSinceEnrollment <= 24;
    
    return (
      <Card key={refund.id} className={!isEligible && refund.status === 'pending' ? 'border-yellow-500/50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(refund.status)}>
                {getStatusLabel(refund.status)}
              </Badge>
              {!isEligible && refund.status === 'pending' && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Over 24h
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">${refund.amount}</p>
              <p className="text-xs text-muted-foreground">Refund Amount</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                User
              </span>
              <span className="font-medium">{refund.userName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Class
              </span>
              <span className="font-medium">{refund.className}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Payment
              </span>
              <span className="font-medium font-mono text-xs">{refund.paymentNumber}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Enrolled
              </span>
              <span className="font-medium">
                {format(new Date(refund.enrollmentDate), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Hours Since
              </span>
              <span className={`font-medium ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
                {refund.hoursSinceEnrollment.toFixed(1)}h
              </span>
            </div>
            {refund.reason && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                <p className="text-sm text-foreground">{refund.reason}</p>
              </div>
            )}
            {refund.adminNotes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Admin Notes:</p>
                <p className="text-sm text-foreground">{refund.adminNotes}</p>
              </div>
            )}
          </div>

          {refund.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleReject(refund)}
                disabled={!isEligible}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleApprove(refund)}
                disabled={!isEligible}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Refund Management</h1>
        <p className="text-muted-foreground mt-2">Manage refund requests for class cancellations within 24 hours</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{refunds.length}</p>
              </div>
              <ArrowLeftRight className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRefunds.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedRefunds.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">
                  ${approvedRefunds.reduce((sum, r) => sum + r.amount, 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, class, or payment number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
                size="sm"
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
                size="sm"
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredRefunds.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRefunds.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRefunds.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRefunds.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRefunds.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No refund requests found</p>
              </div>
            ) : (
              filteredRefunds.map(renderRefundCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRefunds.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No pending refund requests</p>
              </div>
            ) : (
              pendingRefunds.map(renderRefundCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedRefunds.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No approved refunds</p>
              </div>
            ) : (
              approvedRefunds.map(renderRefundCard)
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedRefunds.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <XCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No rejected refunds</p>
              </div>
            ) : (
              rejectedRefunds.map(renderRefundCard)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Refund Action Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRefund && selectedRefund.hoursSinceEnrollment <= 24
                ? 'Approve Refund'
                : 'Reject Refund'}
            </DialogTitle>
            <DialogDescription>
              {selectedRefund && (
                <>
                  Process refund for {selectedRefund.userName}'s enrollment in {selectedRefund.className}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Number:</span>
                    <span className="font-medium font-mono">{selectedRefund.paymentNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="text-xl font-bold">${selectedRefund.amount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hours Since Enrollment:</span>
                    <span className={`font-medium ${selectedRefund.hoursSinceEnrollment <= 24 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedRefund.hoursSinceEnrollment.toFixed(1)}h
                    </span>
                  </div>
                  {selectedRefund.reason && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground mb-1">Reason:</p>
                      <p className="text-foreground">{selectedRefund.reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRefund.hoursSinceEnrollment > 24 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-600">Outside 24-Hour Window</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This refund request is outside the 24-hour policy window and should be rejected.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes about this refund decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRefundDialogOpen(false);
                    setSelectedRefund(null);
                    setAdminNotes('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {selectedRefund.hoursSinceEnrollment <= 24 ? (
                  <Button
                    onClick={() => confirmRefund('approved')}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Refund
                  </Button>
                ) : (
                  <Button
                    onClick={() => confirmRefund('rejected')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
