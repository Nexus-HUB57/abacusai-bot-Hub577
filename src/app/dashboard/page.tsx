
'use client';

import { useEffect, useRef } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BindGenerator } from '@/components/dashboard/bind-generator';
import { BindValidator } from '@/components/dashboard/bind-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Key, Database, Zap, Wallet, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { redirect } from 'next/navigation';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const syncAttemptedRef = useRef(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: userProfile, isLoading: profileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    // Sincroniza apenas uma vez por montagem do componente se os dados básicos estiverem prontos
    if (user && db && userProfile && !syncAttemptedRef.current) {
      const sessionKey = `nexus_synced_${user.uid}`;
      const alreadySynced = sessionStorage.getItem(sessionKey);
      
      if (alreadySynced) {
        syncAttemptedRef.current = true;
        return;
      }

      const now = new Date();
      const lastRefresh = userProfile.lastCreditRefresh?.toDate?.() || new Date(0);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const needsRefresh = now.getTime() - lastRefresh.getTime() >= oneDayInMs;

      // Só atualiza se for necessário (mais de 24h ou falta de dados)
      if (needsRefresh || userProfile.monthlyCredits === undefined) {
        syncAttemptedRef.current = true;
        sessionStorage.setItem(sessionKey, 'true');
        
        setDocumentNonBlocking(doc(db, 'users', user.uid), {
          name: user.displayName || userProfile.name || 'Nodo Nexus',
          email: user.email,
          lastSignedIn: serverTimestamp(),
          monthlyCredits: 400000,
          creditsUsed: needsRefresh ? 0 : (userProfile.creditsUsed ?? 0),
          lastCreditRefresh: serverTimestamp(),
        }, { merge: true });
      }
    }
  }, [user, db, !!userProfile]); // Depende apenas da existência do perfil, não de todo o objeto para evitar loops

  const bindsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'bindCodes'), orderBy('createdAt', 'desc'), limit(3));
  }, [db, user]);
  const { data: binds } = useCollection(bindsQuery);

  const nucleiQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'nuclei'), limit(3));
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

  if (isUserLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );
  
  if (!user) redirect('/auth');

  const availableCredits = (userProfile?.monthlyCredits || 400000) - (userProfile?.creditsUsed || 0);

  const stats = [
    { label: 'Binds Ativos', value: binds?.length || 0, icon: Key, color: 'text-accent' },
    { label: 'Núcleos', value: nuclei?.length || 0, icon: Database, color: 'text-primary' },
    { label: 'Sync Status', value: statsStatus(nuclei), icon: Zap, color: 'text-yellow-500' },
    { label: 'Saldo Diário', value: Math.max(0, availableCredits), icon: Wallet, color: 'text-green-500' },
  ];

  function statsStatus(n: any) {
    if (!n) return 0;
    return n.filter((item: any) => item.status === 'online' || item.status === 'syncing').length;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Centro de Comando Nexus</h1>
          <p className="text-muted-foreground font-body">Orquestre binds com um suprimento diário renovável de 400.000 créditos.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/30 transition-colors shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">
                  {profileLoading && stat.label === 'Saldo Diário' ? '...' : stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BindGenerator />
          <BindValidator />
        </div>

        <section className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center gap-2">
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
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                              {log.action?.replace(/_/g, ' ')}
                            </p>
                            {log.creditsAllocated && (
                              <Badge variant="outline" className="text-[8px] h-4 bg-primary/10 border-primary/20 text-primary">
                                +{log.creditsAllocated.toLocaleString()} CR
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-code">
                        {log.createdAt?.seconds 
                          ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString() 
                          : 'Recente'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground font-body text-sm italic border-2 border-dashed rounded-xl">
                    Nenhuma atividade recente registrada.
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
