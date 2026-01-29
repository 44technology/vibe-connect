import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, Eye, Users, Heart } from 'lucide-react';

export default function VisibilityTrendingPage() {
  const [trending] = useState([
    { id: 1, title: 'Diction Class', views: 1250, likes: 89, enrollments: 45, rank: 1 },
    { id: 2, title: 'AutoCAD Basics', views: 980, likes: 67, enrollments: 32, rank: 2 },
    { id: 3, title: 'Yoga Workshop', views: 750, likes: 54, enrollments: 28, rank: 3 },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trending</h1>
        <p className="text-muted-foreground mt-2">See what's trending in your content</p>
      </div>

      <div className="space-y-4">
        {trending.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <span className="text-xl font-bold text-primary">#{item.rank}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <Badge variant="default" className="gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {item.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {item.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {item.enrollments} enrollments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
