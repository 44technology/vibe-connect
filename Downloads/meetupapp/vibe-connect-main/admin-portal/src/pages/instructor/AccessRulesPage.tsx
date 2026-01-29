import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Shield, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessRulesPage() {
  const [rules, setRules] = useState([
    { id: 1, name: 'Age Restriction', value: '18+', enabled: true },
    { id: 2, name: 'Membership Required', value: 'Premium', enabled: false },
    { id: 3, name: 'Pre-registration', value: 'Required', enabled: true },
  ]);

  const [newRule, setNewRule] = useState({ name: '', value: '', enabled: true });

  const handleAddRule = () => {
    if (!newRule.name || !newRule.value) {
      toast.error('Please fill all fields');
      return;
    }
    const rule = {
      id: rules.length + 1,
      ...newRule,
    };
    setRules([...rules, rule]);
    setNewRule({ name: '', value: '', enabled: true });
    toast.success('Access rule added!');
  };

  const toggleRule = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
    toast.success('Rule deleted');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Access Rules</h1>
        <p className="text-muted-foreground mt-2">Define who can access your classes and events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Create Access Rule
          </CardTitle>
          <CardDescription>Set conditions for access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g., Age Restriction"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rule Value</Label>
              <Input
                placeholder="e.g., 18+"
                value={newRule.value}
                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Rule</Label>
            <Switch
              checked={newRule.enabled}
              onCheckedChange={(checked) => setNewRule({ ...newRule, enabled: checked })}
            />
          </div>
          <Button onClick={handleAddRule} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                  {rule.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="font-semibold">{rule.value}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <Label className="text-sm">Enable</Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(rule.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
