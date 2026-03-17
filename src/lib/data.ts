
export interface Class {
  id: string;
  name: string;
  grade: string;
  teacherId: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
}

export interface Grade {
  id: string;
  studentId: string;
  assignment: string;
  score: number;
  maxScore: number;
}

export interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
}

export interface DaySchedule {
  day: string;
  classes: ScheduleItem[];
}

export const mockClasses: Class[] = [
  { id: 'c1', name: 'Matemática Avançada', grade: '9º Ano', teacherId: 'u1' },
  { id: 'c2', name: 'Física I', grade: '1º Ano EM', teacherId: 'u1' },
  { id: 'c3', name: 'Química Geral', grade: '2º Ano EM', teacherId: 'u2' },
];

export const mockStudents: Student[] = [
  { id: 's1', name: 'Arthur Morgan', classId: 'c1' },
  { id: 's2', name: 'John Marston', classId: 'c1' },
  { id: 's3', name: 'Sadie Adler', classId: 'c1' },
  { id: 's4', name: 'Charles Smith', classId: 'c2' },
  { id: 's5', name: 'Abigail Roberts', classId: 'c2' },
];

export const mockGrades: Grade[] = [
  { id: 'g1', studentId: 's1', assignment: 'Prova 1', score: 85, maxScore: 100 },
  { id: 'g2', studentId: 's1', assignment: 'Trabalho de Campo', score: 90, maxScore: 100 },
  { id: 'g3', studentId: 's2', assignment: 'Prova 1', score: 45, maxScore: 100 },
  { id: 'g4', studentId: 's3', assignment: 'Prova 1', score: 95, maxScore: 100 },
];

export const mockEvents = [
  { id: 'e1', title: 'Feriado Escolar', date: '2025-05-01', type: 'holiday' },
  { id: 'e2', title: 'Reunião de Pais', date: '2025-05-15', type: 'meeting' },
  { id: 'e3', title: 'Entrega de Notas', date: '2025-05-20', type: 'deadline' },
];

export const mockWeeklySchedule: DaySchedule[] = [
  {
    day: 'Segunda-feira',
    classes: [
      { time: '07:30 - 08:20', subject: 'Matemática', teacher: 'Ana Silva' },
      { time: '08:20 - 09:10', subject: 'Física', teacher: 'Marcos Lima' },
      { time: '09:30 - 10:20', subject: 'Português', teacher: 'Carlos Oliveira' },
      { time: '10:20 - 11:10', subject: 'História', teacher: 'Beto Santos' },
    ]
  },
  {
    day: 'Terça-feira',
    classes: [
      { time: '07:30 - 08:20', subject: 'Geografia', teacher: 'Marta Rocha' },
      { time: '08:20 - 09:10', subject: 'Química', teacher: 'Luciana Ferreira' },
      { time: '09:30 - 10:20', subject: 'Biologia', teacher: 'Ricardo Souza' },
      { time: '10:20 - 11:10', subject: 'Inglês', teacher: 'Patrícia Lima' },
    ]
  },
  {
    day: 'Quarta-feira',
    classes: [
      { time: '07:30 - 08:20', subject: 'Artes', teacher: 'Juliana Vaz' },
      { time: '08:20 - 09:10', subject: 'Matemática', teacher: 'Ana Silva' },
      { time: '09:30 - 10:20', subject: 'Filosofia', teacher: 'Sérgio Mendes' },
      { time: '10:20 - 11:10', subject: 'Sociologia', teacher: 'Sérgio Mendes' },
    ]
  },
  {
    day: 'Quinta-feira',
    classes: [
      { time: '07:30 - 08:20', subject: 'Educação Física', teacher: 'Felipe Costa' },
      { time: '08:20 - 09:10', subject: 'Português', teacher: 'Carlos Oliveira' },
      { time: '09:30 - 10:20', subject: 'História', teacher: 'Beto Santos' },
      { time: '10:20 - 11:10', subject: 'Geografia', teacher: 'Marta Rocha' },
    ]
  },
  {
    day: 'Sexta-feira',
    classes: [
      { time: '07:30 - 08:20', subject: 'Biologia', teacher: 'Ricardo Souza' },
      { time: '08:20 - 09:10', subject: 'Física', teacher: 'Marcos Lima' },
      { time: '09:30 - 10:20', subject: 'Química', teacher: 'Luciana Ferreira' },
      { time: '10:20 - 11:10', subject: 'Matemática', teacher: 'Ana Silva' },
    ]
  }
];
