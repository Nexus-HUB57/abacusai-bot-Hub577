
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Copy, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    const bindCodesRef = collection(db, 'bindCodes');
    const newBind = {
      code: generatedCode,
      format: `:bind ${generatedCode}`,
      status: 'active',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      description: description || 'Generated via dashboard',
    };

    addDoc(bindCodesRef, newBind)
      .then(() => {
        toast({
          title: "Bind Code Saved",
          description: `Code :bind ${generatedCode} has been registered to your account.`,
        });
        setGeneratedCode('');
        setDescription('');
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: bindCodesRef.path,
          operation: 'create',
          requestResourceData: newBind,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
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

        <div className="space-y-2">
          <Input 
            placeholder="Add a description (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            disabled={!generatedCode || isSaving}
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
