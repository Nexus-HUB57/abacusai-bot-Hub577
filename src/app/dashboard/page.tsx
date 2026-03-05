'use client';

import { useEffect, useRef } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BindGenerator } from '@/components/dashboard/bind-generator';
import { BindValidator } from '@/components/dashboard/bind-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Key, Database, Zap, Wallet } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { redirect } from 'next/navigation';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const syncAttemptedRef = useRef(false);
  const refreshAttemptedRef = useRef(false);

  // Perfil do usuário para telemetria
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: userProfile } = useDoc(userProfileRef);

  // Sincronizar perfil e inicializar cota diária
  useEffect(() => {
    if (user && db && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        name: user.displayName || 'Nodo Nexus Anônimo',
        email: user.email,
        lastSignedIn: serverTimestamp(),
        monthlyCredits: 400000,
      }, { merge: true });
    }
  }, [user, db]);

  // Lógica de Refresh de 24 horas: Redefine créditos usados
  useEffect(() => {
    if (userProfile && db && user && !refreshAttemptedRef.current) {
      const now = new Date();
      const lastRefresh = userProfile.lastCreditRefresh?.toDate?.() || new Date(0);
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (now.getTime() - lastRefresh.getTime() >= oneDayInMs) {
        // Double check to avoid redundant writes if credits are already zero
        if (userProfile.creditsUsed !== 0) {
          refreshAttemptedRef.current = true;
          const userRef = doc(db, 'users', user.uid);
          setDocumentNonBlocking(userRef, {
            creditsUsed: 0,
            lastCreditRefresh: serverTimestamp(),
            monthlyCredits: 400000, 
          }, { merge: true });
        }
      }
    }
  }, [userProfile, db, user]);

  const bindsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'bindCodes'));
  }, [db, user]);
  const { data: binds } = useCollection(bindsQuery);

  const nucleiQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'nuclei'));
  }, [db, user]);
  const { data: nuclei } = useCollection(nucleiQuery);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'users', user.uid, 'bindHistory'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [db, user]);
  const { data: recentLogs } = useCollection(historyQuery);

  if (isUserLoading) return null;
  if (!user) redirect('/auth');

  const availableCredits = (userProfile?.monthlyCredits || 400000) - (userProfile?.creditsUsed || 0);

  const stats = [
    { label: 'Binds de Rede', value: binds?.length || 0, icon: Key, color: 'text-accent' },
    { label: 'Núcleos Ativos', value: nuclei?.length || 0, icon: Database, color: 'text-primary' },
    { label: 'Sincronização', value: nuclei?.filter((n: any) => n.status === 'syncing').length || 0, icon: Zap, color: 'text-yellow-500' },
    { label: 'Saldo Diário', value: Math.max(0, availableCredits), icon: Wallet, color: 'text-green-500' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Centro de Comando Nexus</h1>
          <p className="text-muted-foreground font-body">Orquestre binds com um suprimento diário renovável de 400.000 créditos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider font-body text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">{stat.value.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Fluxo de Dados em Tempo Real</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BindGenerator />
          <BindValidator />
        </div>

        <section className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Operações de Rede Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs && recentLogs.length > 0 ? (
                  recentLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/40 group hover:bg-secondary/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'confirmed' ? 'bg-green-500 animate-pulse' : 
                          log.status === 'pending' ? 'bg-accent' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="text-sm font-code font-bold text-accent">:bind {log.bindCode}</p>
                          <p className="text-[10px] text-muted-foreground font-body uppercase tracking-tighter">Ação: {log.action?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-code bg-background/50 px-2 py-1 rounded">
                        {log.createdAt?.seconds 
                          ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString() 
                          : 'TEMPO REAL'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground font-body text-sm italic">
                    Aguardando atividade na rede...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Toaster />
    </div>
  );
}
