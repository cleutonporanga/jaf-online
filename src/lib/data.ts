
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
