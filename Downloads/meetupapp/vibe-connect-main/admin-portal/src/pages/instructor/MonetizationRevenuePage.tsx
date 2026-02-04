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
    { id: 1, partner: 'Ulikme Platform', percentage: 4, amount: 20, isPlatform: true },
    { id: 2, partner: 'Instructor', percentage: 96, amount: 480 },
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
  const platformFee = splits.find(s => s.isPlatform)?.percentage || 3; // Platform fee percentage

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revenue Split</h1>
        <p className="text-muted-foreground mt-2">
          See how your revenue is distributed. When a user pays $100 for a class/event:
        </p>
        <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User pays:</span>
              <span className="font-semibold">$100.00</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground">Processing fee (4%):</span>
              <span className="font-semibold text-orange-600">-$4.00</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-semibold text-foreground">You receive:</span>
              <span className="font-bold text-green-600 text-lg">$96.00</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Note: Total processing fee includes payment processing and platform fees.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              Processing Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{platformFee}%</p>
            <p className="text-sm text-muted-foreground mt-1">Total processing fee</p>
          </CardContent>
        </Card>
      </div>

      {/* Example Payment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Example Payment Breakdown</CardTitle>
          <CardDescription>How a $100 payment is distributed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Gross Payment (User pays)</span>
                <span className="text-2xl font-bold text-blue-600">$100.00</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div>
                  <p className="font-medium text-foreground">Processing Fee</p>
                  <p className="text-xs text-muted-foreground">4% of gross amount</p>
                </div>
                <span className="font-semibold text-orange-600">-$4.00</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border-2 border-primary/30 mt-4">
                <div>
                  <p className="font-bold text-lg text-foreground">Your Payout</p>
                  <p className="text-xs text-muted-foreground">Amount you receive</p>
                </div>
                <span className="text-3xl font-bold text-primary">$96.00</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Revenue Distribution
          </CardTitle>
          <CardDescription>Visual breakdown of how revenue is split</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {splits.map((split) => {
              const actualPercentage = split.isPlatform 
                ? (split.amount / totalRevenue) * 100 
                : ((totalRevenue - splits.find(s => s.isPlatform)?.amount || 0) / totalRevenue) * 100;
              
              return (
                <div
                  key={split.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    split.isPlatform ? 'bg-primary/5 border-primary/20' : 'bg-secondary/5 border-secondary/20'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{split.partner}</p>
                      <Badge variant={split.isPlatform ? 'default' : 'secondary'}>
                        {split.percentage}%
                      </Badge>
                      {split.isPlatform && (
                        <Badge variant="outline" className="text-xs">Fixed Rate</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${split.amount.toFixed(2)} of ${totalRevenue.toFixed(2)} total revenue
                    </p>
                  </div>
                  <div className="w-32 bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        split.isPlatform ? 'bg-primary' : 'bg-secondary'
                      }`}
                      style={{ width: `${actualPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
