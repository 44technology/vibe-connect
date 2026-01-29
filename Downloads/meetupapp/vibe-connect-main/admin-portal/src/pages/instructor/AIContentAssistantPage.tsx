import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(`Generated content based on: "${prompt}"\n\nThis is a placeholder for AI-generated content. In production, this would connect to an AI service to generate class descriptions, titles, schedules, and other content.`);
      setIsGenerating(false);
      toast.success('Content generated successfully!');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Content Assistant</h1>
        <p className="text-muted-foreground mt-2">Generate content with AI assistance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Input Prompt
            </CardTitle>
            <CardDescription>Describe what you want to create</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>What would you like to create?</Label>
              <Textarea
                placeholder="e.g., A yoga class for beginners focusing on flexibility and relaxation..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>AI-generated content preview</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {generatedContent}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Use This Content
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Generated content will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Prompts</CardTitle>
          <CardDescription>Try these example prompts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Create a class description for a cooking class',
              'Generate a schedule for a 4-week course',
              'Write a title and description for a networking event',
              'Create content for a yoga workshop',
            ].map((example, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => setPrompt(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
