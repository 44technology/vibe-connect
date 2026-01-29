import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Wallet, DollarSign, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function MonetizationPayoutsPage() {
  const [payouts] = useState([
    { id: 1, amount: 400, date: '2025-01-15', status: 'completed', method: 'Bank Transfer' },
    { id: 2, amount: 350, date: '2025-01-01', status: 'completed', method: 'PayPal' },
    { id: 3, amount: 500, date: '2025-01-25', status: 'pending', method: 'Bank Transfer' },
  ]);

  const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground mt-2">View and manage your earnings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalEarnings}</p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${pendingAmount}</p>
            <p className="text-sm text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">Completed payouts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    payout.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {payout.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">${payout.amount}</p>
                      <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                        {payout.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {payout.date}
                      </span>
                      <span>{payout.method}</span>
                    </div>
                  </div>
                </div>
                {payout.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    Request Now
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
