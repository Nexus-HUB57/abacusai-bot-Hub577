"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Key, 
  Database, 
  History, 
  Settings, 
  Wrench,
  Cpu,
  LogOut,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Códigos Bind', href: '/binds', icon: Key },
  { name: 'Monitoramento', href: '/nucleus-monitoring', icon: Database },
  { name: 'Créditos', href: '/credits', icon: CreditCard },
  { name: 'Ferramentas', href: '/tools', icon: Wrench },
  { name: 'Histórico', href: '/bind-history', icon: History },
];

export function SidebarNav() {
  const pathname = usePathname();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  return (
    <div className="w-64 h-screen border-r bg-card flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-headline">BindNexus</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-colors text-left">
          <Settings className="w-5 h-5" />
          Configurações
        </button>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          Sair do Nexus
        </button>
      </div>
    </div>
  );
}