
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Edit2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, limit, where, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const db = useFirestore();
  const { user: firebaseUser, isUserLoading: authLoading } = useUser();
  const { user: appUser } = useAuth();
  const { toast } = useToast();
  
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [newNoticeText, setNewNoticeText] = useState("");

  const coursesQuery = useMemoFirebase(() => {
    if (!firebaseUser || !appUser) return null;
    if (appUser.role === 'administrador') return query(collection(db, 'courses'));
    return query(collection(db, 'courses'), where('professorId', '==', firebaseUser.uid));
  }, [db, firebaseUser, appUser]);

  const studentsQuery = useMemoFirebase(() => {
    if (!firebaseUser || !appUser) return null;
    if (appUser.role === 'administrador') return query(collection(db, 'students'));
    return query(collection(db, 'students'), where('courseIds', 'array-contains-any', ['any'])); // Placeholder for staff logic
  }, [db, firebaseUser, appUser]);

  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'schoolEvents'), limit(5));
  }, [db]);

  const noticeDocRef = useMemoFirebase(() => {
    return doc(db, 'schoolSettings', 'generalNotice');
  }, [db]);

  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);
  const { data: students, isLoading: loadingStudents } = useCollection(studentsQuery);
  const { data: events, isLoading: loadingEvents } = useCollection(eventsQuery);
  const { data: noticeData, isLoading: loadingNotice } = useDoc(noticeDocRef);

  const isLoading = authLoading || loadingCourses || loadingStudents || loadingEvents || loadingNotice;
  const isAdmin = appUser?.role === 'administrador';

  const handleUpdateNotice = () => {
    if (!isAdmin || !newNoticeText.trim()) return;

    setDocumentNonBlocking(noticeDocRef, {
      text: newNoticeText,
      updatedBy: appUser.name,
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({
      title: "Aviso Atualizado",
      description: "O aviso geral foi publicado para todos os usuários.",
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
    setNoticeDialogOpen(false);
  };

  const openNoticeEditor = () => {
    setNewNoticeText(noticeData?.text || "");
    setNoticeDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#4CAF50] animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
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
          <p className="text-muted-foreground text-sm">
            {isAdmin ? 'Visão Geral da Instituição' : `Bem-vindo(a), ${appUser?.name}.`}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total de Alunos" 
            value={students?.length.toString() || '0'} 
            icon={Users} 
            color="bg-emerald-600" 
          />
          <StatCard 
            title={isAdmin ? 'Total de Turmas' : 'Minhas Turmas'} 
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
                  Desempenho Geral
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
                  <CardTitle className="text-lg text-[#2E7D32]">
                    {isAdmin ? 'Turmas Recentes' : 'Minhas Turmas'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses?.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-[#2E7D32] text-sm">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{c.gradeLevel}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-bold">ATIVA</span>
                    </div>
                  ))}
                  {(!courses || courses.length === 0) && (
                    <p className="text-sm text-center text-muted-foreground">Nenhuma turma encontrada.</p>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Aviso Geral
                </CardTitle>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white hover:bg-white/10"
                    onClick={openNoticeEditor}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-90 leading-relaxed italic">
                  {noticeData?.text || "Bem-vindo ao ScholarView. Use este espaço para comunicados importantes da instituição."}
                </p>
                {noticeData?.updatedAt && (
                  <p className="text-[10px] mt-4 opacity-60 uppercase font-bold text-right">
                    Atualizado em {new Date(noticeData.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {isAdmin && (
          <Dialog open={noticeDialogOpen} onOpenChange={setNoticeDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-[#2E7D32]">Editar Aviso Geral</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Este aviso será exibido no painel de controle de todos os professores, alunos e funcionários.
                </p>
                <Textarea 
                  placeholder="Digite o novo comunicado aqui..."
                  className="min-h-[150px] text-sm"
                  value={newNoticeText}
                  onChange={(e) => setNewNoticeText(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoticeDialogOpen(false)}>Cancelar</Button>
                <Button 
                  className="bg-[#4CAF50] hover:bg-[#43a047]"
                  onClick={handleUpdateNotice}
                  disabled={!newNoticeText.trim()}
                >
                  Publicar Aviso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">{title}</p>
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
      <span className="text-xs font-bold">{text}</span>
    </div>
  );
}
