import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DollarSign, Gift, ToggleLeft, ToggleRight, GraduationCap, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketsPricingPage() {
  const [tickets, setTickets] = useState([
    { id: 1, title: 'Diction Class', price: 50, type: 'paid', available: 20, sold: 12 },
    { id: 2, title: 'Free Workshop', price: 0, type: 'free', available: 100, sold: 45 },
  ]);

  const [newTicket, setNewTicket] = useState({
    title: '',
    price: '',
    type: 'paid' as 'paid' | 'free',
  });

  const handleAddTicket = () => {
    // Ticket MUST be linked to a class or meetup
    if (!newTicket.linkedTo) {
      toast.error('Please select whether this ticket is for a Class or Vibe/Meetup');
      return;
    }
    if (!newTicket.linkedId) {
      toast.error(`Please select a specific ${newTicket.linkedTo === 'class' ? 'class' : 'vibe/meetup'}`);
      return;
    }
    if (newTicket.type === 'paid' && (!newTicket.price || parseFloat(newTicket.price) <= 0)) {
      toast.error('Please enter a valid price for paid tickets');
      return;
    }
    
    const linkedEvent = newTicket.linkedTo === 'class' 
      ? mockClasses.find(c => c.id === Number(newTicket.linkedId))
      : mockMeetups.find(m => m.id === Number(newTicket.linkedId));
    
    if (!linkedEvent) {
      toast.error('Selected event not found');
      return;
    }
    
    const ticket = {
      id: tickets.length + 1,
      ...newTicket,
      linkedId: Number(newTicket.linkedId),
      title: linkedEvent.title,
      price: newTicket.type === 'paid' ? parseFloat(newTicket.price) : 0,
      available: 100,
      sold: 0,
    };
    setTickets([...tickets, ticket]);
    setNewTicket({ linkedTo: '', linkedId: '', price: '', type: 'paid' });
    toast.success('Ticket created and linked successfully!');
  };

  const toggleTicketType = (id: number) => {
    setTickets(tickets.map(t => 
      t.id === id 
        ? { ...t, type: t.type === 'paid' ? 'free' : 'paid', price: t.type === 'paid' ? 0 : 50 }
        : t
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tickets - Paid / Free</h1>
        <p className="text-muted-foreground mt-2">Manage ticket pricing and availability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
          <CardDescription>Link a ticket to a class or vibe/meetup. Tickets must be linked to an event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link to Event - REQUIRED */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Link to Event <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Button
                variant={newTicket.linkedTo === 'class' ? 'default' : 'outline'}
                onClick={() => setNewTicket({ ...newTicket, linkedTo: 'class', linkedId: '' })}
                type="button"
                className="flex-1"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Class
              </Button>
              <Button
                variant={newTicket.linkedTo === 'meetup' ? 'default' : 'outline'}
                onClick={() => setNewTicket({ ...newTicket, linkedTo: 'meetup', linkedId: '' })}
                type="button"
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Vibe / Meetup
              </Button>
            </div>
            {!newTicket.linkedTo && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">You must select Class or Vibe/Meetup to create a ticket</p>
              </div>
            )}
          </div>

          {/* Select Specific Class or Meetup */}
          {newTicket.linkedTo && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Select {newTicket.linkedTo === 'class' ? 'Class' : 'Vibe/Meetup'} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newTicket.linkedId}
                onValueChange={(value) => setNewTicket({ ...newTicket, linkedId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${newTicket.linkedTo === 'class' ? 'class' : 'vibe/meetup'}`} />
                </SelectTrigger>
                <SelectContent>
                  {newTicket.linkedTo === 'class' ? (
                    mockClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.title} - {cls.type} - ${cls.price}
                      </SelectItem>
                    ))
                  ) : (
                    mockMeetups.map((meetup) => (
                      <SelectItem key={meetup.id} value={meetup.id.toString()}>
                        {meetup.title} - {meetup.type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Ticket Type (Paid/Free) */}
          <div className="space-y-2">
            <Label>Ticket Type</Label>
            <div className="flex gap-2">
              <Button
                variant={newTicket.type === 'paid' ? 'default' : 'outline'}
                onClick={() => setNewTicket({ ...newTicket, type: 'paid' })}
                type="button"
                className="flex-1"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Paid
              </Button>
              <Button
                variant={newTicket.type === 'free' ? 'default' : 'outline'}
                onClick={() => setNewTicket({ ...newTicket, type: 'free', price: '' })}
                type="button"
                className="flex-1"
              >
                <Gift className="w-4 h-4 mr-2" />
                Free
              </Button>
            </div>
          </div>

          {/* Price (only for paid tickets) */}
          {newTicket.type === 'paid' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={newTicket.price}
                onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
          )}

          <Button 
            onClick={handleAddTicket} 
            className="w-full"
            disabled={!newTicket.linkedTo || !newTicket.linkedId || (newTicket.type === 'paid' && !newTicket.price)}
          >
            Create Ticket
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {(ticket as any).linkedTo && (
                    <Badge variant="outline" className="text-xs">
                      {(ticket as any).linkedTo === 'class' ? (
                        <><GraduationCap className="w-3 h-3 mr-1" />Class</>
                      ) : (
                        <><Calendar className="w-3 h-3 mr-1" />Vibe</>
                      )}
                    </Badge>
                  )}
                  <Badge variant={ticket.type === 'paid' ? 'default' : 'secondary'}>
                    {ticket.type === 'paid' ? 'Paid' : 'Free'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-2xl font-bold">
                  {ticket.type === 'paid' ? `$${ticket.price}` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sold</span>
                <span className="font-semibold">{ticket.sold} / {ticket.available}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Type</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTicketType(ticket.id)}
                  className="gap-2"
                >
                  {ticket.type === 'paid' ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Switch to Free
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Switch to Paid
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
