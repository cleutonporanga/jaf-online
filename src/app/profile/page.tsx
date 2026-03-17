
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-store';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Camera, 
  Save, 
  UserCog,
  Plus,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ProfilePage() {
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isStudent = user?.role === 'aluno';

  // New professor form state
  const [newProfessor, setNewProfessor] = useState({
    name: '',
    email: '',
  });

  const handleSave = () => {
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso.",
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  const handleRegisterProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfessor.name || !newProfessor.email) return;

    setIsRegistering(true);
    try {
      // For the prototype, we create the user profile record.
      // In a real app, this might trigger an invite email or Firebase Auth creation.
      const professorId = `prof-${Date.now()}`;
      const userRef = doc(db, 'userProfiles', professorId);
      
      setDocumentNonBlocking(userRef, {
        id: professorId,
        name: newProfessor.name,
        email: newProfessor.email,
        role: 'professor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Professor Cadastrado",
        description: `${newProfessor.name} agora tem acesso ao sistema JAF 2026.`,
        className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
      });
      
      setIsDialogOpen(false);
      setNewProfessor({ name: '', email: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-[#2E7D32] font-headline">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações e preferências.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg h-fit">
            <CardContent className="pt-12 pb-8 flex flex-col items-center">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-gray-300" />
                  )}
                </div>
                {!isStudent && (
                  <button className="absolute bottom-0 right-0 bg-[#4CAF50] text-white p-2 rounded-full shadow-lg hover:bg-[#43a047] transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">{user?.role === 'aluno' ? 'Aluno' : user?.role}</p>
              
              <div className="mt-8 w-full border-t pt-6 space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground">ID do Usuário</span>
                   <span className="font-mono font-medium text-xs truncate max-w-[120px]">{user?.id}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground">Desde</span>
                   <span className="font-medium">2026</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-[#4CAF50]" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="pl-9 bg-white"
                        disabled={isStudent}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Institucional</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="pl-9 bg-white"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <Shield className="h-4 w-4 text-[#4CAF50]" />
                    <span className="text-sm font-bold capitalize text-[#2E7D32]">
                      {user?.role === 'aluno' ? 'Visualizador (Aluno)' : user?.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">O seu nível de acesso é definido pela administração central.</p>
                </div>

                {!isStudent && (
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-md px-8">
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {user?.role === 'administrador' && (
              <Card className="border-none shadow-md border-t-4 border-[#2E7D32] bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-[#2E7D32] font-bold">Gerenciamento Administrativo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">Como administrador central, você tem privilégios para criar contas de professores e gerenciar toda a estrutura escolar.</p>
                   
                   <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                     <DialogTrigger asChild>
                       <Button className="w-full bg-[#2E7D32] hover:bg-[#1b5e20] gap-2 h-11 rounded-xl shadow-lg">
                         <Plus className="h-4 w-4" />
                         Cadastrar Novo Professor
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle className="text-[#2E7D32]">Novo Professor</DialogTitle>
                         <DialogDescription>
                           Adicione um novo docente ao sistema JAF 2026.
                         </DialogDescription>
                       </DialogHeader>
                       <form onSubmit={handleRegisterProfessor} className="space-y-4 py-4">
                         <div className="space-y-2">
                           <Label htmlFor="prof-name">Nome Completo</Label>
                           <Input 
                             id="prof-name" 
                             placeholder="Ex: Prof. Marcos Silva" 
                             value={newProfessor.name}
                             onChange={e => setNewProfessor({...newProfessor, name: e.target.value})}
                             required
                           />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="prof-email">E-mail Institucional</Label>
                           <Input 
                             id="prof-email" 
                             type="email" 
                             placeholder="marcos@escola.com" 
                             value={newProfessor.email}
                             onChange={e => setNewProfessor({...newProfessor, email: e.target.value})}
                             required
                           />
                         </div>
                         <DialogFooter>
                           <Button type="submit" disabled={isRegistering} className="w-full bg-[#4CAF50]">
                             {isRegistering ? <Loader2 className="animate-spin h-4 w-4" /> : "Concluir Cadastro"}
                           </Button>
                         </DialogFooter>
                       </form>
                     </DialogContent>
                   </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
