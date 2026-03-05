
"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { NucleusForm } from '@/components/dashboard/nucleus-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Edit, Trash2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NucleiPage() {
  const { nuclei } = useStore();

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Nucleus Management</h1>
          <p className="text-muted-foreground">Configure and track processing units across your network.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <NucleusForm />
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" />
                  Nucleus Directory
                </CardTitle>
                <CardDescription>Viewing {nuclei.length} registered entities.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nuclei.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-semibold">{n.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{n.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {n.tags.map(t => (
                              <Badge key={t} variant="outline" className="text-[10px] py-0 border-primary/30 text-primary">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4 text-accent" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
