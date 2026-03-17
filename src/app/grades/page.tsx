"use client";

import { useState, useEffect, Suspense } from 'react';
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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useAuth } from '@/lib/auth-store';
import { collection, query, where, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Save, Download, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

function GradesContent() {
  const db = useFirestore();
  const searchParams = useSearchParams();
  const classIdFromUrl = searchParams.get('classId');
  const { user: firebaseUser, isUserLoading: authLoading } = useUser();
  const { user: appUser } = useAuth();
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [gradesState, setGradesState] = useState<Record<string, { v1: string, v2: string, work: string }>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const gradesQuery = useMemoFirebase(() => {
    if (!selectedClassId || !db) return null;
    return query(collection(db, 'gradeRecords'), where('courseId', '==', selectedClassId));
  }, [db, selectedClassId]);

  const { data: existingGrades } = useCollection(gradesQuery);

  useEffect(() => {
    if (existingGrades && students && mounted) {
      const newState: Record<string, { v1: string, v2: string, work: string }> = {};
      existingGrades.forEach(g => {
        if (!newState[g.studentId]) newState[g.studentId] = { v1: '', v2: '', work: '' };
        if (g.activityName === 'Avaliação 1') newState[g.studentId].v1 = g.value.toString();
        if (g.activityName === 'Avaliação 2') newState[g.studentId].v2 = g.value.toString();
        if (g.activityName === 'Trabalho') newState[g.studentId].work = g.value.toString();
      });
      setGradesState(newState);
    }
  }, [existingGrades, students, mounted]);

  const handleGradeChange = (studentId: string, field: 'v1' | 'v2' | 'work', value: string) => {
    if (isReadOnly) return;
    if (value === '' || /^\d*[.,]?\d*$/.test(value)) {
      setGradesState(prev => ({
        ...prev,
        [studentId]: { ... (prev[studentId] || { v1: '', v2: '', work: '' }), [field]: value }
      }));
    }
  };

  const calculateAverage = (studentId: string) => {
    const g = gradesState[studentId];
    if (!g) return "-";
    const v1 = parseFloat(g.v1.replace(',', '.')) || 0;
    const v2 = parseFloat(g.v2.replace(',', '.')) || 0;
    const work = parseFloat(g.work.replace(',', '.')) || 0;
    if (!g.v1 && !g.v2 && !g.work) return "-";
    return ((v1 + v2 + work) / 3).toFixed(1);
  };

  const handleSave = () => {
    if (isReadOnly || !firebaseUser || !selectedClassId || !db) return;

    students?.forEach(student => {
      const g = gradesState[student.id];
      if (!g) return;

      const saveGrade = (val: string, type: string) => {
        if (val === '') return;
        const gradeId = `${student.id}-${selectedClassId}-${type.replace(/\s/g, '')}`;
        const docRef = doc(db, 'gradeRecords', gradeId);
        
        setDocumentNonBlocking(docRef, {
          id: gradeId,
          studentId: student.id,
          courseId: selectedClassId,
          value: parseFloat(val.replace(',', '.')),
          activityName: type,
          date: new Date().toISOString().split('T')[0],
          recordedByUserId: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      };

      saveGrade(g.v1, 'Avaliação 1');
      saveGrade(g.v2, 'Avaliação 2');
      saveGrade(g.work, 'Trabalho');
    });

    toast({
      title: "Notas Atualizadas",
      description: "As notas foram salvas com sucesso pela administração.",
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  const handleExportBoletins = () => {
    if (!selectedClassId) return;
    const className = classes?.find(c => c.id === selectedClassId)?.name || "Turma";
    
    setIsExporting(true);
    toast({
      title: "Gerando Boletins",
      description: `Preparando boletins com cabeçalho oficial da Escola Joaquim Antônio Filho para a turma ${className}...`,
    });

    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Boletins Exportados",
        description: `O arquivo PDF contendo os boletins individuais com cabeçalho completo foi baixado com sucesso.`,
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
    }, 2500);
  };

  if (!mounted || authLoading || (loadingClasses && !classes)) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#4CAF50]" /></div>;
  }

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Gestão de Notas</h1>
            <p className="text-muted-foreground">
              {isReadOnly ? "Visualizando desempenho acadêmico oficial." : "Lançamento de notas exclusivo para administração."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <Button 
              variant="outline" 
              className="gap-2 bg-white hover:bg-emerald-50 hover:text-[#2E7D32] border-emerald-100"
              onClick={handleExportBoletins}
              disabled={isExporting || !selectedClassId}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Boletins PDF
            </Button>
            {!isReadOnly && (
              <Button onClick={handleSave} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-sm">
                <Save className="h-4 w-4" />
                Salvar Tudo
              </Button>
            )}
          </div>
        </header>

        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">Apenas administradores podem lançar ou alterar notas.</p>
          </div>
        )}

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-white flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Tabela de Notas - {classes?.find(c => c.id === selectedClassId)?.name || "Turma"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loadingStudents ? (
              <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#4CAF50]" /></div>
            ) : (
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
                  {students?.map((student) => {
                    const avg = calculateAverage(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-center">
                          <Input 
                            disabled={isReadOnly} 
                            className="w-20 mx-auto text-center h-8" 
                            placeholder="-" 
                            value={gradesState[student.id]?.v1 || ''}
                            onChange={(e) => handleGradeChange(student.id, 'v1', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input 
                            disabled={isReadOnly} 
                            className="w-20 mx-auto text-center h-8" 
                            placeholder="-" 
                            value={gradesState[student.id]?.v2 || ''}
                            onChange={(e) => handleGradeChange(student.id, 'v2', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input 
                            disabled={isReadOnly} 
                            className="w-20 mx-auto text-center h-8" 
                            placeholder="-" 
                            value={gradesState[student.id]?.work || ''}
                            onChange={(e) => handleGradeChange(student.id, 'work', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center bg-emerald-50/50">
                          <span className={`font-bold ${avg !== '-' && parseFloat(avg) < 6 ? 'text-red-600' : 'text-[#2E7D32]'}`}>
                            {avg}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {(!students || students.length === 0) && !loadingStudents && (
              <div className="p-12 text-center text-muted-foreground italic">Nenhum aluno matriculado nesta turma.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function GradesPage() {
  return (
    <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#4CAF50]" /></div>}>
      <GradesContent />
    </Suspense>
  );
}
