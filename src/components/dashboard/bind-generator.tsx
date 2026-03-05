
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Copy, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const CREDIT_COST = 1; // Updated to match user router logic (1 credit per generation)

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
      
      if (!userSnap.exists()) throw new Error("User profile not found");
      
      const userData = userSnap.data();
      const availableCredits = (userData.monthlyCredits || 40000) - (userData.creditsUsed || 0);

      if (availableCredits < CREDIT_COST) {
        toast({
          variant: "destructive",
          title: "Insufficient Credits",
          description: `You need ${CREDIT_COST} credit, but only have ${availableCredits} available.`,
        });
        setIsSaving(false);
        return;
      }

      const bindCodesRef = collection(db, 'bindCodes');
      const newBind = {
        code: generatedCode,
        format: `:bind ${generatedCode}`,
        status: 'active',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        description: description || 'Generated via dashboard',
      };

      const bindDoc = await addDoc(bindCodesRef, newBind);

      // Consume 1 credit as per router logic
      updateDoc(userRef, {
        creditsUsed: increment(CREDIT_COST)
      });

      // Log activity & credit history
      addDoc(collection(db, 'activityLogs'), {
        userId: user.uid,
        action: 'CREATE_BIND_CODE',
        description: `Created bind code: ${generatedCode}`,
        resourceType: 'bindCode',
        resourceId: bindDoc.id,
        createdAt: serverTimestamp(),
      });

      addDoc(collection(db, 'creditHistory'), {
        userId: user.uid,
        action: 'CREATE_BIND_CODE',
        creditsUsed: CREDIT_COST,
        description: `Consumed ${CREDIT_COST} credit for code generation`,
        bindCodeId: bindDoc.id,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Bind Code Saved",
        description: `Code :bind ${generatedCode} registered. ${CREDIT_COST} credit consumed.`,
      });
      
      setGeneratedCode('');
      setDescription('');

    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: 'bindCodes/or/users',
        operation: 'write',
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false);
    }
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
    <Card className="w-full bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <RefreshCw className="w-5 h-5 text-accent" />
          Bind Code Generator
        </CardTitle>
        <CardDescription className="font-body">Generate unique system codes. Cost: {CREDIT_COST} credit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              value={generatedCode ? `:bind ${generatedCode}` : ''}
              placeholder="Click generate to start"
              className="font-code text-lg bg-secondary/30 border-primary/20"
            />
          </div>
          <Button onClick={generate} variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Generate
          </Button>
        </div>

        <div className="space-y-2">
          <Input 
            placeholder="Add a description (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            disabled={!generatedCode || isSaving}
            className="bg-secondary/30"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={copyToClipboard}
            disabled={!generatedCode || isSaving}
            variant="outline"
            className="flex-1 border-accent/50 hover:bg-accent/10 hover:text-accent"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!generatedCode || isSaving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Register Code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
