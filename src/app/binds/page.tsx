
"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, MoreHorizontal, Loader2, Coins } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function BindsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const bindsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'users', user.uid, 'bindCodes'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: bindCodes, isLoading } = useCollection(bindCodesQuery);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Bind Directory</h1>
            <p className="text-muted-foreground font-body">Manage all high-entropy alphanumeric bind protocols.</p>
          </div>
        </header>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Key className="w-5 h-5 text-accent" />
              Active Records
            </CardTitle>
            <CardDescription className="font-body">Detailed status and credit tracking for each individual bind.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : bindCodes && bindCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-headline">Bind Command</TableHead>
                    <TableHead className="font-headline">Credits</TableHead>
                    <TableHead className="font-headline">Description</TableHead>
                    <TableHead className="font-headline">Status</TableHead>
                    <TableHead className="text-right font-headline">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindCodes.map((bind: any) => (
                    <TableRow key={bind.id} className="group">
                      <TableCell className="font-code font-bold text-accent whitespace-nowrap">
                        :bind {bind.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-code text-xs">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          <span className="font-bold text-foreground">
                            {(bind.remainingCredits ?? 40000).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">
                            {(bind.totalCredits ?? 40000).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-body text-sm text-muted-foreground">
                        {bind.description || 'System generated bind'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={bind.status === 'active' ? 'default' : bind.status === 'expired' ? 'destructive' : 'secondary'}
                          className={bind.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        >
                          {bind.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-20 text-muted-foreground font-body">
                No bind records found. Initialize a new bind in the command center.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
