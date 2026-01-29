import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { PieChart, Percent, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function MonetizationRevenuePage() {
  const [splits, setSplits] = useState([
    { id: 1, partner: 'Ulikme Platform', percentage: 3, amount: 15, isPlatform: true },
    { id: 2, partner: 'Instructor', percentage: 97, amount: 485 },
  ]);

  const [newSplit, setNewSplit] = useState({
    partner: '',
    percentage: '',
  });

  const handleAddSplit = () => {
    if (!newSplit.partner || !newSplit.percentage) {
      toast.error('Please fill all fields');
      return;
    }
    const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (totalPercentage + parseFloat(newSplit.percentage) > 100) {
      toast.error('Total percentage cannot exceed 100%');
      return;
    }
    const split = {
      id: splits.length + 1,
      ...newSplit,
      percentage: parseFloat(newSplit.percentage),
      amount: (parseFloat(newSplit.percentage) / 100) * 500, // Assuming total revenue of 500
    };
    setSplits([...splits, split]);
    setNewSplit({ partner: '', percentage: '' });
    toast.success('Revenue split added!');
  };

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  const totalRevenue = 500; // Mock total revenue

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revenue Split</h1>
        <p className="text-muted-foreground mt-2">Configure how revenue is distributed</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue}</p>
            <p className="text-sm text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Platform Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{platformFee}%</p>
            <p className="text-sm text-muted-foreground mt-1">Ulikme platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{splits.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active splits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Add Revenue Split
          </CardTitle>
          <CardDescription>Define how revenue is shared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Partner Name</Label>
              <Input
                placeholder="e.g., Platform, Instructor, Venue"
                value={newSplit.partner}
                onChange={(e) => setNewSplit({ ...newSplit, partner: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Percentage (%)</Label>
              <Input
                type="number"
                placeholder="e.g., 20"
                value={newSplit.percentage}
                onChange={(e) => setNewSplit({ ...newSplit, percentage: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddSplit} className="w-full">
            Add Split
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Splits</CardTitle>
          <CardDescription>Active revenue distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {splits.map((split) => (
              <div
                key={split.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  split.isPlatform ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{split.partner}</p>
                    <Badge variant={split.isPlatform ? 'default' : 'secondary'}>
                      {split.percentage}%
                    </Badge>
                    {split.isPlatform && (
                      <Badge variant="outline" className="text-xs">Fixed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">${split.amount.toFixed(2)}</p>
                </div>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      split.isPlatform ? 'bg-primary' : 'bg-secondary'
                    }`}
                    style={{ width: `${split.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
