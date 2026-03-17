
"use client";

import { useState, useEffect, Suspense } from 'react';
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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useAuth } from '@/lib/auth-store';
import { collection, query, where, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Users, Save, CalendarDays, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function AttendanceContent() {
  const db = useFirestore();
  const searchParams = useSearchParams();
  const classIdFromUrl = searchParams.get('classId');
  const { user: firebaseUser, isUserLoading: authLoading } = useUser();
  const { user: appUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [absences, setAbsences] = useState<Record<string, string>>({});

  const isReadOnly = appUser?.role !== 'administrador';

  const classesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses'));
  }, [db]);
  
  const { data: classes, isLoading: loadingClasses } = useCollection(classesQuery);

  useEffect(() => {
    if (classIdFromUrl) {
      setSelectedClassId(classIdFromUrl);
    } else if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, classIdFromUrl, selectedClassId]);

  const studentsQuery = useMemoFirebase(() => {
    if (!selectedClassId || !db) return null;
    return query(collection(db, 'students'), where('courseIds', 'array-contains', selectedClassId));
  }, [db, selectedClassId]);

  const { data: students, isLoading: loadingStudents } = useCollection(studentsQuery);

  const attendanceQuery = useMemoFirebase(() => {
    if (!selectedClassId || !selectedMonth || !db) return null;
    return query(
      collection(db, 'attendanceRecords'), 
      where('courseId', '==', selectedClassId)
    );
  }, [db, selectedClassId, selectedMonth]);

  const { data: existingAttendance } = useCollection(attendanceQuery);

  useEffect(() => {
    if (existingAttendance && students) {
      const newState: Record<string, string> = {};
      const currentYear = new Date().getFullYear();
      
      existingAttendance.forEach(record => {
        if (record.id && record.id.includes(`-${selectedMonth}-${currentYear}`)) {
          const match = record.notes?.match(/:\s(\d+)/);
          if (match) {
            newState[record.studentId] = match[1];
          }
        }
      });
      setAbsences(newState);
    }
  }, [existingAttendance, students, selectedMonth]);

  const handleAbsenceChange = (studentId: string, value: string) => {
    if (isReadOnly) return;
    if (value === '' || /^\d+$/.test(value)) {
      setAbsences(prev => ({ ...prev, [studentId]: value }));
    }
  };

  const handleSave = () => {
    if (isReadOnly || !firebaseUser || !selectedClassId || !db) return;

    const currentYear = new Date().getFullYear();

    students?.forEach(student => {
      const absenceCount = absences[student.id] || '0';
      const attendanceId = `${student.id}-${selectedMonth}-${currentYear}`;
      const docRef = doc(db, 'attendanceRecords', attendanceId);

      setDocumentNonBlocking(docRef, {
        id: attendanceId,
        studentId: student.id,
        courseId: selectedClassId,
        date: new Date().toISOString().split('T')[0],
        status: parseInt(absenceCount) > 0 ? 'Ausente' : 'Presente',
        notes: `Total de faltas no mês de ${selectedMonth}: ${absenceCount}`,
        recordedByUserId: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    toast({
      title: "Registro de Faltas Salvo",
      description: `As faltas de ${selectedMonth} foram atualizadas com sucesso.`,
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  if (authLoading || (loadingClasses && !classes)) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#4CAF50]" /></div>;
  }

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Frequência Mensal</h1>
            <p className="text-muted-foreground">
              {isReadOnly 
                ? "Visualizando registro oficial de faltas." 
                : "Controle de faltas mensal exclusivo para administração."}
            </p>
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
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isReadOnly && (
              <Button onClick={handleSave} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-sm">
                <Save className="h-4 w-4" />
                Salvar Registro
              </Button>
            )}
          </div>
        </header>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-[#4CAF50]" />
              {classes?.find(c => c.id === selectedClassId)?.name || "Turma"} - Faltas em {selectedMonth}
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingStudents ? (
              <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#4CAF50]" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-20 text-center">Nº</TableHead>
                    <TableHead>Nome do Aluno</TableHead>
                    <TableHead className="w-48 text-center">Total de Faltas</TableHead>
                    <TableHead className="w-32 text-center">Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student, index) => {
                    const numAbsences = parseInt(absences[student.id] || '0');
                    const situation = numAbsences > 10 ? 'Atenção' : 'Regular';
                    
                    return (
                      <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-center font-mono text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-center">
                          <Input 
                            type="text"
                            inputMode="numeric"
                            value={absences[student.id] || '0'}
                            onChange={(e) => handleAbsenceChange(student.id, e.target.value)}
                            disabled={isReadOnly}
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
            )}
            {students?.length === 0 && !loadingStudents && (
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

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#4CAF50]" /></div>}>
      <AttendanceContent />
    </Suspense>
  );
}
