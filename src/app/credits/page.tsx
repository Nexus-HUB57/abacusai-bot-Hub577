"use client";

import { useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowDownRight, Loader2, Wallet, Clock } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';

export default function CreditsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  const creditsHistoryQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'users', user.uid, 'creditHistory'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: history, isLoading: historyLoading } = useCollection(creditsHistoryQuery);

  if (!user) return null;

  const availableCredits = (profile?.monthlyCredits || 400000) - (profile?.creditsUsed || 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Gestão de Créditos</h1>
          <p className="text-muted-foreground font-body">Monitore seu suprimento diário e histórico de consumo.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 border-accent/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Suprimento Disponível</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
                <Wallet className="w-6 h-6 text-accent" />
                {profileLoading ? '...' : availableCredits.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Ciclo de 24 horas ativo
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Usado Hoje</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline">
                {profileLoading ? '...' : (profile?.creditsUsed || 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Consumo desde o último refresh</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Cota Diária</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline">
                {profileLoading ? '...' : (profile?.monthlyCredits || 400000).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Alocação Padrão Nexus</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <CreditCard className="w-5 h-5 text-accent" />
              Log de Consumo
            </CardTitle>
            <CardDescription className="font-body">Registro detalhado de todas as operações que consomem créditos.</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : history && history.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-headline">Timestamp</TableHead>
                    <TableHead className="font-headline">Ação</TableHead>
                    <TableHead className="font-headline">Quantidade</TableHead>
                    <TableHead className="font-headline">Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-code text-xs text-muted-foreground">
                        {h.createdAt?.seconds 
                          ? new Date(h.createdAt.seconds * 1000).toLocaleString() 
                          : 'Recente'}
                      </TableCell>
                      <TableCell className="font-medium font-body uppercase tracking-wider text-xs">
                        <Badge variant="outline" className="border-accent/20 text-accent">
                          {h.action?.replace(/_/g, ' ') || 'AÇÃO'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-destructive">
                          <ArrowDownRight className="w-3 h-3" />
                          {h.creditsUsed}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-body text-sm">
                        {h.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 text-muted-foreground font-body">
                Nenhum histórico de crédito encontrado. Comece a gerar binds para ver registros.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}