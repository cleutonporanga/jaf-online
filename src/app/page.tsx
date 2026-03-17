
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F5F5F5] font-body">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="bg-[#4CAF50] p-4 rounded-full mb-4">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#2E7D32] font-headline">ScholarView</h1>
          <p className="text-gray-500 mt-2">Gestão escolar inteligente e simplificada.</p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full h-12 text-lg bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-lg"
            onClick={() => router.push('/dashboard')}
          >
            Acessar Sistema
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-400">Entre com seu e-mail institucional para começar.</p>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <FeatureCard title="Gestão de Turmas" desc="Controle total sobre alunos e atribuições." />
        <FeatureCard title="Diário Digital" desc="Frequência e notas em tempo real." />
        <FeatureCard title="IA Insights" desc="Análise preditiva de desempenho." />
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <h3 className="font-bold text-[#2E7D32] mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
