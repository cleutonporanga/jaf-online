
"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth-store';
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  GraduationCap, 
  ClipboardCheck, 
  LogOut,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Minhas Turmas', href: '/classes', icon: GraduationCap },
    { name: 'Frequência', href: '/attendance', icon: ClipboardCheck },
    { name: 'Notas', href: '/grades', icon: Users },
    { name: 'Calendário', href: '/calendar', icon: CalendarIcon },
    { name: 'IA Insights', href: '/ai-insights', icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#4CAF50] text-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="h-8 w-8" />
          <span className="hidden sm:inline">ScholarView</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "text-white hover:bg-white/20 gap-2 h-10 transition-colors",
                  pathname === item.href && "bg-white/20 font-bold"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/profile">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
              <div className="hidden text-right md:block">
                <p className="text-xs font-medium leading-none">{user?.name}</p>
                <p className="text-[10px] text-white/80 capitalize">{user?.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </div>
            </div>
          </Link>
          <Button variant="ghost" size="icon" onClick={logout} className="text-white hover:bg-white/20">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
