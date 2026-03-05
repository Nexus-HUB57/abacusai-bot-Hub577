
"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Key, MoreHorizontal } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useStore } from '@/lib/store';

export default function BindsPage() {
  const { bindCodes } = useStore();

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bind Directory</h1>
            <p className="text-muted-foreground">Comprehensive list of all generated system codes.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Bind
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              Active Records
            </CardTitle>
            <CardDescription>Real-time status tracking for all bind operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bindCodes.map((bind) => (
                  <TableRow key={bind.id}>
                    <TableCell className="font-code font-bold text-accent">
                      :bind {bind.code}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{bind.description}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(bind.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={bind.status === 'active' ? 'default' : bind.status === 'expired' ? 'destructive' : 'secondary'}
                        className={bind.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                      >
                        {bind.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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
