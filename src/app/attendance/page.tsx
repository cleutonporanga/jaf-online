
"use client";

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { mockClasses, mockStudents } from '@/lib/data';
import { Users, Save, CalendarDays, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const students = mockStudents.filter(s => s.classId === selectedClass);
  
  // Estado para armazenar as faltas (ID do aluno -> quantidade)
  const [absences, setAbsences] = useState<Record<string, string>>(
    students.reduce((acc, s) => ({ ...acc, [s.id]: '0' }), {})
  );
  
  const { toast } = useToast();

  const handleAbsenceChange = (studentId: string, value: string) => {
    // Apenas números
    if (value === '' || /^\d+$/.test(value)) {
      setAbsences(prev => ({ ...prev, [studentId]: value }));
    }
  };

  const handleSave = () => {
    toast({
      title: "Registro de Faltas Salvo",
      description: `As faltas do mês de ${selectedMonth} para a turma ${mockClasses.find(c => c.id === selectedClass)?.name} foram atualizadas.`,
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Frequência Mensal</h1>
            <p className="text-muted-foreground">Registre o total de faltas dos alunos no mês selecionado.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 bg-white">
                <CalendarDays className="h-4 w-4 mr-2 text-[#4CAF50]" />
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Salvar Registro
            </Button>
          </div>
        </header>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4CAF50]" />
              {mockClasses.find(c => c.id === selectedClass)?.name} - Faltas em {selectedMonth}
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-20 text-center">Nº</TableHead>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead className="w-48 text-center">Quantidade de Faltas</TableHead>
                  <TableHead className="w-32 text-center">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const numAbsences = parseInt(absences[student.id] || '0');
                  const situation = numAbsences > 10 ? 'Atenção' : 'Regular';
                  
                  return (
                    <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center font-mono text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        <Input 
                          type="text"
                          inputMode="numeric"
                          value={absences[student.id] || '0'}
                          onChange={(e) => handleAbsenceChange(student.id, e.target.value)}
                          className="w-24 mx-auto text-center font-bold"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {situation === 'Regular' ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">REGULAR</span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">ALERTA</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
