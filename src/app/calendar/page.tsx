
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { mockEvents } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Plus,
  MapPin,
  Clock,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ptBR } from 'date-fns/locale';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Formata a data selecionada para comparação com os mocks (YYYY-MM-DD)
  const selectedDateStr = date ? date.toLocaleDateString('en-CA') : '';
  const dayEvents = mockEvents.filter(e => e.date === selectedDateStr);

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Calendário Escolar</h1>
            <p className="text-muted-foreground">Acompanhe feriados, prazos e eventos acadêmicos.</p>
          </div>
          <Button className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-md h-11 px-6">
            <Plus className="h-5 w-5" />
            Adicionar Evento
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lado Esquerdo: O Calendário */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  className="w-full"
                  classNames={{
                    day_selected: "bg-[#4CAF50] text-white hover:bg-[#4CAF50] focus:bg-[#4CAF50] rounded-lg",
                    day_today: "bg-emerald-50 text-[#2E7D32] font-bold border border-emerald-200 rounded-lg",
                    head_cell: "text-emerald-700 font-bold uppercase text-[10px]",
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden rounded-2xl bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800">
                  <Info className="h-4 w-4" />
                  Legenda de Cores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-3 w-3 rounded-full bg-orange-400" />
                  <span className="text-gray-600">Feriados e Recessos</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-gray-600">Reuniões Pedagógicas</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="text-gray-600">Prazos de Notas</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-3 w-3 rounded-full bg-[#4CAF50]" />
                  <span className="text-gray-600">Eventos da Comunidade</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lado Direito: Eventos do Dia e Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white min-h-[500px]">
              <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-6 px-8">
                <div>
                  <CardTitle className="text-xl text-[#2E7D32]">Eventos Agendados</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Visualize o que está acontecendo hoje</p>
                </div>
                <Badge variant="outline" className="text-[#2E7D32] border-[#4CAF50] bg-emerald-50 px-4 py-1.5 text-sm font-bold rounded-lg capitalize">
                  {date?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Badge>
              </CardHeader>
              <CardContent className="p-8">
                {dayEvents.length > 0 ? (
                  <div className="space-y-6">
                    {dayEvents.map(event => (
                      <div key={event.id} className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/20 flex items-start gap-6 group hover:border-[#4CAF50] transition-all">
                        <div className={`p-4 rounded-2xl shadow-sm ${
                          event.type === 'holiday' ? 'bg-orange-100 text-orange-600' : 
                          event.type === 'meeting' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-emerald-100 text-[#4CAF50]'
                        }`}>
                          <CalendarIcon className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#2E7D32] transition-colors">{event.title}</h3>
                            <Badge className={`${
                              event.type === 'holiday' ? 'bg-orange-500' : 'bg-[#4CAF50]'
                            }`}>
                              {event.type === 'holiday' ? 'Feriado' : event.type === 'meeting' ? 'Reunião' : 'Geral'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#4CAF50]" />
                              <span className="font-medium text-gray-700">Horário Integral</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#4CAF50]" />
                              <span className="font-medium text-gray-700">Auditório Principal</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-emerald-50 text-sm text-gray-600 leading-relaxed">
                            Evento destinado a toda a comunidade escolar. Para mais informações, consulte a coordenação pedagógica no bloco A.
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                      <CalendarIcon className="h-16 w-16 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Nenhum compromisso</h3>
                    <p className="text-muted-foreground max-w-xs mt-2">Não há eventos registrados para este dia. Aproveite o tempo para planejar suas aulas!</p>
                    <Button variant="outline" className="mt-8 border-emerald-200 text-[#2E7D32] hover:bg-emerald-50 rounded-xl">
                      Ver Próximos Eventos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
