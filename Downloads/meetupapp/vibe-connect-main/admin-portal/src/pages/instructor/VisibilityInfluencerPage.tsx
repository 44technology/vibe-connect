import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Star, Users, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function VisibilityInfluencerPage() {
  const [campaigns, setCampaigns] = useState([
    { id: 1, influencer: 'Tech Guru', followers: '500K', reach: 12500, cost: 500, active: true },
    { id: 2, influencer: 'Fitness Pro', followers: '200K', reach: 8500, cost: 300, active: false },
  ]);

  const [newCampaign, setNewCampaign] = useState({
    influencer: '',
    cost: '',
  });

  const handleAddCampaign = () => {
    if (!newCampaign.influencer || !newCampaign.cost) {
      toast.error('Please fill all fields');
      return;
    }
    const campaign = {
      id: campaigns.length + 1,
      ...newCampaign,
      followers: '100K',
      reach: 5000,
      cost: parseFloat(newCampaign.cost),
      active: false,
    };
    setCampaigns([...campaigns, campaign]);
    setNewCampaign({ influencer: '', cost: '' });
    toast.success('Campaign added!');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Influencer / Sponsored</h1>
        <p className="text-muted-foreground mt-2">Manage influencer partnerships and sponsored content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Create Campaign
          </CardTitle>
          <CardDescription>Set up influencer or sponsored campaigns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Influencer Name</Label>
              <Input
                placeholder="e.g., Tech Guru"
                value={newCampaign.influencer}
                onChange={(e) => setNewCampaign({ ...newCampaign, influencer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Campaign Cost ($)</Label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={newCampaign.cost}
                onChange={(e) => setNewCampaign({ ...newCampaign, cost: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddCampaign} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Campaign
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {campaign.influencer}
                </CardTitle>
                <Badge variant={campaign.active ? 'default' : 'secondary'}>
                  {campaign.active ? 'Active' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Followers
                </span>
                <span className="font-semibold">{campaign.followers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Reach
                </span>
                <span className="font-semibold">{campaign.reach.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Cost</span>
                <span className="text-xl font-bold">${campaign.cost}</span>
              </div>
              {!campaign.active && (
                <Button className="w-full" variant="outline">
                  Activate Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
