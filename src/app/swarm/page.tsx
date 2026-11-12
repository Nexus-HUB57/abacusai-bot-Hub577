
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
  History,
  ShieldAlert,
  MessageSquare
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
    setLogs([
      '[SYSTEM] Inicializando Motor de Ação AbacusAI...', 
      '[CMD] gh repo clone Nexus-HUB57/abacusai-bot-Hub57',
      '[INFO] Ativando agentes 100% gratuitos e open source.'
    ]);
    
    const steps = [
      { p: 10, log: '[AUTH] Conectado ao Nexus-HUB57 (Sincronizado)' },
      { p: 25, log: '[SWARM] Orquestrando malha para suporte a WhatsApp/Telegram/Discord' },
      { p: 45, log: '[CMD] gh repo clone Nexus-HUB57/abacusai-bot-Hub57 --depth 1' },
      { p: 65, log: '[GIT] Recebendo objetos: 100% (4560/4560), conclusão de handshake.' },
      { p: 85, log: '[BUILD] Instalando drivers de conectores (100+ integrados)...' },
      { p: 100, log: '[SUCCESS] Swarm finalizado. Agente AbacusAI pronto para Hand-off.' }
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setProgress(step.p);
        setLogs(prev => [...prev, step.log]);
        if (step.p === 100) {
          setStatus('completed');
          toast({
            title: "Sincronização End-to-End",
            description: "O repositório AbacusAI foi clonado e vinculado à sua malha.",
          });
        }
      }, (i + 1) * 1200);
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Boxes className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold tracking-tight font-headline">Operações de Enxame (AbacusAI)</h1>
          </div>
          <p className="text-muted-foreground font-body">Orquestração end-to-end de agentes pessoais para mensageria e automação de tarefas cruzadas.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Github className="w-5 h-5" />
                  GitHub Source Sync
                </CardTitle>
                <CardDescription>
                  Clonando repositório <code className="bg-secondary px-1 rounded text-accent">Nexus-HUB57/abacusai-bot-Hub57</code> com permissões full access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl bg-black/40 border border-border/50 font-code text-xs text-green-400 space-y-2 overflow-auto h-[220px]">
                  {logs.length > 0 ? (
                    logs.map((log, i) => <p key={i}>{log}</p>)
                  ) : (
                    <p className="text-muted-foreground italic">Aguardando comando de inicialização da malha Abacus...</p>
                  )}
                  {status === 'running' && <p className="animate-pulse">_</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                    <span>Integridade da Malha</span>
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
                    {status === 'completed' ? 'Reiniciar Sync' : 'Iniciar Sincronização End-to-End'}
                  </Button>
                  {status === 'completed' && (
                    <Button variant="outline" className="border-green-500/50 text-green-500 h-12 gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Sincronizado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-secondary/10 border-border">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    Canais de Mensageria
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span>WhatsApp Agent</span>
                    <Badge variant="outline" className="h-4 text-[8px] bg-green-500/10 text-green-500 border-green-500/20">READY</Badge>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Telegram Bridge</span>
                    <Badge variant="outline" className="h-4 text-[8px] bg-green-500/10 text-green-500 border-green-500/20">ACTIVE</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/10 border-border">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                    Security Model
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Execução sandbox kernel-level ativa para comandos shell e manipulação de arquivos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-secondary/10 border-accent/10">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-bold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Status do Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Repositório Clonado</p>
                  <p className="text-sm font-bold font-code break-all text-accent">Nexus-HUB57/abacusai-bot-Hub57</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Licença</p>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">MIT - OPEN SOURCE</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-sm uppercase font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Nexus CLI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <code className="block p-2 bg-black/60 rounded text-[10px] font-code text-white">
                  nexus swarm --sync-abacus --repo Hub57
                </code>
                <p className="text-[10px] text-muted-foreground italic">Use este comando para forçar a sincronização de memória e conversas.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
