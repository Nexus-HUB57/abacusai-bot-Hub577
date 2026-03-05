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
    // Check if we already hit the quota in this session
    const quotaHit = sessionStorage.getItem('nexus_quota_exceeded');
    if (quotaHit) setIsQuotaExceeded(true);

    const handlePermissionError = (error: FirestorePermissionError) => {
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
        sessionStorage.setItem('nexus_quota_exceeded', 'true');
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
      <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-4 overflow-auto">
        <Alert variant="destructive" className="max-w-md bg-card border-destructive/50 shadow-2xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <AlertTitle className="text-2xl font-headline font-bold m-0 text-destructive">
              Capacidade Máxima Atingida
            </AlertTitle>
          </div>
          
          <AlertDescription className="space-y-6">
            <p className="text-base text-center opacity-90 leading-relaxed font-body text-foreground">
              O BindNexus atingiu o limite de processamento diário gratuito permitido pelo Firebase (Spark Plan). 
              O sistema entrará em modo de espera até o próximo ciclo.
            </p>
            
            <div className="space-y-3 p-4 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 text-center">Status do Protocolo</p>
              <ul className="text-xs space-y-2 opacity-80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Operações suspensas temporariamente
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Reset automático em aproximadamente 24h
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Sincronização de rede em pausa
                </li>
              </ul>
            </div>

            <Button 
              onClick={() => {
                sessionStorage.removeItem('nexus_quota_exceeded');
                window.location.reload();
              }} 
              variant="outline" 
              className="w-full border-destructive/30 hover:bg-destructive/10 h-12 font-bold text-base"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Reconectar Nexus
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground italic">
              Dica: Reduza a frequência de criação de binds para evitar novos bloqueios.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
