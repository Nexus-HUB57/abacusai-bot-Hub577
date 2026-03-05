
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, BarChart3, Smartphone, ArrowRight, CheckCircle, Cpu } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  const { user, loading } = useUser();
  const auth = useAuth();

  if (loading) return null;
  if (user) redirect('/dashboard');

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Fast Code Generation",
      description: "Create secure bind codes in seconds with the standard :bind format.",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Protected by Firebase Auth and rigorous alphanumeric validation rules.",
    },
    {
      icon: BarChart3,
      title: "Real-time Monitoring",
      description: "Track the status of your trinuclear network units instantly.",
    },
    {
      icon: Smartphone,
      title: "Nexus Integration",
      description: "Seamlessly link system components via secure protocol injection.",
    },
  ];

  const benefits = [
    "Intuitive and elegant technical dashboard",
    "Complete bind operation audit logs",
    "Advanced status filtering and search",
    "Support for multi-class nuclei (Primary/Secondary)",
    "Detailed activity heartbeat monitoring",
    "Modern reactive UI powered by ShadCN",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight font-headline">BindNexus</span>
          </div>
          <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
            <Zap className="w-3 h-3" />
            v2.5 Protocol Active
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mx-auto font-headline leading-tight">
            Elegant Management of <span className="text-accent">Bind Architectures</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            A comprehensive command platform for managing system bind codes and trinuclear orchestrator nuclei with surgical precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-lg h-14 px-8 group">
              Initialize Nexus
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-accent/30 hover:bg-accent/10">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card/50 border-accent/10 hover:border-accent/40 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-accent/10 transition-colors" />
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24 py-12">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold font-headline tracking-tight">Why Choose Our <br/><span className="text-primary">Orchestration Platform?</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="bg-primary/5 border-primary/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Core Capabilities</CardTitle>
              <CardDescription>Engineered for high-availability systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Admin Command Center</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Visualize network throughput, active binds, and real-time entity health from a single pane of glass.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Entropy-Validated Generation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Cryptographically secure code generation with instant validation against protocol rules.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Audit-Ready History</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Every bind event is timestamped and logged with its source nucleus and outcome for total accountability.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-primary rounded-3xl p-12 md:p-20 text-center text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/bindnexus-cta/1200/400')] opacity-10 mix-blend-overlay grayscale" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline tracking-tight relative">Ready to Orchestrate?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto font-body relative leading-relaxed">
            Join the network and start managing your bind protocol with advanced monitoring and secure generation tools.
          </p>
          <Button onClick={handleLogin} size="lg" variant="secondary" className="h-16 px-10 text-lg font-bold group relative">
            Authenticate Nexus Access
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
             <Cpu className="w-5 h-5" />
             <span className="font-bold text-foreground font-headline">BindNexus</span>
          </div>
          <p className="text-sm">&copy; 2026 Orquestrador Trinuclear. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-xs">
            <Link href="#" className="hover:text-accent transition-colors">Privacy Protocol</Link>
            <Link href="#" className="hover:text-accent transition-colors">Security Terms</Link>
            <Link href="#" className="hover:text-accent transition-colors">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
