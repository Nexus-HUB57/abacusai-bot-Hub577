
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BindGenerator } from '@/components/dashboard/bind-generator';
import { BindValidator } from '@/components/dashboard/bind-validator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Key, Database, Zap } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Nexus Command Center</h1>
          <p className="text-muted-foreground">Monitor and manage your system-wide bind architecture.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Binds', value: '1,284', icon: Key, color: 'text-accent' },
            { label: 'Total Nuclei', value: '42', icon: Database, color: 'text-primary' },
            { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-green-500' },
            { label: 'Pending Binds', value: '12', icon: Zap, color: 'text-yellow-500' },
          ].map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">+2.5% from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BindGenerator />
          <BindValidator />
        </div>

        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Log Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: 'Bind Confirmed', nucleus: 'Core Engine', time: '2 mins ago', status: 'success' },
                  { event: 'New Nucleus Registered', nucleus: 'Relay Alpha', time: '1 hour ago', status: 'info' },
                  { event: 'Bind Expired', nucleus: 'System Admin', time: '3 hours ago', status: 'warning' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' : 
                        log.status === 'info' ? 'bg-accent' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.nucleus}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-code">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Toaster />
    </div>
  );
}
