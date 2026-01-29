import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { DollarSign, Gift, ToggleLeft, ToggleRight } from 'lucide-react';
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
    if (!newTicket.title) {
      toast.error('Please enter a title');
      return;
    }
    const ticket = {
      id: tickets.length + 1,
      ...newTicket,
      price: newTicket.type === 'paid' ? parseFloat(newTicket.price) : 0,
      available: 100,
      sold: 0,
    };
    setTickets([...tickets, ticket]);
    setNewTicket({ title: '', price: '', type: 'paid' });
    toast.success('Ticket added successfully!');
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
          <CardDescription>Set up pricing for your class or event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g., Diction Class"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            />
          </div>
          {newTicket.type === 'paid' && (
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={newTicket.price}
                onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
              />
            </div>
          )}
          <Button onClick={handleAddTicket} className="w-full">
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
                <Badge variant={ticket.type === 'paid' ? 'default' : 'secondary'}>
                  {ticket.type === 'paid' ? 'Paid' : 'Free'}
                </Badge>
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
