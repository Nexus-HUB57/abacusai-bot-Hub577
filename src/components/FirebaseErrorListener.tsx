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
      toast({
        variant: "destructive",
        title: "Protocolo Negado",
        description: `Falha de permissão no acesso aos dados. Verifique suas regras de segurança.`,
      });
    };

    const handleFirestoreError = (error: FirestoreError) => {
      if (error.code === 'resource-exhausted') {
        setIsQuotaExceeded(true);
        toast({
          variant: "destructive",
          title: "Cota de Rede Excedida",
          description: "O limite diário do Firebase foi atingido. O sistema voltará a operar no próximo ciclo de 24h.",
        });
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
  }, [toast]);

  if (isQuotaExceeded) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md bg-card border-destructive/50 shadow-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-headline font-bold">Capacidade Máxima Atingida</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p className="text-sm opacity-90 leading-relaxed">
              O BindNexus atingiu o limite de processamento diário permitido pelo provedor de infraestrutura (Firebase Spark). 
              Todas as operações de leitura e escrita foram temporariamente suspensas.
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">O que fazer agora?</p>
              <ul className="text-xs list-disc list-inside opacity-80">
                <li>Aguarde o próximo ciclo de 24 horas para o reset automático.</li>
                <li>Verifique se há atualizações de plano disponíveis.</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full mt-4 border-destructive/30 hover:bg-destructive/10"
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
