
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  BrainCircuit, 
  RefreshCcw, 
  TrendingUp, 
  Target, 
  Loader2,
  GraduationCap
} from 'lucide-react';
import { generatePerformanceHighlights, AiPerformanceHighlightsGenerationOutput } from '@/ai/flows/ai-performance-highlights-generation';
import { mockStudents, mockGrades, mockClasses } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AIInsightsPage() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<AiPerformanceHighlightsGenerationOutput | null>(null);

  const studentsInClass = mockStudents.filter(s => s.classId === selectedClass);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const studentData = studentsInClass.map(s => ({
        id: s.id,
        name: s.name,
        grades: mockGrades.filter(g => g.studentId === s.id).map(g => ({
          assignment: g.assignment,
          score: g.score,
          maxScore: g.maxScore
        })),
        participationScore: Math.floor(Math.random() * 40) + 60
      }));

      const result = await generatePerformanceHighlights({
        studentData,
        teacherInstructions: "Foque em identificar alunos que precisam de apoio imediato e sugestões de estudos extras."
      });

      setHighlights(result);
    } catch (error) {
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
            <p className="text-muted-foreground">Análise inteligente de desempenho e participação.</p>
          </div>
          <div className="flex items-center gap-3">
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
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-lg h-11 px-6 rounded-xl"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5" />}
              Gerar Destaques Inteligentes
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <BrainCircuit className="h-16 w-16 text-[#4CAF50] animate-pulse" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
            </div>
            <h2 className="text-xl font-semibold text-[#2E7D32]">Analisando dados da turma...</h2>
            <p className="text-muted-foreground">Aguarde enquanto nossa IA identifica padrões de aprendizagem.</p>
          </div>
        ) : highlights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {highlights.highlights.map((h, i) => (
              <Card key={i} className="border-none shadow-md overflow-hidden flex flex-col">
                <div className="bg-[#E8F5E9] p-4 flex items-center gap-3 border-b">
                  <div className="bg-white p-2 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2E7D32]">{h.studentName}</h3>
                    <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Relatório Individual</p>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6 flex-1">
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-xs font-bold uppercase text-emerald-700 tracking-tight">Conquistas</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 italic">"{h.achievements}"</p>
                  </section>
                  
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-amber-600" />
                      <h4 className="text-xs font-bold uppercase text-amber-700 tracking-tight">Pontos de Melhoria</h4>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 italic">"{h.areasForImprovement}"</p>
                  </section>
                </CardContent>
                <div className="p-4 bg-gray-50 border-t">
                   <Button variant="ghost" className="w-full text-xs text-[#2E7D32] hover:bg-emerald-100 h-8 gap-2">
                     <RefreshCcw className="h-3 w-3" />
                     Regerar Análise
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <BrainCircuit className="h-10 w-10 text-[#4CAF50]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Pronto para insights?</h2>
              <p className="text-muted-foreground">
                Nossa ferramenta de IA analisa automaticamente as notas, participação e evolução dos alunos para sugerir caminhos pedagógicos personalizados.
              </p>
              <Button 
                onClick={handleGenerate} 
                className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl"
              >
                Começar Análise da Turma
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
