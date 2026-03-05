'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Copy, Check, Save, Loader2, Zap, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, increment } from 'firebase/firestore';

const BIND_INITIAL_CREDITS = 40000;
const USER_SUPPLY_QUOTA = 400000;
const GENERATION_COST = 40000; // Updated: Generating a bind now "transfers" 40k from user supply

export function BindGenerator() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc(userRef);

  const availableCredits = (userProfile?.monthlyCredits || USER_SUPPLY_QUOTA) - (userProfile?.creditsUsed || 0);

  const generate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(result);
    setCopied(false);
  };

  const handleSave = async () => {
    if (!user || !generatedCode || !db) return;

    if (availableCredits < GENERATION_COST) {
      toast({
        variant: "destructive",
        title: "Créditos Insuficientes",
        description: (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-sm">Você não tem créditos suficientes. Por favor, faça upgrade através do link abaixo para continuar.</p>
            <a 
              href="https://manus.go.link/iW6sB?action=open-subscription" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold underline text-white hover:opacity-80 break-all"
            >
              https://manus.go.link/iW6sB?action=open-subscription
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) as any,
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const bindCodesRef = collection(db, 'users', user.uid, 'bindCodes');
      const newBind = {
        code: generatedCode,
        format: `:bind ${generatedCode}`,
        status: 'active',
        totalCredits: BIND_INITIAL_CREDITS,
        remainingCredits: BIND_INITIAL_CREDITS,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        description: description || 'Bind de protocolo de alta entropia',
      };

      // 1. Create the bind with 40,000 credits
      addDocumentNonBlocking(bindCodesRef, newBind);
      
      // 2. Deduct 40,000 from user daily supply
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        creditsUsed: increment(GENERATION_COST)
      }, { merge: true });

      // 3. Log history
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'bindHistory'), {
        ownerId: user.uid,
        action: 'CREATE_BIND',
        bindCode: generatedCode,
        creditsAllocated: BIND_INITIAL_CREDITS,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      addDocumentNonBlocking(collection(db, 'users', user.uid, 'creditHistory'), {
        ownerId: user.uid,
        action: 'CONSUME_CREDIT',
        creditsUsed: GENERATION_COST,
        description: `Protocolo :bind ${generatedCode} inicializado com ${BIND_INITIAL_CREDITS.toLocaleString()} créditos.`,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Protocolo Inicializado",
        description: `Código :bind ${generatedCode} registrado com ${BIND_INITIAL_CREDITS.toLocaleString()} créditos.`,
      });
      
      setGeneratedCode('');
      setDescription('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de Inicialização",
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
          Gerador de Protocolo
        </CardTitle>
        <div className="flex items-center justify-between">
          <CardDescription className="font-body flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" />
            Suprimento Nexus: {availableCredits.toLocaleString()} / {USER_SUPPLY_QUOTA.toLocaleString()}
          </CardDescription>
          {availableCredits < GENERATION_COST && (
            <a 
              href="https://manus.go.link/iW6sB?action=open-subscription" 
              target="_blank" 
              className="text-[10px] text-accent hover:underline flex items-center gap-1 font-bold"
            >
              UPGRADE <ExternalLink className="w-2 h-2" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              value={generatedCode ? `:bind ${generatedCode}` : ''}
              placeholder="Gerar bind alfanumérico"
              className="font-code text-xs bg-secondary/30 border-primary/20 h-12"
            />
          </div>
          <Button onClick={generate} variant="secondary" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 px-6">
            Gerar
          </Button>
        </div>

        <Input 
          placeholder="Propósito / Descrição (Opcional)" 
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
            {copied ? 'Copiado' : 'Copiar Comando'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!generatedCode || isSaving}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? 'Registrando...' : 'Inicializar Bind'}
          </Button>
        </div>
        
        {availableCredits < GENERATION_COST && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3 items-start">
            <Info className="w-4 h-4 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Suprimento Nexus Esgotado</p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Você não tem créditos suficientes. Por favor, faça upgrade através do link abaixo para continuar.
              </p>
              <a 
                href="https://manus.go.link/iW6sB?action=open-subscription" 
                target="_blank" 
                className="text-[10px] text-accent hover:underline font-bold block mt-1 break-all"
              >
                https://manus.go.link/iW6sB?action=open-subscription
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
