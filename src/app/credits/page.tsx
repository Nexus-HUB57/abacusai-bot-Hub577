
"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowDownRight, Loader2, Wallet, Clock, RefreshCw, Send } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const TELEGRAM_BOT_URL = "https://t.me/manus_ai_agent_bot";

export default function CreditsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  const creditsHistoryQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'users', user.uid, 'creditHistory'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: history, isLoading: historyLoading } = useCollection(creditsHistoryQuery);

  const handleManualRefresh = () => {
    if (!user || !db) return;
    setDocumentNonBlocking(doc(db, 'users', user.uid), {
      creditsUsed: 0,
      lastCreditRefresh: serverTimestamp(),
      monthlyCredits: 400000,
    }, { merge: true });
    
    toast({
      title: "Suprimento Renovado",
      description: "Seu suprimento diário de 400.000 créditos foi reiniciado manualmente.",
    });
  };

  if (!user) return null;

  const availableCredits = (profile?.monthlyCredits || 400000) - (profile?.creditsUsed || 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Gestão de Créditos</h1>
            <p className="text-muted-foreground font-body">Monitore seu suprimento diário e histórico de consumo AbacusAI.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="gap-2 border-accent/30 text-accent"
            >
              <RefreshCw className="w-4 h-4" />
              Renovar Cota
            </Button>
            <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2 bg-primary">
                Inserir Créditos
                <Send className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 border-accent/20 shadow-lg shadow-accent/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Suprimento Disponível</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
                <Wallet className="w-6 h-6 text-accent" />
                {profileLoading ? '...' : Math.max(0, availableCredits).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Refresh em 24h
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
              <p className="text-xs text-muted-foreground font-body">Consumo de rede atual</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Limite Padrão</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline">
                {profileLoading ? '...' : (profile?.monthlyCredits || 400000).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-body">Cota Diária Nexus</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-lg">
              <CreditCard className="w-5 h-5 text-accent" />
              Log de Auditoria
            </CardTitle>
            <CardDescription className="font-body">Histórico de operações que impactaram o seu suprimento (Top 10).</CardDescription>
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
                          {h.action?.replace(/_/g, ' ') || 'OPERAÇÃO'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-destructive">
                          <ArrowDownRight className="w-3 h-3" />
                          {h.creditsUsed?.toLocaleString()}
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
                Nenhum registro de consumo encontrado. Inicie protocolos para ver dados.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
