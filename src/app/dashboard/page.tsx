"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';

export default function Dashboard() {
  const db = useFirestore();
  const { user, isUserLoading: authLoading } = useUser();
  
  const coursesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'courses'), where('professorId', '==', user.uid));
  }, [db, user]);

  const studentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'students'), where('professorIds', 'array-contains', user.uid));
  }, [db, user]);

  const eventsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Removed orderBy to avoid index requirement during initial prototype
    return query(
      collection(db, 'schoolEvents'), 
      where('associatedCourseProfessorIds', 'array-contains', user.uid),
      limit(5)
    );
  }, [db, user]);

  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);
  const { data: students, isLoading: loadingStudents } = useCollection(studentsQuery);
  const { data: events, isLoading: loadingEvents } = useCollection(eventsQuery);

  const isLoading = authLoading || loadingCourses || loadingStudents || loadingEvents;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#4CAF50] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Por favor, realize o login para acessar o painel.</p>
      </div>
    );
  }

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
            value={students?.length.toString() || '0'} 
            icon={Users} 
            color="bg-emerald-600" 
          />
          <StatCard 
            title="Minhas Turmas" 
            value={courses?.length.toString() || '0'} 
            icon={GraduationCap} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Eventos Próximos" 
            value={events?.length.toString() || '0'} 
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
                  {courses?.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-[#2E7D32]">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.gradeLevel}</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Ativa</span>
                    </div>
                  ))}
                  {(!courses || courses.length === 0) && (
                    <p className="text-sm text-center text-muted-foreground">Nenhuma turma cadastrada sob sua supervisão.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-[#2E7D32]">Ações Recomendadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ActionItem text="Registrar frequência semanal" type="warning" />
                  <ActionItem text="Lançar novas notas do bimestre" type="info" />
                  <ActionItem text="Atualizar perfil institucional" type="info" />
                </ActionItem>
              </CardContent>
            </Card>
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
                {events?.map(event => {
                  const date = event.startDate ? new Date(event.startDate) : new Date();
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
                  
                  return (
                    <div key={event.id} className="flex gap-4 items-start">
                      <div className="bg-[#4CAF50] text-white px-2 py-1 rounded text-center min-w-[50px]">
                        <span className="text-xs block leading-none">{day}</span>
                        <span className="text-[10px] uppercase font-bold">{month}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{event.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{event.type}</p>
                      </div>
                    </div>
                  );
                })}
                {(!events || events.length === 0) && (
                  <p className="text-sm text-center text-muted-foreground py-4">Sem eventos próximos.</p>
                )}
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
                  Lembre-se que o prazo para encerramento do bimestre está próximo. Todas as notas devem estar lançadas no sistema.
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