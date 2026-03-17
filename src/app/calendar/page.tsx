
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
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Find events for the selected day
  const selectedDateStr = date ? date.toISOString().split('T')[0] : '';
  const dayEvents = mockEvents.filter(e => e.date === selectedDateStr);

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Calendário Escolar</h1>
            <p className="text-muted-foreground">Acompanhe feriados, prazos e eventos.</p>
          </div>
          <Button className="bg-[#4CAF50] hover:bg-[#43a047] gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none w-full"
                classNames={{
                  day_selected: "bg-[#4CAF50] text-white hover:bg-[#4CAF50] focus:bg-[#4CAF50]",
                  day_today: "bg-emerald-50 text-[#2E7D32] font-bold",
                }}
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Eventos do Dia</CardTitle>
                <Badge variant="outline" className="text-[#2E7D32] border-[#4CAF50]">
                  {date?.toLocaleDateString('pt-BR')}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                {dayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {dayEvents.map(event => (
                      <div key={event.id} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${event.type === 'holiday' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{event.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>O dia todo</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>Campus Principal</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">Ver Detalhes</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum evento programado para este dia.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-white border-b">
                <CardTitle className="text-lg">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-400" />
                  <span className="text-xs font-medium">Feriado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-400" />
                  <span className="text-xs font-medium">Reunião</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="text-xs font-medium">Prazo Final</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#4CAF50]" />
                  <span className="text-xs font-medium">Evento Geral</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
