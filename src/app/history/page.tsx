
"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Clock, ArrowRight } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useStore } from '@/lib/store';

export default function HistoryPage() {
  const { history, nuclei } = useStore();

  const getNucleusName = (id: string) => {
    return nuclei.find(n => n.id === id)?.name || id;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bind History</h1>
          <p className="text-muted-foreground">Chronological audit log of all system bind events.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-accent" />
              Event Stream
            </CardTitle>
            <CardDescription>Monitoring real-time interactions across the Nexus.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Target Nucleus</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Bind Code</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-code text-xs text-muted-foreground">
                      {new Date(h.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getNucleusName(h.nucleusId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>INITIATED</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>LINK</span>
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
                        {h.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  );
}
