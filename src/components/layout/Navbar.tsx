
"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth as useAuthStore, type UserRole } from '@/lib/auth-store';
import { 
  Home, 
  Calendar as CalendarIcon, 
  GraduationCap, 
  BarChart3, 
  FileEdit,
  Trophy,
  User as UserIcon,
  LogOut,
  Users,
  Loader2,
  UserPlus,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth as useFirebaseAuth, useUser, useFirestore, useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAILS = ['cleutonlima06@gmail.com', 'cleutonporanga@gmail.com'];

export function Navbar() {
  const { auth: firebaseAuth, firestore: db } = useFirebase();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const syncInProgress = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      if (!mounted || isUserLoading || !firebaseUser || !db || syncInProgress.current) return;
      
      syncInProgress.current = true;
      setSyncing(true);
      try {
        const userRef = doc(db, 'userProfiles', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let role: UserRole = 'professor';
        const userEmail = firebaseUser.email?.toLowerCase();

        // Identificação prioritária de administradores
        if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
          role = 'administrador';
        }

        if (userSnap.exists()) {
          const data = userSnap.data();
          const currentRoleInDb = data.role as UserRole;
          
          if (role === 'administrador' && currentRoleInDb !== 'administrador') {
            await setDoc(userRef, { role: 'administrador', updatedAt: serverTimestamp() }, { merge: true });
          } else {
            role = currentRoleInDb;
          }
        } else {
          await setDoc(userRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || userEmail?.split('@')[0] || 'Usuário',
            email: firebaseUser.email,
            role: role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        setAuth(firebaseUser, role);
      } catch (error) {
        console.error("Erro ao sincronizar perfil:", error);
      } finally {
        setSyncing(false);
        syncInProgress.current = false;
      }
    };

    syncUser();
  }, [firebaseUser?.uid, isUserLoading, db, setAuth, logout, isAuthenticated, mounted]);

  const handleLogout = async () => {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
      logout();
      router.push('/');
    }
  };

  if (!mounted) return null;

  const navItems = [
    { name: 'Início', href: '/dashboard', icon: Home },
    { name: 'Calendário', href: '/calendar', icon: CalendarIcon },
    { name: 'Horário', href: '/schedule', icon: Clock },
    { name: 'Turmas', href: '/classes', icon: GraduationCap },
    { name: 'Alunos', href: '/students', icon: UserPlus },
    { name: 'Frequência', href: '/attendance', icon: BarChart3 },
    { name: 'Médias', href: '/grades', icon: FileEdit },
    { name: 'Reunião', href: '/meetings', icon: Users },
    { name: 'Destaques', href: '/ai-insights', icon: Trophy },
    { name: 'Perfil', href: '/profile', icon: UserIcon },
  ];

  if (!isAuthenticated && pathname === '/') return null;

  return (
    <div className="sticky top-0 z-50 w-full shadow-md">
      <header className="bg-[#4CAF50] text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
            <h1 className="text-3xl font-bold tracking-tight font-headline">JAF Online</h1>
            <p className="text-xs opacity-90 font-medium">Escola Joaquim Antônio Filho | Buritizal</p>
          </Link>
          
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2 justify-end">
                  {syncing && <Loader2 className="h-3 w-3 animate-spin opacity-50" />}
                  <p className="text-sm font-bold">{user?.name || 'Carregando...'}</p>
                </div>
                <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">
                  {user?.role === 'aluno' ? 'Visualizador (Aluno)' : user?.role || 'Acessando'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-2 px-4 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          )}
        </div>
      </header>

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
