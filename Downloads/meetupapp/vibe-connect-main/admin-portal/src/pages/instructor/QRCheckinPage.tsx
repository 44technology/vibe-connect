import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { QrCode, CheckCircle2, XCircle, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function QRCheckinPage() {
  const [checkIns, setCheckIns] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', ticketId: 'T12345', checkedIn: true, time: '2025-01-24 18:00' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', ticketId: 'T12346', checkedIn: false, time: null },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', ticketId: 'T12347', checkedIn: true, time: '2025-01-24 18:05' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleCheckIn = (id: number) => {
    setCheckIns(checkIns.map(c => 
      c.id === id 
        ? { ...c, checkedIn: true, time: new Date().toLocaleString() }
        : c
    ));
    toast.success('Checked in successfully!');
  };

  const generateQRCode = () => {
    const code = `QR-${Date.now()}`;
    setQrCode(code);
    toast.success('QR Code generated!');
  };

  const filteredCheckIns = checkIns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">QR Check-in</h1>
        <p className="text-muted-foreground mt-2">Manage attendee check-ins</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>Scan QR codes for check-in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              {qrCode ? (
                <div className="text-center space-y-2">
                  <QrCode className="w-24 h-24 mx-auto text-primary" />
                  <p className="text-sm font-mono">{qrCode}</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <p>Click to generate QR code</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={generateQRCode} className="flex-1">
                Generate QR Code
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Or enter ticket ID manually"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search & Check In
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-in List</CardTitle>
            <CardDescription>View and manage attendees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{checkIn.name}</p>
                      {checkIn.checkedIn ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{checkIn.email}</p>
                    <p className="text-xs text-muted-foreground">Ticket: {checkIn.ticketId}</p>
                    {checkIn.time && (
                      <p className="text-xs text-muted-foreground">Checked in: {checkIn.time}</p>
                    )}
                  </div>
                  {!checkIn.checkedIn && (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(checkIn.id)}
                    >
                      Check In
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
