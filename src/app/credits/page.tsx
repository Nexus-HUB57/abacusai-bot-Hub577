
"use client";

import { useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowUpRight, ArrowDownRight, Loader2, Wallet } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';

export default function CreditsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemo(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const creditsHistoryQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'creditHistory'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: history, loading: historyLoading } = useCollection(creditsHistoryQuery);

  if (!user) return null;

  const availableCredits = (profile?.monthlyCredits || 40000) - (profile?.creditsUsed || 0);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Credit Management</h1>
          <p className="text-muted-foreground font-body">Monitor your token balance and consumption history.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 border-accent/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Available Balance</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline flex items-center gap-2">
                <Wallet className="w-6 h-6 text-accent" />
                {profileLoading ? '...' : availableCredits.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Monthly refresh active</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Used This Period</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline">
                {profileLoading ? '...' : (profile?.creditsUsed || 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Total consumption this month</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold">Allocated Quota</CardDescription>
              <CardTitle className="text-3xl font-bold font-headline">
                {profileLoading ? '...' : (profile?.monthlyCredits || 40000).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Standard Tier Allocation</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <CreditCard className="w-5 h-5 text-accent" />
              Consumption Log
            </CardTitle>
            <CardDescription className="font-body">Detailed record of all credit-consuming operations.</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : history.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-headline">Timestamp</TableHead>
                    <TableHead className="font-headline">Action</TableHead>
                    <TableHead className="font-headline">Amount</TableHead>
                    <TableHead className="font-headline">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-code text-xs text-muted-foreground">
                        {h.createdAt?.seconds 
                          ? new Date(h.createdAt.seconds * 1000).toLocaleString() 
                          : 'Recent'}
                      </TableCell>
                      <TableCell className="font-medium font-body uppercase tracking-wider text-xs">
                        <Badge variant="outline" className="border-accent/20 text-accent">
                          {h.action.replace(/_/g, ' ')}
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
                No credit history found. Start generating bind codes to see records.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
