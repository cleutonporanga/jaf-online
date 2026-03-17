
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { useAuth } from '@/lib/auth-store';
import { collection, query, where, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Users, Save, PieChart, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import { Pie, PieChart as RePieChart, Cell, ResponsiveContainer } from 'recharts';

export default function MeetingsPage() {
  const db = useFirestore();
  const { user: firebaseUser, isUserLoading: authLoading } = useUser();
  const { user: appUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  const isReadOnly = appUser?.role !== 'administrador';
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const classesQuery = useMemoFirebase(() => {
    if (!db || !firebaseUser || !appUser) return null;
    if (appUser.role === 'administrador' || appUser.role === 'aluno') {
      return query(collection(db, 'courses'));
    }
    return query(collection(db, 'courses'), where('professorId', '==', firebaseUser.uid));
  }, [db, firebaseUser, appUser]);

  const { data: classes, isLoading: loadingClasses } = useCollection(classesQuery);

  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const studentsQuery = useMemoFirebase(() => {
    if (!db || !firebaseUser || !selectedClassId) return null;
    return query(collection(db, 'students'), where('courseIds', 'array-contains', selectedClassId));
  }, [db, firebaseUser, selectedClassId]);

  const { data: students, isLoading: loadingStudents } = useCollection(studentsQuery);

  const [attendance, setAttendance] = useState<Record<string, { present: boolean, observation: string }>>({});

  const meetingRecordsQuery = useMemoFirebase(() => {
    if (!db || !selectedClassId) return null;
    return query(collection(db, 'meetingAttendance'), where('courseId', '==', selectedClassId), where('date', '==', today));
  }, [db, selectedClassId, today]);

  const { data: existingRecords } = useCollection(meetingRecordsQuery);

  useEffect(() => {
    if (existingRecords) {
      const newState: Record<string, { present: boolean, observation: string }> = {};
      existingRecords.forEach(record => {
        newState[record.studentId] = {
          present: record.present,
          observation: record.observation || ''
        };
      });
      setAttendance(newState);
    }
  }, [existingRecords]);

  const handleTogglePresence = (studentId: string) => {
    if (isReadOnly) return;
    setAttendance(prev => {
      const current = prev[studentId] || { present: false, observation: '' };
      return {
        ...prev,
        [studentId]: { ...current, present: !current.present }
      };
    });
  };

  const handleObservationChange = (studentId: string, value: string) => {
    if (isReadOnly) return;
    setAttendance(prev => {
      const current = prev[studentId] || { present: false, observation: '' };
      return {
        ...prev,
        [studentId]: { ...current, observation: value }
      };
    });
  };

  const stats = useMemo(() => {
    if (!students) return [{ name: 'Presente', value: 0, fill: '#4CAF50' }, { name: 'Ausente', value: 0, fill: '#E0E0E0' }];
    const presentCount = students.filter(s => attendance[s.id]?.present).length;
    const absentCount = students.length - presentCount;
    return [
      { name: 'Presente', value: presentCount, fill: '#4CAF50' },
      { name: 'Ausente', value: absentCount, fill: '#E0E0E0' }
    ];
  }, [students, attendance]);

  const handleSave = () => {
    if (isReadOnly || !firebaseUser || !selectedClassId || !db) return;

    students?.forEach(student => {
      const record = attendance[student.id] || { present: false, observation: '' };
      const recordId = `${student.id}-${selectedClassId}-${today}`;
      const docRef = doc(db, 'meetingAttendance', recordId);

      setDocumentNonBlocking(docRef, {
        id: recordId,
        studentId: student.id,
        courseId: selectedClassId,
        date: today,
        present: record.present ?? false,
        observation: record.observation ?? '',
        recordedByUserId: firebaseUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    toast({
      title: "Presenças Registradas",
      description: "A participação dos pais na reunião foi salva com sucesso.",
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  const chartConfig = {
    present: { label: "Presente", color: "#4CAF50" },
    absent: { label: "Ausente", color: "#E0E0E0" },
  };

  if (authLoading || (loadingClasses && !classes)) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-[#4CAF50]" /></div>;
  }

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Reunião de Pais</h1>
            <p className="text-muted-foreground">
              {isReadOnly ? "Visualizando participação dos responsáveis." : "Registre a presença e acompanhe a participação dos responsáveis."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</SelectItem>
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

        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">Apenas administradores podem registrar a presença de pais.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-[#4CAF50]" />
                Lista de Presença - {classes?.find(c => c.id === selectedClassId)?.name || "Turma"}
              </CardTitle>
              <CardDescription>Participação dos pais na reunião de hoje ({new Date().toLocaleDateString('pt-BR')}).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingStudents ? (
                <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#4CAF50]" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-20 text-center">Nº</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead className="w-32 text-center">Pai Presente</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students?.map((student, index) => (
                      <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-center font-mono text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={attendance[student.id]?.present || false}
                              onCheckedChange={() => handleTogglePresence(student.id)}
                              disabled={isReadOnly}
                              className="border-[#4CAF50] data-[state=checked]:bg-[#4CAF50]"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input 
                            placeholder="Ex: Participou ativamente"
                            value={attendance[student.id]?.observation || ''}
                            onChange={(e) => handleObservationChange(student.id, e.target.value)}
                            disabled={isReadOnly}
                            className="h-8 text-xs border-emerald-100 focus:border-emerald-300"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
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

          <div className="space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#2E7D32]">
                  <PieChart className="h-5 w-5 text-[#4CAF50]" />
                  Participação da Turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={stats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#2E7D32]">{stats[0].value}</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-700">Presentes</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-600">{stats[1].value}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-500">Ausentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-[#2E7D32] text-white">
              <CardHeader>
                <CardTitle className="text-lg">Resumo de Engajamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm opacity-90">
                  A participação dos pais nesta turma hoje é de 
                  <span className="font-bold ml-1">
                    {students?.length ? ((stats[0].value / students.length) * 100).toFixed(0) : 0}%
                  </span>.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  {stats[0].value >= (students?.length || 0) / 2 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Bom engajamento familiar.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-orange-400" />
                      <span>Baixo engajamento identificado.</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
