"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, ArrowRight, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export default function BindHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'users', user.uid, 'bindHistory'),
      orderBy('createdAt', 'desc'),
      limit(100) // Evitar excesso de leituras
    );
  }, [db, user]);

  const { data: history, isLoading } = useCollection(historyQuery);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Histórico de Bind</h1>
          <p className="text-muted-foreground font-body">Log de auditoria cronológico de todos os eventos de bind no sistema.</p>
        </header>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <History className="w-5 h-5 text-accent" />
              Stream de Eventos
            </CardTitle>
            <CardDescription className="font-body">Monitorando interações em tempo real no Nexus.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : history && history.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-headline">Timestamp</TableHead>
                    <TableHead className="font-headline">Operação</TableHead>
                    <TableHead className="font-headline">Código Bind</TableHead>
                    <TableHead className="font-headline">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-code text-xs text-muted-foreground">
                        {h.createdAt?.seconds 
                          ? new Date(h.createdAt.seconds * 1000).toLocaleString() 
                          : 'Pendente...'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-headline uppercase">{h.action || 'LINK'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </TableCell>
                      <TableCell className="font-code text-accent font-semibold">
                        :bind {h.bindCode}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={h.status === 'confirmed' ? 'default' : h.status === 'failed' ? 'destructive' : 'secondary'}
                          className={h.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        >
                          {h.status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 text-muted-foreground font-body">
                Nenhum histórico encontrado. Os binds aparecerão aqui assim que iniciados.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
