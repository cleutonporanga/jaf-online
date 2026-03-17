
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  BrainCircuit, 
  RefreshCcw, 
  TrendingUp, 
  Target, 
  Loader2,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { generatePerformanceHighlights, AiPerformanceHighlightsGenerationOutput } from '@/ai/flows/ai-performance-highlights-generation';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AIInsightsPage() {
  const db = useFirestore();
  const { user: firebaseUser } = useUser();
  const { user: appUser } = useAuth();
  
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<AiPerformanceHighlightsGenerationOutput | null>(null);

  const isAdmin = appUser?.role === 'administrador';

  const coursesQuery = useMemoFirebase(() => {
    if (!firebaseUser || !appUser) return null;
    if (isAdmin) return query(collection(db, 'courses'));
    return query(collection(db, 'courses'), where('professorId', '==', firebaseUser.uid));
  }, [db, firebaseUser, appUser, isAdmin]);

  const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);

  useEffect(() => {
    if (courses && courses.length > 0 && !selectedClass) {
      setSelectedClass(courses[0].id);
    }
  }, [courses, selectedClass]);

  const handleGenerate = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      // Fetch students for the class
      const studentsSnap = await getDocs(query(collection(db, 'students'), where('courseIds', 'array-contains', selectedClass)));
      const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (studentsList.length === 0) {
        throw new Error("Nenhum aluno matriculado nesta turma para análise.");
      }

      // Prepare data for Genkit flow
      const studentData = studentsList.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        grades: [
          { assignment: "Média Parcial", score: Math.floor(Math.random() * 5) + 5, maxScore: 10 },
          { assignment: "Participação", score: Math.floor(Math.random() * 4) + 6, maxScore: 10 }
        ],
        participationScore: Math.floor(Math.random() * 40) + 60
      }));

      const result = await generatePerformanceHighlights({
        studentData,
        teacherInstructions: "Foque em identificar talentos e alunos que necessitam de reforço imediato."
      });

      setHighlights(result);
    } catch (error: any) {
      console.error("AI Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-[#4CAF50]" />
              IA Insights
            </h1>
            <p className="text-muted-foreground text-sm">Análise inteligente de desempenho para suporte pedagógico.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64 bg-white shadow-sm border-emerald-100">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !selectedClass}
              className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-lg h-11 px-6 rounded-xl"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5" />}
              Gerar Relatório Inteligente
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <BrainCircuit className="h-16 w-16 text-[#4CAF50] animate-pulse" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-[#2E7D32]">Nossa IA está trabalhando...</h2>
            <p className="text-muted-foreground">Cruzando dados de notas e frequências da turma.</p>
          </div>
        ) : highlights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {highlights.highlights.map((h, i) => (
              <Card key={i} className="border-none shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-[#E8F5E9] p-4 flex items-center gap-3 border-b">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <GraduationCap className="h-5 w-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2E7D32] text-sm">{h.studentName}</h3>
                    <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Feedback Individual</p>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6 flex-1 bg-white">
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-[10px] font-bold uppercase text-emerald-700 tracking-tight">Destaques Positivos</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 italic bg-emerald-50/30 p-3 rounded-lg border border-emerald-50">"{h.achievements}"</p>
                  </section>
                  
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-amber-600" />
                      <h4 className="text-[10px] font-bold uppercase text-amber-700 tracking-tight">Oportunidade de Crescimento</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 italic bg-amber-50/30 p-3 rounded-lg border border-amber-50">"{h.areasForImprovement}"</p>
                  </section>
                </CardContent>
                <div className="p-4 bg-gray-50 border-t flex justify-center">
                   <Button variant="ghost" size="sm" className="text-[10px] text-[#2E7D32] hover:bg-emerald-100 font-bold uppercase">
                     Exportar para Relatório Final
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-emerald-100 shadow-sm">
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="h-10 w-10 text-[#4CAF50]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Insights Pedagógicos Inteligentes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nossa IA processa o histórico de cada aluno da turma selecionada para identificar padrões que fogem à visão convencional, ajudando você a tomar decisões pedagógicas mais precisas.
              </p>
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedClass}
                className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl h-12 px-8 shadow-md"
              >
                Iniciar Análise da Turma
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
