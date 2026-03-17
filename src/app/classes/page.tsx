
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Search, 
  MoreVertical, 
  UserPlus, 
  FileText,
  Clock,
  Plus,
  Loader2,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-store';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, serverTimestamp, addDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function ClassesPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    year: new Date().getFullYear().toString(),
    gradeLevel: '',
    professorId: '',
  });

  const isAdmin = user?.role === 'administrador';

  const coursesQuery = useMemoFirebase(() => {
    return query(collection(db, 'courses'));
  }, [db]);

  const { data: courses, isLoading } = useCollection(coursesQuery);

  const professorsQuery = useMemoFirebase(() => {
    return query(collection(db, 'userProfiles'));
  }, [db]);

  const { data: professors } = useCollection(professorsQuery);
  const activeProfessors = professors?.filter(p => p.role === 'professor') || [];

  const filteredClasses = courses?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.gradeLevel || !newCourse.professorId) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome, nível e professor."
      });
      return;
    }

    setLoading(true);
    try {
      const colRef = collection(db, 'courses');
      const docData = {
        ...newCourse,
        studentIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      addDocumentNonBlocking(colRef, docData);

      toast({
        title: "Turma Criada",
        description: `A turma ${newCourse.name} foi adicionada com sucesso.`,
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
      
      setIsDialogOpen(false);
      setNewCourse({
        name: '',
        description: '',
        year: new Date().getFullYear().toString(),
        gradeLevel: '',
        professorId: '',
      });
    } catch (error) {
      console.error("Erro ao criar turma:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Turmas</h1>
            <p className="text-muted-foreground">Gerencie as classes e atribuições da instituição.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar turma..." 
                className="pl-9 w-64 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-md h-11 px-6">
                    <Plus className="h-5 w-5" />
                    Nova Turma
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#2E7D32]">Cadastrar Nova Turma</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCourse} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Turma</Label>
                      <Input 
                        id="name" 
                        placeholder="Ex: 9º Ano A - Matemática" 
                        value={newCourse.name}
                        onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Nível/Série</Label>
                        <Input 
                          id="gradeLevel" 
                          placeholder="Ex: 9º Ano" 
                          value={newCourse.gradeLevel}
                          onChange={e => setNewCourse({...newCourse, gradeLevel: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Ano Letivo</Label>
                        <Input 
                          id="year" 
                          value={newCourse.year}
                          onChange={e => setNewCourse({...newCourse, year: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professor">Professor Responsável</Label>
                      <Select 
                        value={newCourse.professorId} 
                        onValueChange={val => setNewCourse({...newCourse, professorId: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o professor" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeProfessors.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição (Opcional)</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Detalhes sobre a disciplina ou turma..." 
                        value={newCourse.description}
                        onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#4CAF50] hover:bg-[#43a047] w-full"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Turma"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#4CAF50] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map(c => {
              const profName = professors?.find(p => p.id === c.professorId)?.name || 'Não atribuído';
              const studentCount = c.studentIds?.length || 0;
              
              return (
                <Card key={c.id} className="border-none shadow-md overflow-hidden group hover:ring-2 hover:ring-[#4CAF50] transition-all">
                  <div className="h-2 bg-[#4CAF50]" />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9] border-none">
                        {c.gradeLevel}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-xl mt-2 group-hover:text-[#2E7D32] transition-colors">{c.name}</CardTitle>
                    <CardDescription>Escola JAF - {c.year}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>{studentCount} Alunos Matriculados</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Professor: {profName}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-xs h-9 gap-1 hover:bg-[#E8F5E9] hover:text-[#2E7D32]">
                        <FileText className="h-3 w-3" />
                        Relatórios
                      </Button>
                      <Button variant="outline" className="text-xs h-9 gap-1 hover:bg-[#E8F5E9] hover:text-[#2E7D32]">
                        <UserPlus className="h-3 w-3" />
                        Matricular
                      </Button>
                    </div>

                    <Button className="w-full bg-[#4CAF50] hover:bg-[#43a047] h-10 shadow-sm">
                      Acessar Diário de Classe
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {filteredClasses.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-500">Nenhuma turma encontrada</h3>
                <p className="text-muted-foreground">Crie uma nova turma ou ajuste sua busca.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
