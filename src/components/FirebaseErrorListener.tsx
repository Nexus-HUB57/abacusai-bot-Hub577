'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { FirestoreError } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * A centralized component that listens for Firestore-related errors
 * and surfaces them to the user via Toasts and a global overlay for critical errors.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Don't toast if we're already showing the quota overlay
      if (isQuotaExceeded) return;
      
      toast({
        variant: "destructive",
        title: "Protocolo Negado",
        description: `Falha de permissão no acesso aos dados. Verifique suas regras de segurança.`,
      });
    };

    const handleFirestoreError = (error: FirestoreError) => {
      // Check for resource exhaustion (Quota Exceeded)
      if (error.code === 'resource-exhausted' || error.message?.toLowerCase().includes('quota')) {
        setIsQuotaExceeded(true);
      } else {
        toast({
          variant: "destructive",
          title: "Erro de Comunicação Nexus",
          description: `Ocorreu uma falha no banco de dados (${error.code}).`,
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    errorEmitter.on('firestore-error', handleFirestoreError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
      errorEmitter.off('firestore-error', handleFirestoreError);
    };
  }, [toast, isQuotaExceeded]);

  if (isQuotaExceeded) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
        <Alert variant="destructive" className="max-w-md bg-card border-destructive/50 shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <AlertTitle className="text-xl font-headline font-bold m-0 text-destructive">Capacidade Máxima Atingida</AlertTitle>
          </div>
          <AlertDescription className="space-y-4">
            <p className="text-sm opacity-90 leading-relaxed font-body text-foreground">
              O BindNexus atingiu o limite de processamento diário permitido pelo provedor de infraestrutura (Firebase Free Tier). 
              Todas as operações de rede foram temporariamente suspensas para evitar perda de dados.
            </p>
            <div className="flex flex-col gap-2 p-3 bg-secondary/20 rounded-lg">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Próximos Passos:</p>
              <ul className="text-xs list-disc list-inside opacity-80 space-y-1">
                <li>Aguarde o reset automático do Firebase (ciclo de 24h).</li>
                <li>Considere reduzir a frequência de atualizações em tempo real.</li>
                <li>Verifique se há atualizações de plano disponíveis no console.</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full mt-4 border-destructive/30 hover:bg-destructive/10 h-11"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Reconectar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
