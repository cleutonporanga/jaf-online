
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  UserPlus, 
  Loader2,
  Trash2,
  Calendar,
  Fingerprint,
  Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-store';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentsPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for new student
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    enrollmentNumber: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
  });

  const isAdmin = user?.role === 'administrador';

  const studentsQuery = useMemoFirebase(() => {
    return query(collection(db, 'students'));
  }, [db]);

  const { data: students, isLoading } = useCollection(studentsQuery);

  const filteredStudents = students?.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.enrollmentNumber) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e o número de matrícula."
      });
      return;
    }

    setLoading(true);
    try {
      const colRef = collection(db, 'students');
      const docData = {
        ...newStudent,
        courseIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      addDocumentNonBlocking(colRef, docData);

      toast({
        title: "Aluno Cadastrado",
        description: `${newStudent.firstName} foi adicionado ao sistema.`,
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
      
      setIsDialogOpen(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        enrollmentNumber: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        dateOfBirth: '',
      });
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.")) return;
    
    try {
      await deleteDoc(doc(db, 'students', studentId));
      toast({
        title: "Aluno Excluído",
        description: "O registro foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Alunos</h1>
            <p className="text-muted-foreground">Gerencie o registro geral de estudantes da JAF 2026.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar aluno..." 
                className="pl-9 w-64 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-md h-11 px-6">
                    <UserPlus className="h-5 w-5" />
                    Novo Aluno
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-[#2E7D32]">Cadastrar Novo Aluno</DialogTitle>
                    <DialogDescription>Preencha os dados básicos para o registro institucional.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStudent} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Ex: João" 
                          value={newStudent.firstName}
                          onChange={e => setNewStudent({...newStudent, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Ex: Silva" 
                          value={newStudent.lastName}
                          onChange={e => setNewStudent({...newStudent, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail (Opcional)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email"
                          placeholder="aluno@escola.com" 
                          className="pl-9"
                          value={newStudent.email}
                          onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="enrollmentNumber">Número de Matrícula (RA)</Label>
                        <div className="relative">
                          <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="enrollmentNumber" 
                            placeholder="Ex: 2024001" 
                            className="pl-9"
                            value={newStudent.enrollmentNumber}
                            onChange={e => setNewStudent({...newStudent, enrollmentNumber: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="dateOfBirth" 
                            type="date"
                            className="pl-9"
                            value={newStudent.dateOfBirth}
                            onChange={e => setNewStudent({...newStudent, dateOfBirth: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#4CAF50] hover:bg-[#43a047] w-full"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Concluir Cadastro"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4CAF50]" />
              Lista Geral de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 text-[#4CAF50] animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>RA / Matrícula</TableHead>
                      <TableHead>Nome Completo</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Nascimento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">{student.enrollmentNumber}</TableCell>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{student.email || '-'}</TableCell>
                        <TableCell className="text-sm">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('pt-BR') : '-'}</TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20">
                          <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-gray-400">Nenhum aluno encontrado</h3>
                          <p className="text-muted-foreground">Cadastre novos alunos ou ajuste sua busca.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
