
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BindGenerator() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(result);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    const fullCode = `:bind ${generatedCode}`;
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: `${fullCode} is ready to be used.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-accent" />
          Bind Code Generator
        </CardTitle>
        <CardDescription>Generate unique alphanumeric codes for secure linking.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              value={generatedCode ? `:bind ${generatedCode}` : ''}
              placeholder="Click generate to start"
              className="font-code text-lg bg-secondary/50 border-primary/20"
            />
          </div>
          <Button onClick={generate} variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Generate
          </Button>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={copyToClipboard}
            disabled={!generatedCode}
            variant="outline"
            className="w-full sm:w-auto border-accent/50 hover:bg-accent/10 hover:text-accent"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
