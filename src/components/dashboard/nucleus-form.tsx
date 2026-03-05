
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Save, Plus } from 'lucide-react';
import { suggestNucleusDescription } from '@/ai/flows/suggest-nucleus-description';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export function NucleusForm() {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const { toast } = useToast();

  const handleAiSuggest = async () => {
    if (!name && !purpose) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a name or intended purpose for AI suggestions.",
      });
      return;
    }

    setLoadingAi(true);
    try {
      const result = await suggestNucleusDescription({ nucleusName: name, intendedPurpose: purpose });
      setDescription(result.conciseDescription);
      setTags(result.tags);
      toast({
        title: "AI Suggestions Applied",
        description: "Description and tags have been updated based on your input.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate suggestions at this time.",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSave = () => {
    toast({
      title: "Nucleus Created",
      description: `${name} has been added to the registry.`,
    });
    // Reset
    setName('');
    setPurpose('');
    setDescription('');
    setTags([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" />
          Create New Nucleus
        </CardTitle>
        <CardDescription>Define a new entity to link with bind codes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nucleus Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Storage Relay A1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purpose">Intended Purpose (Optional)</Label>
          <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="What will this nucleus do?" />
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAiSuggest} 
            disabled={loadingAi}
            className="border-accent text-accent hover:bg-accent/10"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${loadingAi ? 'animate-pulse' : ''}`} />
            {loadingAi ? 'Generating...' : 'AI Suggest Description'}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="A concise summary of the nucleus..." 
          />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-primary/20 text-accent border-accent/20">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Register Nucleus
        </Button>
      </CardContent>
    </Card>
  );
}
