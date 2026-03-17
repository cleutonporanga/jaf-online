
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockEvents, mockWeeklySchedule } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return mockEvents.filter(event => event.date === dateStr);
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Calendário Escolar</h1>
            <p className="text-muted-foreground">Acompanhe e gerencie os eventos da instituição.</p>
          </div>
          <Button className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-md h-11 px-6">
            <Plus className="h-5 w-5" />
            Novo Evento
          </Button>
        </header>

        <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between py-6 px-8 border-b">
            <CardTitle className="text-2xl font-bold text-[#2E7D32] capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevMonth}
                className="border-emerald-200 text-[#2E7D32] hover:bg-emerald-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentMonth(new Date())}
                className="border-emerald-200 text-[#2E7D32] hover:bg-emerald-50 px-4"
              >
                Hoje
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
                className="border-emerald-200 text-[#2E7D32] hover:bg-emerald-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Dias da Semana */}
            <div className="grid grid-cols-7 bg-emerald-50/50 border-b">
              {weekDays.map((day) => (
                <div 
                  key={day} 
                  className="py-3 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grade de Dias */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "min-h-[120px] p-2 border-r border-b last:border-r-0 transition-colors relative group hover:bg-emerald-50/30",
                      !isCurrentMonth && "bg-gray-50/50 text-gray-400"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full",
                        isToday ? "bg-[#4CAF50] text-white" : "text-gray-700",
                        !isCurrentMonth && "text-gray-300"
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div 
                          key={event.id}
                          className={cn(
                            "text-[10px] p-1.5 rounded-md border leading-tight truncate font-medium",
                            event.type === 'holiday' 
                              ? "bg-orange-50 border-orange-200 text-orange-700" 
                              : event.type === 'meeting' 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                          )}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legenda */}
        <div className="flex flex-wrap gap-6 p-4 bg-white rounded-xl shadow-sm border text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-gray-600 font-medium">Feriados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-gray-600 font-medium">Reuniões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-gray-600 font-medium">Prazos e Outros</span>
          </div>
        </div>

        {/* Horário Escolar Semanal */}
        <div className="space-y-6">
          <div className="border-l-4 border-[#4CAF50] pl-4">
            <h2 className="text-2xl font-bold text-[#2E7D32]">Horário Escolar Semanal</h2>
            <p className="text-muted-foreground">Confira a programação completa de aulas e professores.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {mockWeeklySchedule.map((dayPlan) => (
              <Card key={dayPlan.day} className="border-none shadow-md overflow-hidden bg-white">
                <div className="bg-[#E8F5E9] p-3 border-b">
                  <h3 className="text-sm font-bold text-[#2E7D32] text-center">{dayPlan.day}</h3>
                </div>
                <CardContent className="p-3 space-y-4">
                  {dayPlan.classes.map((item, idx) => (
                    <div key={idx} className="space-y-1 pb-3 border-b last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-1.5 text-[#4CAF50]">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.time}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 leading-tight">{item.subject}</p>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="text-[10px] font-medium">{item.teacher}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
