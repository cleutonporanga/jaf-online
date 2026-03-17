"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth as useFirebaseAuth, useUser } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Preencha todos os campos."
      });
      return;
    }

    if (!auth) {
      // This case is now handled by disabling the button, but kept for safety.
      toast({
        variant: "destructive",
        title: "Sistema em inicialização",
        description: "O serviço de autenticação está sendo carregado. Tente novamente em alguns segundos."
      });
      return;
    }

    setLoading(true);
    try {
      initiateEmailSignIn(auth, email, password);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao acessar",
        description: "Verifique suas credenciais e tente novamente."
      });
      setLoading(false);
    }
  };

  const isAuthReady = !!auth;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F5F5F5] font-body">
      <Card className="max-w-md w-full border-none shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-[#4CAF50] p-8 text-center text-white">
          <div className="bg-white/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-headline">JAF Online</h1>
          <p className="opacity-90 text-sm">Escola Joaquim Antônio Filho</p>
        </div>
        
        <CardContent className="p-8 space-y-6 bg-white">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Institucional</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || isUserLoading || !isAuthReady}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || isUserLoading || !isAuthReady}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full h-12 text-lg bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-lg transition-all"
              disabled={loading || isUserLoading || isAuthenticated || !isAuthReady}
            >
              {loading || isUserLoading || !isAuthReady ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                <>
                  Acessar Sistema
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center pt-4">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              Gestão Educacional Inteligente © 2026
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
