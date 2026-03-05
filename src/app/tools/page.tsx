
"use client";

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BindValidator } from '@/components/dashboard/bind-validator';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wrench, Terminal, Shield } from 'lucide-react';

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Technical Tools</h1>
          <p className="text-muted-foreground">Utility instruments for protocol validation and system checks.</p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          <BindValidator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent" />
                  CLI Emulator
                </CardTitle>
                <CardDescription>Direct protocol injection interface.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded bg-black/40 p-4 font-code text-xs text-green-400 border border-border/50">
                  <p>$ nexus --check-status</p>
                  <p className="mt-1">... verifying encryption keys</p>
                  <p className="text-white mt-1">[ OK ] System operational</p>
                  <p className="mt-1 animate-pulse">_</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  Security Auditor
                </CardTitle>
                <CardDescription>Evaluate bind code entropy and strength.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-accent" />
                </div>
                <p className="text-sm text-muted-foreground">Current entropy score: <span className="text-foreground font-bold">84%</span></p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
