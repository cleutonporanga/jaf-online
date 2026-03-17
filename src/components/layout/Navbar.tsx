
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
  LogOut,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth as useFirebaseAuth, useUser } from '@/firebase';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const firebaseAuth = useFirebaseAuth();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { user, setAuth, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Sincroniza o estado do Firebase com o store do Zustand
    if (!isUserLoading) {
      setAuth(firebaseUser);
    }
  }, [firebaseUser, isUserLoading, setAuth]);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Início', href: '/dashboard', icon: Home },
    { name: 'Calendário', href: '/calendar', icon: CalendarIcon },
    { name: 'Turmas', href: '/classes', icon: GraduationCap },
    { name: 'Frequência', href: '/attendance', icon: BarChart3 },
    { name: 'Médias', href: '/grades', icon: FileEdit },
    { name: 'Reunião', href: '/meetings', icon: Users },
    { name: 'Destaques', href: '/ai-insights', icon: Trophy },
    { name: 'Perfil', href: '/profile', icon: UserIcon },
  ];

  if (!isAuthenticated && pathname === '/') return null;

  return (
    <div className="sticky top-0 z-50 w-full shadow-md">
      {/* Cabeçalho Principal (Barra Verde) */}
      <header className="bg-[#4CAF50] text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Escola JAF</h1>
            <p className="text-xs opacity-90 font-medium">Sistema de Gestão Escolar | 2024</p>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-80">{user?.role}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 px-4"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Menu de Abas (Barra Branca) */}
      <nav className="bg-white border-b overflow-x-auto py-2">
        <div className="container mx-auto flex items-center gap-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap border-2",
                  isActive 
                    ? "bg-emerald-50 text-[#2E7D32] border-[#2E7D32] rounded-xl shadow-sm" 
                    : "text-muted-foreground border-transparent hover:text-[#4CAF50] hover:bg-emerald-50/50 rounded-xl"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-[#2E7D32]" : "text-gray-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
