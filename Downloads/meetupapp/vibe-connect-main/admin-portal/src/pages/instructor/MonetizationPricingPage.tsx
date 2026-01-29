import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { DollarSign, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function MonetizationPricingPage() {
  const [prices, setPrices] = useState([
    { id: 1, title: 'Diction Class', price: 50, type: 'class' },
    { id: 2, title: 'AutoCAD Basics', price: 75, type: 'class' },
    { id: 3, title: 'Networking Event', price: 25, type: 'event' },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const handleEdit = (id: number, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleSave = (id: number) => {
    if (!editPrice || parseFloat(editPrice) < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setPrices(prices.map(p => 
      p.id === id ? { ...p, price: parseFloat(editPrice) } : p
    ));
    setEditingId(null);
    setEditPrice('');
    toast.success('Price updated!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pricing</h1>
        <p className="text-muted-foreground mt-2">Manage pricing for your classes and events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current Pricing
          </CardTitle>
          <CardDescription>View and edit prices for your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prices.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editingId === item.id ? (
                    <>
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(item.id)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">${item.price}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item.id, item.price)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
