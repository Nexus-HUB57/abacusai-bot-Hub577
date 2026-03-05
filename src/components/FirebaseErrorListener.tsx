'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { FirestoreError } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

/**
 * A centralized component that listens for Firestore-related errors
 * and surfaces them to the user via Toasts.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    // Handle specific permission errors (often used for LLM debugging)
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Permission Denied Context:', error.request);
      toast({
        variant: "destructive",
        title: "Protocolo Negado",
        description: `Falha de permissão no caminho: ${error.request.path}. Certifique-se de estar autenticado corretamente.`,
      });
    };

    // Handle general Firestore errors (like Quota Exceeded)
    const handleFirestoreError = (error: FirestoreError) => {
      console.error('Firestore Platform Error:', error.code, error.message);
      
      if (error.code === 'resource-exhausted') {
        toast({
          variant: "destructive",
          title: "Cota de Rede Excedida",
          description: "O limite de recursos do Firebase para este projeto foi atingido hoje. Por favor, tente novamente mais tarde.",
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

  return null;
}
