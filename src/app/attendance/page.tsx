
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { mockClasses, mockStudents } from '@/lib/data';
import { Calendar as CalendarIcon, Save, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const students = mockStudents.filter(s => s.classId === selectedClass);
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    students.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  const { toast } = useToast();

  const handleToggle = (studentId: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSave = () => {
    toast({
      title: "Frequência Salva!",
      description: `Registro do dia ${format(new Date(), 'dd/MM/yyyy')} concluído.`,
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Registro de Frequência</h1>
            <p className="text-muted-foreground">Lance a chamada diária para suas turmas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
              <CalendarIcon className="h-4 w-4 text-[#4CAF50]" />
              <span className="text-sm font-medium">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {mockClasses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.grade})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSave} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-sm">
              <Save className="h-4 w-4" />
              Salvar Chamada
            </Button>
          </div>
        </header>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4CAF50]" />
              Lista de Chamada - {mockClasses.find(c => c.id === selectedClass)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-20 text-center">Nº</TableHead>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead className="w-32 text-center">Presente</TableHead>
                  <TableHead className="w-32 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-center font-mono text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={attendance[student.id]} 
                        onCheckedChange={() => handleToggle(student.id)}
                        className="h-6 w-6 rounded-md border-gray-300 data-[state=checked]:bg-[#4CAF50] data-[state=checked]:border-[#4CAF50]"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {attendance[student.id] ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">PRESENTE</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">AUSENTE</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {students.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground italic">Nenhum aluno matriculado nesta turma.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
