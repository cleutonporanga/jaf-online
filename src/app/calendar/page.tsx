"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Info,
  Clock,
  MapPin,
  Tag
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function CalendarPage() {
  const db = useFirestore();
  const { user: appUser } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Evento',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const isAdmin = appUser?.role === 'administrador';

  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'schoolEvents'));
  }, [db]);

  const { data: events, isLoading } = useCollection(eventsQuery);

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
    return events?.filter(event => event.startDate?.startsWith(dateStr)) || [];
  };

  const handleDayClick = (day: Date, dayEvents: any[]) => {
    if (dayEvents.length > 0) {
      setSelectedDate(day);
      setSelectedDayEvents(dayEvents);
      setIsViewDialogOpen(true);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    setLoading(true);
    try {
      const colRef = collection(db, 'schoolEvents');
      await addDocumentNonBlocking(colRef, {
        title: newEvent.title,
        type: newEvent.type,
        description: newEvent.description,
        startDate: new Date(newEvent.date).toISOString(),
        endDate: new Date(newEvent.date).toISOString(),
        createdByUserId: appUser?.id || 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Evento Criado",
        description: "O calendário oficial foi atualizado.",
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
      setIsCreateDialogOpen(false);
      setNewEvent({ title: '', type: 'Evento', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Feriado': return "bg-red-500";
      case 'Reunião': return "bg-emerald-500";
      case 'Evento': return "bg-blue-500";
      case 'Aniversário': return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Feriado': return "bg-red-50 border-red-200 text-red-700";
      case 'Reunião': return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case 'Evento': return "bg-blue-50 border-blue-200 text-blue-700";
      case 'Aniversário': return "bg-orange-50 border-orange-200 text-orange-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Calendário Escolar</h1>
            <p className="text-muted-foreground">Acompanhe os prazos e eventos oficiais da instituição.</p>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 rounded-xl shadow-md h-11 px-6">
                  <Plus className="h-5 w-5" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-[#2E7D32]">Adicionar Evento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Título do Evento</Label>
                    <Input 
                      placeholder="Ex: Conselho de Classe"
                      value={newEvent.title}
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input 
                        type="date"
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={newEvent.type} onValueChange={v => setNewEvent({...newEvent, type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Feriado">Feriado</SelectItem>
                          <SelectItem value="Reunião">Reunião</SelectItem>
                          <SelectItem value="Evento">Evento</SelectItem>
                          <SelectItem value="Aniversário">Aniversário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (Opcional)</Label>
                    <Input 
                      placeholder="Breve descrição do evento..."
                      value={newEvent.description}
                      onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading} className="w-full bg-[#4CAF50]">
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Publicar no Calendário"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
            <div className="grid grid-cols-7 bg-emerald-50/50 border-b">
              {weekDays.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-[#4CAF50] animate-spin" />
                </div>
              )}
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const hasEvents = dayEvents.length > 0;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDayClick(day, dayEvents)}
                    className={cn(
                      "min-h-[120px] p-2 border-r border-b last:border-r-0 transition-all relative group",
                      !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                      hasEvents && "cursor-pointer hover:bg-emerald-50/30",
                      !hasEvents && isCurrentMonth && "hover:bg-gray-50/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn(
                        "flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full",
                        isToday ? "bg-[#4CAF50] text-white" : "text-gray-700",
                        !isCurrentMonth && "text-gray-300"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {hasEvents && (
                        <Info className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.map((event: any) => (
                        <div 
                          key={event.id}
                          className={cn(
                            "text-[10px] p-1.5 rounded-md border leading-tight truncate font-bold",
                            getTypeStyles(event.type)
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

        <div className="flex flex-wrap gap-6 p-6 bg-white rounded-2xl shadow-sm border text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 font-bold uppercase tracking-tight">Feriados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600 font-bold uppercase tracking-tight">Reuniões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 font-bold uppercase tracking-tight">Eventos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600 font-bold uppercase tracking-tight">Aniversários</span>
          </div>
        </div>

        {/* Diálogo de Detalhes do Evento */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[#2E7D32] flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre os compromissos deste dia.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                {selectedDayEvents.map((event) => (
                  <Card key={event.id} className="border-l-4 shadow-sm" style={{ borderLeftColor: `var(--${event.type === 'Feriado' ? 'red' : event.type === 'Reunião' ? 'emerald' : event.type === 'Evento' ? 'blue' : 'orange'}-500)` }}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 leading-tight">{event.title}</h3>
                        <Badge className={cn("text-[10px] uppercase font-bold", getTypeStyles(event.type))}>
                          {event.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span>Categoria: {event.type}</span>
                        </div>
                        {event.startDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Horário: {format(new Date(event.startDate), "HH:mm")}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>Local: {event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <div className="pt-2 border-t mt-2">
                          <p className="text-xs text-gray-600 leading-relaxed italic">
                            {event.description}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} className="w-full bg-[#4CAF50] hover:bg-[#43a047]">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
