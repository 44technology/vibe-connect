import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Plus, Percent, UtensilsCrossed, Coffee, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState([
    { id: 1, type: 'food', item: 'Pizza', discount: 20, status: 'active', endDate: '2025-02-15' },
    { id: 2, type: 'drink', item: 'Coffee', discount: 15, status: 'active', endDate: '2025-02-20' },
    { id: 3, type: 'food', item: 'Burger', discount: 25, status: 'ended', endDate: '2025-01-10' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState<'food' | 'drink'>('food');
  const [item, setItem] = useState('');
  const [discount, setDiscount] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = () => {
    if (!item.trim() || !discount || !endDate) {
      toast.error('Please fill all fields');
      return;
    }
    const newDiscount = {
      id: discounts.length + 1,
      type,
      item,
      discount: parseInt(discount),
      status: 'active' as const,
      endDate,
    };
    setDiscounts([newDiscount, ...discounts]);
    setItem('');
    setDiscount('');
    setEndDate('');
    setIsDialogOpen(false);
    toast.success('Discount created successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discounts</h1>
          <p className="text-muted-foreground mt-2">Manage discounts for food and drinks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>Set discount for food or drinks</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'food' ? 'default' : 'outline'}
                    onClick={() => setType('food')}
                    className="flex-1"
                  >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Food
                  </Button>
                  <Button
                    variant={type === 'drink' ? 'default' : 'outline'}
                    onClick={() => setType('drink')}
                    className="flex-1"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Drink
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  placeholder="e.g., Pizza, Coffee"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Discount
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {discounts.map((disc) => (
          <Card key={disc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {disc.type === 'food' ? <UtensilsCrossed className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                  {disc.item}
                </CardTitle>
                <Badge variant={disc.status === 'active' ? 'default' : 'secondary'}>
                  {disc.status}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Percent className="w-4 h-4" />
                  <span>{disc.discount}% off</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Ends: {disc.endDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
