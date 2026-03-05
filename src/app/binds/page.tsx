
"use client";

import { useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, MoreHorizontal, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function BindsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const bindsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(
      collection(db, 'bindCodes'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: bindCodes, loading } = useCollection(bindsQuery);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-headline">Bind Directory</h1>
            <p className="text-muted-foreground font-body">Comprehensive list of all generated system codes.</p>
          </div>
        </header>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Key className="w-5 h-5 text-accent" />
              Active Records
            </CardTitle>
            <CardDescription className="font-body">Real-time status tracking for all bind operations.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : bindCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-headline">Code</TableHead>
                    <TableHead className="font-headline">Description</TableHead>
                    <TableHead className="font-headline">Created</TableHead>
                    <TableHead className="font-headline">Status</TableHead>
                    <TableHead className="text-right font-headline">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindCodes.map((bind: any) => (
                    <TableRow key={bind.id} className="group">
                      <TableCell className="font-code font-bold text-accent">
                        :bind {bind.code}
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-body">
                        {bind.description || 'No description'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-code">
                        {bind.createdAt?.seconds 
                          ? new Date(bind.createdAt.seconds * 1000).toLocaleDateString() 
                          : 'Pending...'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={bind.status === 'active' ? 'default' : bind.status === 'expired' ? 'destructive' : 'secondary'}
                          className={bind.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        >
                          {bind.status?.toUpperCase()}
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
                No bind codes found. Generate one in the dashboard!
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
