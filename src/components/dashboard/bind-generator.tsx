'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Copy, Check, Save, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, getDoc, increment } from 'firebase/firestore';

const BIND_INITIAL_CREDITS = 40000;
const USER_SUPPLY_QUOTA = 400000;
const GENERATION_COST = 1;

export function BindGenerator() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const generate = () => {
    // 24-character alphanumeric string for high entropy
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

    setIsSaving(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      const userData = userSnap.exists() ? userSnap.data() : { monthlyCredits: USER_SUPPLY_QUOTA, creditsUsed: 0 };
      const availableCredits = (userData.monthlyCredits || USER_SUPPLY_QUOTA) - (userData.creditsUsed || 0);

      if (availableCredits < GENERATION_COST) {
        toast({
          variant: "destructive",
          title: "Suprimento Insuficiente",
          description: `Você não tem créditos suficientes. Você precisa de ${GENERATION_COST} crédito para gerar um novo bind. Saldo atual: ${availableCredits}`,
        });
        setIsSaving(false);
        return;
      }

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

      // Register the new bind with its individual credit allocation
      addDocumentNonBlocking(bindCodesRef, newBind);
      
      // Consume 1 credit from user daily supply for the generation action
      setDocumentNonBlocking(userRef, {
        creditsUsed: increment(GENERATION_COST)
      }, { merge: true });

      // Record logs
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'bindHistory'), {
        ownerId: user.uid,
        action: 'CREATE_BIND',
        bindCode: generatedCode,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      addDocumentNonBlocking(collection(db, 'users', user.uid, 'creditHistory'), {
        ownerId: user.uid,
        action: 'CONSUME_CREDIT',
        creditsUsed: GENERATION_COST,
        description: `Bind gerado: ${generatedCode} com ${BIND_INITIAL_CREDITS} créditos.`,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Protocolo Inicializado",
        description: `Código :bind ${generatedCode} registrado com ${BIND_INITIAL_CREDITS} créditos individuais.`,
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
        <CardDescription className="font-body flex items-center gap-2">
          <Zap className="w-3 h-3 text-yellow-500" />
          Suprimento diário do sistema: {USER_SUPPLY_QUOTA.toLocaleString()} créditos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              value={generatedCode ? `:bind ${generatedCode}` : ''}
              placeholder="Gerar bind alfanumérico de 24 chars"
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
            {copied ? 'Copiado' : 'Copiar Comando Completo'}
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
      </CardContent>
    </Card>
  );
}