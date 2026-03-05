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
 * Ouvinte centralizado de erros do Firebase.
 * Detecta especificamente o erro de 'resource-exhausted' (Quota Exceeded)
 * e apresenta uma interface de bloqueio total para o usuário.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    // Verifica se já atingimos a cota nesta sessão
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
      // Verifica se o recurso foi exaurido (Plano Spark do Firebase)
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
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 overflow-auto">
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
            <div className="space-y-4 text-center">
              <p className="text-base leading-relaxed font-body text-foreground">
                O BindNexus atingiu o limite de processamento gratuito diário permitido pelo Google (Spark Plan).
              </p>
              <p className="text-sm opacity-80 font-body text-foreground">
                O sistema entrará em hibernação automática até o próximo ciclo de atualização (aproximadamente 24h).
              </p>
            </div>
            
            <div className="space-y-3 p-4 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 text-center">Status do Protocolo</p>
              <ul className="text-xs space-y-2 opacity-80">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Operações de leitura/escrita suspensas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Sincronização de rede em modo de espera
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Reset diário pendente (Google Cloud)
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
              Nota: Isso não afeta seus créditos do Nexus, apenas a infraestrutura do banco de dados.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
