import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, QrCode, Ticket, Calendar, MapPin, Clock, Download, Share2, CheckCircle2 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock ticket data - will be replaced with API call
const mockTicket = {
  id: '1',
  ticketNumber: 'TKT-2025-001234',
  qrCode: 'QR-2025-001234',
  qrCodeImage: null, // Will be generated
  status: 'ACTIVE',
  price: 50,
  purchasedAt: new Date('2025-01-20'),
  expiresAt: new Date('2025-02-15'),
  class: {
    id: '1',
    title: 'Shopify Store Setup & Brand Building',
    description: 'Learn how to set up and build your Shopify store',
    startTime: new Date('2025-02-10T10:00:00'),
    endTime: new Date('2025-02-10T13:00:00'),
    venue: { name: 'Business Center', address: '123 Main St', city: 'Mexico City' },
    instructor: { name: 'Maria Rodriguez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  },
  meetup: null,
};

const TicketDetailPage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const [qrCodeVisible, setQrCodeVisible] = useState(true);

  // In production, fetch ticket by ID
  const ticket = mockTicket;

  const event = ticket.class || ticket.meetup;
  const eventType = ticket.class ? 'class' : 'vibe';
  const eventDate = ticket.class?.startTime || ticket.meetup?.startTime;

  const handleDownloadQR = () => {
    // In production, download QR code image
    toast.success('QR code download started');
  };

  const handleShareTicket = () => {
    // In production, share ticket
    if (navigator.share) {
      navigator.share({
        title: `Ticket: ${event?.title}`,
        text: `Check out my ticket for ${event?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ticket link copied to clipboard');
    }
  };

  // Generate QR code data (in production, this would be a proper QR code)
  const qrCodeData = JSON.stringify({
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    qrCode: ticket.qrCode,
    userId: user?.id,
    eventType,
    eventId: event?.id,
  });

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center gap-4 px-4 py-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Ticket Details</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Ticket Number */}
        <div className="card-elevated p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Ticket Number</span>
            </div>
            {ticket.status === 'ACTIVE' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">Active</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{ticket.ticketNumber}</p>
        </div>

        {/* QR Code */}
        <div className="card-elevated p-6 rounded-2xl">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-1">QR Code</h2>
            <p className="text-xs text-muted-foreground">Show this at the event entrance</p>
          </div>
          
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-64 h-64 bg-white rounded-2xl p-4 border-4 border-primary/20 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
            >
              {qrCodeVisible ? (
                <div className="text-center space-y-2">
                  <QrCode className="w-48 h-48 mx-auto text-foreground" />
                  <p className="text-xs font-mono text-muted-foreground break-all">{ticket.qrCode}</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">QR Code hidden</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQrCodeVisible(true)}
                  >
                    Show QR Code
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setQrCodeVisible(!qrCodeVisible)}
            >
              {qrCodeVisible ? 'Hide' : 'Show'} QR Code
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShareTicket}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Event Details */}
        {event && (
          <div className="card-elevated p-4 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Event Details</h2>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
              {ticket.class?.description && (
                <p className="text-sm text-muted-foreground">{ticket.class.description}</p>
              )}
            </div>

            <div className="space-y-3">
              {eventDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(eventDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(eventDate), 'h:mm a')}
                      {ticket.class?.endTime && ` - ${format(new Date(ticket.class.endTime), 'h:mm a')}`}
                    </p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{event.venue.name}</p>
                    {event.venue.address && (
                      <p className="text-sm text-muted-foreground">{event.venue.address}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{event.venue.city}</p>
                  </div>
                </div>
              )}

              {ticket.class?.instructor && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary font-semibold">I</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Instructor</p>
                    <p className="text-sm text-muted-foreground">{ticket.class.instructor.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (eventType === 'class') {
                    navigate(`/class/${event.id}`);
                  } else {
                    navigate(`/meetup/${event.id}`);
                  }
                }}
              >
                View Event Details
              </Button>
            </div>
          </div>
        )}

        {/* Purchase Info */}
        <div className="card-elevated p-4 rounded-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">Purchase Information</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-sm font-semibold text-foreground">
                {ticket.price > 0 ? `$${ticket.price}` : 'Free'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purchased</span>
              <span className="text-sm text-foreground">
                {format(new Date(ticket.purchasedAt), 'MMM d, yyyy')}
              </span>
            </div>
            {ticket.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className="text-sm text-foreground">
                  {format(new Date(ticket.expiresAt), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default TicketDetailPage;
