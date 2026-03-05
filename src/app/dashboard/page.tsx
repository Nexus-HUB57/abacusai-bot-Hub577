
'use client';

import { useEffect } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BindGenerator } from '@/components/dashboard/bind-generator';
import { BindValidator } from '@/components/dashboard/bind-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Key, Database, Zap } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { redirect } from 'next/navigation';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Sync user profile on first load
  useEffect(() => {
    if (user && db) {
      const userRef = doc(db, 'users', user.uid);
      updateDocumentNonBlocking(userRef, {
        name: user.displayName || 'Anonymous User',
        email: user.email,
        lastSignedIn: serverTimestamp(),
      });
    }
  }, [user, db]);

  // User profile for credits
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: userProfile } = useDoc(userProfileRef);

  // Stats queries
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

  const stats = [
    { label: 'Active Binds', value: binds?.length || 0, icon: Key, color: 'text-accent' },
    { label: 'Total Nuclei', value: nuclei?.length || 0, icon: Database, color: 'text-primary' },
    { label: 'Syncing Nodes', value: nuclei?.filter((n: any) => n.status === 'syncing').length || 0, icon: Zap, color: 'text-yellow-500' },
    { label: 'Credits Left', value: (userProfile?.monthlyCredits || 40000) - (userProfile?.creditsUsed || 0), icon: Activity, color: 'text-green-500' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Nexus Command Center</h1>
          <p className="text-muted-foreground font-body">Monitor and manage your system-wide bind architecture.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium font-body">{stat.label}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Real-time telemetry active</p>
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
              <CardTitle className="font-headline">Recent Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs && recentLogs.length > 0 ? (
                  recentLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40 group hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'confirmed' ? 'bg-green-500' : 
                          log.status === 'pending' ? 'bg-accent' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="text-sm font-medium font-body">Bind operation: :bind {log.bindCode}</p>
                          <p className="text-xs text-muted-foreground font-body">Action: {log.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-code">
                        {log.createdAt?.seconds 
                          ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString() 
                          : 'Recent'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground font-body">
                    No recent activities recorded.
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
