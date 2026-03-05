'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Copy, Check, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, getDoc, increment } from 'firebase/firestore';

const CREDIT_COST = 1;

export function BindGenerator() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const generate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(result);
    setCopied(false);
  };

  const handleSave = async () => {
    if (!user || !generatedCode || !db) return;

    setIsSaving(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      const userData = userSnap.exists() ? userSnap.data() : { monthlyCredits: 40000, creditsUsed: 0 };
      const availableCredits = (userData.monthlyCredits || 40000) - (userData.creditsUsed || 0);

      if (availableCredits < CREDIT_COST) {
        toast({
          variant: "destructive",
          title: "Insufficient Credits",
          description: `Credit threshold reached. Current balance: ${availableCredits}`,
        });
        setIsSaving(false);
        return;
      }

      const bindCodesRef = collection(db, 'users', user.uid, 'bindCodes');
      const newBind = {
        code: generatedCode,
        format: `:bind ${generatedCode}`,
        status: 'active',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        description: description || 'Generated via dashboard',
      };

      // Non-blocking writes for better UX
      addDocumentNonBlocking(bindCodesRef, newBind);
      
      // Consume credit using set + merge to ensure it works even if the profile doc is missing
      setDocumentNonBlocking(userRef, {
        creditsUsed: increment(CREDIT_COST)
      }, { merge: true });

      // Log bind history
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'bindHistory'), {
        ownerId: user.uid,
        action: 'CREATE_BIND',
        bindCode: generatedCode,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      // Log credit history
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'creditHistory'), {
        ownerId: user.uid,
        action: 'CONSUME_CREDIT',
        creditsUsed: CREDIT_COST,
        description: `Generated bind code: ${generatedCode}`,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Bind Code Registered",
        description: `Code :bind ${generatedCode} is now active.`,
      });
      
      setGeneratedCode('');
      setDescription('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    const fullCode = `:bind ${generatedCode}`;
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <RefreshCw className="w-5 h-5 text-accent" />
          Bind Generator
        </CardTitle>
        <CardDescription className="font-body">Protocol cost: {CREDIT_COST} Token</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              value={generatedCode ? `:bind ${generatedCode}` : ''}
              placeholder="Click generate to initialize"
              className="font-code text-lg bg-secondary/30 border-primary/20 h-12"
            />
          </div>
          <Button onClick={generate} variant="secondary" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
            Generate
          </Button>
        </div>

        <Input 
          placeholder="System Description (Optional)" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          disabled={!generatedCode || isSaving}
          className="bg-secondary/30"
        />

        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            disabled={!generatedCode || isSaving}
            variant="outline"
            className="flex-1 border-accent/50 hover:bg-accent/10"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!generatedCode || isSaving}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? 'Processing...' : 'Register'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}