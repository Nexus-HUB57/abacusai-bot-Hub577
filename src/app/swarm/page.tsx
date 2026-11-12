
'use client';

import { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { 
  Boxes, 
  Github, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Loader2, 
  Cpu,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SwarmPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const handleStartSwarm = () => {
    setStatus('running');
    setProgress(0);
    setLogs(['[SYSTEM] Inicializando Enxame Nexus...', '[CMD] gh auth status --hostname github.com']);
    
    const steps = [
      { p: 10, log: '[AUTH] Autenticado como Nexus-HUB57' },
      { p: 30, log: '[SWARM] Orquestrando 12 nodos para operação de clone' },
      { p: 50, log: '[CMD] gh repo clone Nexus-HUB57/abacusai-bot-Hub57' },
      { p: 70, log: '[GIT] Recebendo objetos: 100% (2450/2450), concluído.' },
      { p: 90, log: '[BUILD] Instalando dependências abacusai...' },
      { p: 100, log: '[SUCCESS] Swarm finalizado. abacusai-bot-Hub57 pronto.' }
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setProgress(step.p);
        setLogs(prev => [...prev, step.log]);
        if (step.p === 100) {
          setStatus('completed');
          toast({
            title: "Operação Concluída",
            description: "O Enxame finalizou o clone do repositório com sucesso.",
          });
        }
      }, (i + 1) * 1500);
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Boxes className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold tracking-tight font-headline">Operações de Enxame (Swarm)</h1>
          </div>
          <p className="text-muted-foreground font-body">Orquestração de múltiplos agentes para tarefas de alta escala em repositórios Nexus.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Github className="w-5 h-5" />
                  GitHub Clone Swarm
                </CardTitle>
                <CardDescription>
                  Inicia o clone sincronizado do repositório <code className="bg-secondary px-1 rounded">Nexus-HUB57/abacusai-bot-Hub57</code> em toda a malha.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl bg-black/40 border border-border/50 font-code text-xs text-green-400 space-y-2 overflow-auto h-[200px]">
                  {logs.length > 0 ? (
                    logs.map((log, i) => <p key={i}>{log}</p>)
                  ) : (
                    <p className="text-muted-foreground italic">Aguardando comando de inicialização...</p>
                  )}
                  {status === 'running' && <p className="animate-pulse">_</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                    <span>Progresso do Enxame</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleStartSwarm} 
                    disabled={status === 'running'}
                    className="flex-1 bg-primary hover:bg-primary/90 h-12 gap-2"
                  >
                    {status === 'running' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    {status === 'completed' ? 'Reiniciar Enxame' : 'Iniciar Orquestração'}
                  </Button>
                  {status === 'completed' && (
                    <Button variant="outline" className="border-green-500/50 text-green-500 h-12 gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Finalizado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent" />
                  Nodos de Execução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="p-3 border rounded-lg bg-secondary/20 flex flex-col items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                      <span className="text-[10px] font-code">NODE-{i.toString().padStart(3, '0')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-secondary/10 border-accent/10">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-bold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Operação Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Repositório Alvo</p>
                  <p className="text-sm font-bold font-code break-all">Nexus-HUB57/abacusai-bot-Hub57</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Status do Link</p>
                  <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">SINCRONIZADO</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Quick CLI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <code className="block p-2 bg-black/60 rounded text-[10px] font-code text-white">
                  nexus swarm --repo abacusai-bot-Hub57 --nodes 12
                </code>
                <p className="text-[10px] text-muted-foreground italic">Use este comando no terminal local para orquestração remota.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
