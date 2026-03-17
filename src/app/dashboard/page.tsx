
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { mockClasses, mockStudents, mockEvents } from '@/lib/data';

export default function Dashboard() {
  const totalClasses = mockClasses.length;
  const totalStudents = mockStudents.length;
  const upcomingEvents = mockEvents.slice(0, 3);

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Painel de Controle</h1>
          <p className="text-muted-foreground">Bem-vindo(a) ao seu painel de controle ScholarView.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total de Alunos" 
            value={totalStudents.toString()} 
            icon={Users} 
            color="bg-emerald-600" 
          />
          <StatCard 
            title="Minhas Turmas" 
            value={totalClasses.toString()} 
            icon={GraduationCap} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Eventos do Mês" 
            value={mockEvents.length.toString()} 
            icon={CalendarIcon} 
            color="bg-orange-500" 
          />
          <StatCard 
            title="Média Geral" 
            value="8.4" 
            icon={TrendingUp} 
            color="bg-emerald-700" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#4CAF50]" />
                  Desempenho por Turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-muted-foreground italic">Gráfico de desempenho será carregado aqui.</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-[#2E7D32]">Turmas Recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockClasses.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-[#2E7D32]">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.grade}</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Ativa</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-[#2E7D32]">Ações Recomendadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ActionItem text="Registrar frequência: Matemática Avançada" type="warning" />
                  <ActionItem text="Lançar notas: Física I" type="info" />
                  <ActionItem text="Gerar relatório de conselho de classe" type="info" />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#2E7D32]">
                  <CalendarIcon className="h-5 w-5 text-[#4CAF50]" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map(event => {
                  const day = event.date.split('-')[2];
                  return (
                    <div key={event.id} className="flex gap-4 items-start">
                      <div className="bg-[#4CAF50] text-white px-2 py-1 rounded text-center min-w-[50px]">
                        <span className="text-xs block leading-none">{day}</span>
                        <span className="text-[10px] uppercase font-bold">Maio</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{event.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{event.type === 'holiday' ? 'Feriado' : event.type === 'meeting' ? 'Reunião' : 'Prazo'}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-[#2E7D32] text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Aviso Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-90">
                  Lembre-se que o prazo para encerramento do 1º bimestre é dia 30 de Maio. Todas as notas devem estar lançadas no sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
          </div>
          <div className={`${color} p-3 rounded-xl text-white`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionItem({ text, type }: { text: string, type: 'warning' | 'info' }) {
  return (
    <div className={`p-3 rounded-lg flex items-center gap-3 ${type === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
