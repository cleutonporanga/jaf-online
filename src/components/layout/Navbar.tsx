
"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth-store';
import { 
  Home, 
  Calendar as CalendarIcon, 
  GraduationCap, 
  BarChart3, 
  FileEdit,
  Trophy,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Início', href: '/dashboard', icon: Home },
    { name: 'Calendário', href: '/calendar', icon: CalendarIcon },
    { name: 'Turmas', href: '/classes', icon: GraduationCap },
    { name: 'Frequência', href: '/attendance', icon: BarChart3 },
    { name: 'Médias', href: '/grades', icon: FileEdit },
    { name: 'Destaques', href: '/ai-insights', icon: Trophy },
    { name: 'Perfil', href: '/profile', icon: UserIcon },
  ];

  // We only show the full navigation if the user is logged in
  if (!isAuthenticated && pathname === '/') return null;

  return (
    <nav className="bg-white shadow p-4 sticky top-0 z-50 flex items-center justify-between transition-all">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex flex-wrap gap-4 md:gap-8 items-center">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary font-bold underline underline-offset-8 decoration-2" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {isAuthenticated && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
