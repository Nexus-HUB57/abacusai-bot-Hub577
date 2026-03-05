'use client';

import { useState, useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { RegisterNucleusDialog } from '@/components/dashboard/register-nucleus-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Radio, 
  Zap, 
  Plus, 
  Database, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';

export default function NucleusMonitoringPage() {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const nucleiQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'users', user.uid, 'nuclei'), limit(20));
  }, [db, user]);

  const { data: nucleuses, isLoading } = useCollection(nucleiQuery);

  const stats = useMemo(() => {
    if (!nucleuses) return { online: 0, syncing: 0, offline: 0, total: 0 };
    return {
      online: nucleuses.filter(n => n.status === 'online').length,
      syncing: nucleuses.filter(n => n.status === 'syncing').length,
      offline: nucleuses.filter(n => n.status === 'offline').length,
      total: nucleuses.length
    };
  }, [nucleuses]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Radio className="w-5 h-5 text-green-500 animate-pulse" />;
      case 'syncing':
        return <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'online': return 'default';
      case 'syncing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Nucleus Monitoring</h1>
            <p className="text-muted-foreground font-body">Real-time status tracking for trinuclear network components.</p>
          </div>
          <Button onClick={() => setShowRegisterDialog(true)} className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Register Nucleus
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Online', value: stats.online, color: 'border-l-green-500', desc: 'Active units' },
            { label: 'Syncing', value: stats.syncing, color: 'border-l-yellow-500', desc: 'In progress' },
            { label: 'Offline', value: stats.offline, color: 'border-l-muted', desc: 'Disconnected' },
            { label: 'Total', value: stats.total, color: 'border-l-accent', desc: 'Registered' },
          ].map((stat, i) => (
            <Card key={i} className={`border-l-4 ${stat.color} shadow-sm bg-card/50`}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-accent/10 shadow-xl shadow-accent/5 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-headline">
              <Activity className="w-5 h-5 text-accent" />
              Network Entities
            </CardTitle>
            <CardDescription className="font-body">Heartbeat monitoring for registered nodes (Top 20).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 animate-pulse text-muted-foreground">
                  Synchronizing data stream...
                </div>
              ) : nucleuses && nucleuses.length > 0 ? (
                nucleuses.map((nucleus) => (
                  <div key={nucleus.id} className="p-5 border rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-background border group-hover:border-accent/50 transition-colors">
                          {getStatusIcon(nucleus.status)}
                        </div>
                        <div>
                          <p className="font-bold text-lg font-headline">{nucleus.name}</p>
                          <p className="text-xs text-muted-foreground font-code opacity-70">{nucleus.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStatusVariant(nucleus.status)}
                          className={nucleus.status === 'online' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        >
                          {nucleus.status?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        <Badge variant="outline" className="capitalize border-primary/30 text-primary">
                          {nucleus.type}
                        </Badge>
                      </div>
                    </div>

                    {nucleus.status === "syncing" && (
                      <div className="space-y-2 mb-4 bg-background/40 p-3 rounded-lg border border-yellow-500/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Synchronization Progress</span>
                          <span className="font-bold text-accent">{nucleus.syncProgress || 0}%</span>
                        </div>
                        <Progress value={nucleus.syncProgress || 0} className="h-1.5 bg-secondary" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 text-[10px] border-t pt-4 border-border/50">
                      <div>
                        <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-semibold">Last Heartbeat</p>
                        <div className="flex items-center gap-1.5 text-foreground font-code">
                          <Clock className="w-3 h-3 text-accent" />
                          {nucleus.lastHeartbeat ? new Date(nucleus.lastHeartbeat).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-semibold">Last Sync Cycle</p>
                        <div className="flex items-center gap-1.5 text-foreground font-code">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          {nucleus.lastSyncAt ? new Date(nucleus.lastSyncAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-secondary/5">
                  <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-semibold mb-2">No Nuclei Found</h3>
                  <p className="text-muted-foreground mb-6">Initialize your first unit to begin system monitoring.</p>
                  <Button
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10"
                    onClick={() => setShowRegisterDialog(true)}
                  >
                    Register Initial Nucleus
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <RegisterNucleusDialog 
        open={showRegisterDialog} 
        onOpenChange={setShowRegisterDialog} 
      />
      <Toaster />
    </div>
  );
}