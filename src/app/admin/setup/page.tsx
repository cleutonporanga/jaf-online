
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { seedDatabase } from '@/lib/db-seed';
import { Loader2, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-store';

export default function SetupPage() {
  const db = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isAdmin = user?.role === 'administrador';

  const handleSeed = async () => {
    if (!db) return;
    setLoading(true);
    try {
      await seedDatabase(db);
      setDone(true);
      toast({
        title: "Banco de Dados Inicializado",
        description: "Todos os dados de exemplo foram criados com sucesso.",
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao inicializar",
        description: error.message || "Ocorreu um erro inesperado."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-none shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-[#2E7D32] p-8 text-center text-white">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <CardTitle className="text-2xl font-bold font-headline">Configuração JAF 2026</CardTitle>
          <CardDescription className="text-emerald-100 opacity-90">
            Inicialização do ambiente de dados institucional.
          </CardDescription>
        </div>
        
        <CardContent className="p-8 space-y-6 bg-white">
          {!isAdmin ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <p className="text-sm text-gray-600">
                Esta página é restrita a administradores. Por favor, faça login com a conta master para configurar o banco.
              </p>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-[#4CAF50]" />
              <h2 className="text-xl font-bold text-gray-800">Tudo pronto!</h2>
              <p className="text-sm text-muted-foreground">
                O banco de dados foi migrado e populado com os dados iniciais.
              </p>
              <Button onClick={() => window.location.href = '/dashboard'} className="w-full mt-4 bg-[#4CAF50]">
                Ir para o Painel
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Clique no botão abaixo para criar as coleções iniciais, usuários administrativos e dados de exemplo (turmas, alunos e horários).
              </p>
              <Button 
                onClick={handleSeed} 
                disabled={loading}
                className="w-full h-12 bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl text-lg shadow-lg"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
                {loading ? "Processando..." : "Popular Banco de Dados"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
