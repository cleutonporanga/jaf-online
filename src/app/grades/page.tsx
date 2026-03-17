
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { mockClasses, mockStudents, mockGrades } from '@/lib/data';
import { Calculator, Save, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GradesPage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const students = mockStudents.filter(s => s.classId === selectedClass);
  const { toast } = useToast();

  const getGrade = (studentId: string, assignment: string) => {
    return mockGrades.find(g => g.studentId === studentId && g.assignment === assignment)?.score || '';
  };

  const handleSave = () => {
    toast({
      title: "Notas Atualizadas",
      description: "As alterações foram salvas com sucesso no sistema.",
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Gestão de Notas</h1>
            <p className="text-muted-foreground">Insira e acompanhe o desempenho acadêmico.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {mockClasses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-white">
              <Download className="h-4 w-4" />
              Boletins
            </Button>
            <Button onClick={handleSave} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2">
              <Save className="h-4 w-4" />
              Salvar Tudo
            </Button>
          </div>
        </header>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-white flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Tabela de Notas - {mockClasses.find(c => c.id === selectedClass)?.name}</CardTitle>
            <Button size="sm" variant="ghost" className="text-[#2E7D32] hover:bg-emerald-50 gap-1">
              <Plus className="h-4 w-4" />
              Nova Avaliação
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[300px]">Nome do Aluno</TableHead>
                  <TableHead className="text-center">Avaliação 1</TableHead>
                  <TableHead className="text-center">Avaliação 2</TableHead>
                  <TableHead className="text-center">Trabalho</TableHead>
                  <TableHead className="text-center bg-emerald-50 text-[#2E7D32] font-bold">Média Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const p1 = getGrade(student.id, 'Prova 1');
                  const p2 = ''; // mock
                  const t1 = getGrade(student.id, 'Trabalho de Campo');
                  const media = p1 && t1 ? ((Number(p1) + Number(t1)) / 2).toFixed(1) : '-';

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">
                        <Input defaultValue={p1} className="w-20 mx-auto text-center h-8" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input defaultValue={p2} className="w-20 mx-auto text-center h-8" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input defaultValue={t1} className="w-20 mx-auto text-center h-8" />
                      </TableCell>
                      <TableCell className="text-center bg-emerald-50/50">
                        <span className={`font-bold ${Number(media) >= 6 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {media}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#4CAF50]" />
                Distribuição de Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-4 justify-center pb-4">
                <div className="w-12 bg-red-400 rounded-t-lg" style={{ height: '20%' }} />
                <div className="w-12 bg-amber-400 rounded-t-lg" style={{ height: '35%' }} />
                <div className="w-12 bg-[#4CAF50] rounded-t-lg" style={{ height: '75%' }} />
                <div className="w-12 bg-emerald-600 rounded-t-lg" style={{ height: '45%' }} />
              </div>
              <div className="flex justify-center gap-8 text-xs font-medium text-muted-foreground">
                <span>0-5</span>
                <span>5-7</span>
                <span>7-9</span>
                <span>9-10</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-[#2E7D32]">Resumo da Turma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Média da Turma:</span>
                <span className="text-lg font-bold text-[#2E7D32]">7.8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Acima da Média:</span>
                <span className="text-lg font-bold text-[#2E7D32]">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Alunos em Recuperação:</span>
                <span className="text-lg font-bold text-red-600">2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
