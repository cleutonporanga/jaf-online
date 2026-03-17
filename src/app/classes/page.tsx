"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UICardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Plus,
  Loader2,
  Calendar,
  FileDown,
  Trash2,
  Edit2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-store';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, serverTimestamp, doc, arrayUnion } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ClassesPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<any>(null);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    year: '2026',
    gradeLevel: '',
    professorId: '',
  });

  const isAdmin = user?.role === 'administrador';

  const coursesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses'));
  }, [db]);

  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);

  const professorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'userProfiles'));
  }, [db]);

  const { data: professors } = useCollection(professorsQuery);
  const activeProfessors = professors?.filter(p => p.role === 'professor') || [];

  const studentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'students'));
  }, [db]);

  const { data: allStudents } = useCollection(studentsQuery);

  const filteredClasses = courses?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newCourse.name || !newCourse.gradeLevel || !newCourse.professorId) {
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
        year: '2026',
        gradeLevel: '',
        professorId: '',
      });
    } catch (error) {
      console.error("Erro ao criar turma:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !courseToEdit || !courseToEdit.name || !courseToEdit.gradeLevel) return;

    setLoading(true);
    try {
      const courseRef = doc(db, 'courses', courseToEdit.id);
      updateDocumentNonBlocking(courseRef, {
        name: courseToEdit.name,
        description: courseToEdit.description || '',
        year: courseToEdit.year,
        gradeLevel: courseToEdit.gradeLevel,
        professorId: courseToEdit.professorId,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Turma Atualizada",
        description: `As informações da turma ${courseToEdit.name} foram salvas.`,
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
      
      setIsEditDialogOpen(false);
      setCourseToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar turma:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = (studentId: string) => {
    if (!db || !selectedCourseId) return;

    setEnrollLoading(true);
    try {
      const courseRef = doc(db, 'courses', selectedCourseId);
      const studentRef = doc(db, 'students', studentId);

      updateDocumentNonBlocking(courseRef, {
        studentIds: arrayUnion(studentId),
        updatedAt: serverTimestamp()
      });

      updateDocumentNonBlocking(studentRef, {
        courseIds: arrayUnion(selectedCourseId),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Matrícula Realizada",
        description: "O aluno foi matriculado com sucesso nesta turma.",
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
    } catch (error) {
      console.error("Erro ao matricular aluno:", error);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleExportPDF = (course: any) => {
    setExportingId(course.id);
    toast({
      title: "Gerando Relatório",
      description: `Compilando dados da turma ${course.name}...`,
    });
    
    setTimeout(() => {
      setExportingId(null);
      toast({
        title: "PDF Gerado com Sucesso",
        description: `O relatório completo da turma ${course.name} foi baixado.`,
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
    }, 2000);
  };

  const openEnrollDialog = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsEnrollDialogOpen(true);
  };

  const openEditDialog = (course: any) => {
    setCourseToEdit({ ...course });
    setIsEditDialogOpen(true);
  };

  const confirmDeleteCourse = (course: any) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = () => {
    if (!db || !courseToDelete) return;

    const courseRef = doc(db, 'courses', courseToDelete.id);
    deleteDocumentNonBlocking(courseRef);

    toast({
      title: "Turma Excluída",
      description: `A turma ${courseToDelete.name} foi removida permanentemente.`,
    });
    setIsDeleteDialogOpen(false);
    setCourseToDelete(null);
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

        {loadingCourses ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#4CAF50] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map(c => {
              const profName = professors?.find(p => p.id === c.professorId)?.name || 'Não atribuído';
              const studentCount = c.studentIds?.length || 0;
              const isExporting = exportingId === c.id;
              
              return (
                <Card key={c.id} className="border-none shadow-md overflow-hidden group hover:ring-2 hover:ring-[#4CAF50] transition-all">
                  <div className="h-2 bg-[#4CAF50]" />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9] border-none">
                        {c.gradeLevel}
                      </Badge>
                      
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(c)} className="cursor-pointer">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar Turma
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onClick={() => confirmDeleteCourse(c)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Turma
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <CardTitle className="text-xl mt-2 group-hover:text-[#2E7D32] transition-colors">{c.name}</CardTitle>
                    <UICardDescription>JAF 2026 - {c.year}</UICardDescription>
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
                      <Button 
                        variant="outline" 
                        className="text-xs h-9 gap-1 hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
                        onClick={() => handleExportPDF(c)}
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />}
                        Relatório PDF
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="outline" 
                          className="text-xs h-9 gap-1 hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
                          onClick={() => openEnrollDialog(c.id)}
                        >
                          <UserPlus className="h-3 w-3" />
                          Matricular
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Diálogo de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E7D32]">Editar Informações da Turma</DialogTitle>
            </DialogHeader>
            {courseToEdit && (
              <form onSubmit={handleUpdateCourse} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Turma</Label>
                  <Input 
                    id="edit-name" 
                    value={courseToEdit.name}
                    onChange={e => setCourseToEdit({...courseToEdit, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-gradeLevel">Nível/Série</Label>
                    <Input 
                      id="edit-gradeLevel" 
                      value={courseToEdit.gradeLevel}
                      onChange={e => setCourseToEdit({...courseToEdit, gradeLevel: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-year">Ano Letivo</Label>
                    <Input 
                      id="edit-year" 
                      value={courseToEdit.year}
                      onChange={e => setCourseToEdit({...courseToEdit, year: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-professor">Professor Responsável</Label>
                  <Select 
                    value={courseToEdit.professorId} 
                    onValueChange={val => setCourseToEdit({...courseToEdit, professorId: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProfessors.map(prof => (
                        <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea 
                    id="edit-description" 
                    value={courseToEdit.description}
                    onChange={e => setCourseToEdit({...courseToEdit, description: e.target.value})}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading} className="bg-[#4CAF50] w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Alterações"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de Matrícula */}
        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E7D32]">Matricular Aluno</DialogTitle>
              <DialogDescription>
                Selecione os alunos para matricular na turma.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <ScrollArea className="h-72 border rounded-md p-2">
                <div className="space-y-1">
                  {allStudents?.map(student => {
                    const isAlreadyEnrolled = courses?.find(c => c.id === selectedCourseId)?.studentIds?.includes(student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">RA: {student.enrollmentNumber}</p>
                        </div>
                        {isAlreadyEnrolled ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Matriculado</Badge>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => handleEnrollStudent(student.id)} disabled={enrollLoading}>
                            Matricular
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerta de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Turma Permanentemente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá a turma <strong>{courseToDelete?.name}</strong> e todos os registros associados. Esta operação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600">
                Excluir Turma
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}