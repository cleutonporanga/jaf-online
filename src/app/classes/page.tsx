
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
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockClasses, mockStudents } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = mockClasses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Minhas Turmas</h1>
            <p className="text-muted-foreground">Gerencie suas classes, alunos e horários.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar turma..." 
                className="pl-9 w-64 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClasses.map(c => {
            const studentCount = mockStudents.filter(s => s.classId === c.id).length;
            return (
              <Card key={c.id} className="border-none shadow-md overflow-hidden group hover:ring-2 hover:ring-[#4CAF50] transition-all">
                <div className="h-2 bg-[#4CAF50]" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9] border-none">
                      {c.grade}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl mt-2 group-hover:text-[#2E7D32] transition-colors">{c.name}</CardTitle>
                  <CardDescription>Escola Municipal Paulo Freire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{studentCount} Alunos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Ter/Qui - 08:00</span>
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
        </div>
      </main>
    </div>
  );
}
