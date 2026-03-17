import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function seedDatabase(db: Firestore) {
  try {
    // 1. User Profiles
    const users = [
      {
        id: "cleuton-admin",
        name: "Cleuton Lima",
        email: "cleutonlima06@gmail.com",
        role: "administrador",
      },
      {
        id: "prof-jaf",
        name: "Prof. Joaquim Silva",
        email: "jaf@escola.com",
        role: "professor",
      },
      {
        id: "aluno-jaf",
        name: "Arthur Aluno",
        email: "aluno@escola.com",
        role: "aluno",
      }
    ];

    for (const user of users) {
      await setDoc(doc(db, 'userProfiles', user.id), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Students
    const students = [
      { id: "s1", firstName: "Arthur", lastName: "Morgan", enrollmentNumber: "2026001", enrollmentDate: "2026-01-10", dateOfBirth: "2010-05-15", courseIds: ["c1", "c2"] },
      { id: "s2", firstName: "John", lastName: "Marston", enrollmentNumber: "2026002", enrollmentDate: "2026-01-10", dateOfBirth: "2010-08-20", courseIds: ["c1"] },
      { id: "s3", firstName: "Sadie", lastName: "Adler", enrollmentNumber: "2026003", enrollmentDate: "2026-01-12", dateOfBirth: "2011-02-05", courseIds: ["c1", "c2"] },
      { id: "s4", firstName: "Charles", lastName: "Smith", enrollmentNumber: "2026004", enrollmentDate: "2026-01-15", dateOfBirth: "2010-11-30", courseIds: ["c2"] },
    ];

    for (const student of students) {
      await setDoc(doc(db, 'students', student.id), {
        ...student,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 3. Courses (Turmas)
    const courses = [
      {
        id: "c1",
        name: "Matemática Avançada - 9º Ano A",
        description: "Turma focada em preparação para olimpíadas.",
        year: "2026",
        gradeLevel: "9º Ano",
        professorId: "prof-jaf",
        studentIds: ["s1", "s2", "s3"]
      },
      {
        id: "c2",
        name: "Ciências da Natureza - 8º Ano B",
        description: "Exploração de biologia e física básica.",
        year: "2026",
        gradeLevel: "8º Ano",
        professorId: "prof-jaf",
        studentIds: ["s1", "s3", "s4"]
      }
    ];

    for (const course of courses) {
      await setDoc(doc(db, 'courses', course.id), {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 4. School Settings (Notice)
    await setDoc(doc(db, 'schoolSettings', 'generalNotice'), {
      text: "Sejam bem-vindos ao ano letivo JAF 2026! O conselho de classe ocorrerá no dia 20 de maio.",
      updatedBy: "Sistema",
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 5. Recommended Actions
    const actions = [
      { id: "a1", text: "Lançar notas do 1º Bimestre", type: "warning" },
      { id: "a2", text: "Atualizar frequência da Turma 9A", type: "info" },
      { id: "a3", text: "Agendar reunião com pais do 8º Ano B", type: "info" }
    ];

    for (const action of actions) {
      await setDoc(doc(db, 'recommendedActions', action.id), {
        ...action,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 6. Schedules (Sample)
    const schedules = [
      { id: "sch1", courseId: "c1", dayOfWeek: "Segunda-feira", startTime: "07:30", endTime: "09:10", subject: "Matemática", teacherName: "Joaquim Silva" },
      { id: "sch2", courseId: "c1", dayOfWeek: "Quarta-feira", startTime: "09:30", endTime: "11:10", subject: "Matemática", teacherName: "Joaquim Silva" },
      { id: "sch3", courseId: "c2", dayOfWeek: "Terça-feira", startTime: "07:30", endTime: "09:10", subject: "Ciências", teacherName: "Joaquim Silva" }
    ];

    for (const sch of schedules) {
      await setDoc(doc(db, 'schedules', sch.id), sch, { merge: true });
    }

    return true;
  } catch (error) {
    console.error("Erro durante o seed:", error);
    throw error;
  }
}
