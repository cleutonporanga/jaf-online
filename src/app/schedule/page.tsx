"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Clock, 
  Trash2, 
  Loader2, 
  BookOpen, 
  User,
  AlertTriangle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-store';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DAYS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

export default function SchedulePage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newItem, setNewItem] = useState({
    dayOfWeek: DAYS[0],
    startTime: '',
    endTime: '',
    subject: '',
    teacherName: ''
  });

  const isAdmin = user?.role === 'administrador';

  const coursesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses'));
  }, [db]);

  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);

  const scheduleQuery = useMemoFirebase(() => {
    if (!selectedCourseId || !db) return null;
    return query(collection(db, 'schedules'), where('courseId', '==', selectedCourseId));
  }, [db, selectedCourseId]);

  const { data: schedule, isLoading: loadingSchedule } = useCollection(scheduleQuery);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedCourseId || !newItem.subject || !newItem.startTime) return;

    setLoading(true);
    try {
      await addDocumentNonBlocking(collection(db, 'schedules'), {
        ...newItem,
        courseId: selectedCourseId,
      });

      toast({
        title: "Aula Adicionada",
        description: "O horário escolar foi atualizado.",
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
      setIsDialogOpen(false);
      setNewItem({ dayOfWeek: DAYS[0], startTime: '', endTime: '', subject: '', teacherName: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!db || !isAdmin) return;
    try {
      await deleteDoc(doc(db, 'schedules', id));
      toast({ title: "Aula Removida" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Horário Escolar</h1>
            <p className="text-muted-foreground">Grade semanal de aulas por turma.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedCourseId} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-md h-11 px-6">
                    <Plus className="h-5 w-5" />
                    Adicionar Aula
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-[#2E7D32]">Nova Aula no Horário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSlot} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select value={newItem.dayOfWeek} onValueChange={v => setNewItem({...newItem, dayOfWeek: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input type="time" value={newItem.startTime} onChange={e => setNewItem({...newItem, startTime: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input type="time" value={newItem.endTime} onChange={e => setNewItem({...newItem, endTime: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Disciplina</Label>
                      <Input placeholder="Ex: Matemática" value={newItem.subject} onChange={e => setNewItem({...newItem, subject: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Professor</Label>
                      <Input placeholder="Nome do Professor" value={newItem.teacherName} onChange={e => setNewItem({...newItem, teacherName: e.target.value})} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={loading} className="w-full bg-[#4CAF50]">
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar no Horário"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        {!selectedCourseId ? (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-emerald-100 shadow-sm">
            <Clock className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">Selecione uma turma para ver o horário</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {DAYS.map(day => {
              const daySlots = schedule?.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];
              
              return (
                <Card key={day} className="border-none shadow-md bg-white">
                  <CardHeader className="bg-emerald-50 py-3 text-center border-b">
                    <CardTitle className="text-sm font-bold text-emerald-800 uppercase tracking-wider">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    {daySlots.map(slot => (
                      <div key={slot.id} className="group relative p-3 rounded-lg border border-emerald-50 bg-gray-50/50 hover:bg-emerald-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-[#4CAF50] bg-white px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-emerald-600" />
                          {slot.subject}
                        </h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <User className="h-2.5 w-2.5" />
                          {slot.teacherName || 'Não atribuído'}
                        </p>
                      </div>
                    ))}
                    {daySlots.length === 0 && (
                      <p className="text-[10px] text-center text-muted-foreground italic py-8">Nenhuma aula registrada.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isAdmin && selectedCourseId && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">Modo Administrador: Você pode adicionar ou remover aulas de qualquer dia da semana.</p>
          </div>
        )}
      </main>
    </div>
  );
}