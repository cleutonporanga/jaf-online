
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
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
  UserCog 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso.",
      className: "bg-[#E8F5E9] border-[#4CAF50] text-[#2E7D32]",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
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
                <button className="absolute bottom-0 right-0 bg-[#4CAF50] text-white p-2 rounded-full shadow-lg hover:bg-[#43a047] transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
              
              <div className="mt-8 w-full border-t pt-6 space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground">ID do Usuário</span>
                   <span className="font-mono font-medium">{user?.id}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-muted-foreground">Desde</span>
                   <span className="font-medium">Março 2024</span>
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
                        className="pl-9"
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
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Shield className="h-4 w-4 text-[#4CAF50]" />
                    <span className="text-sm font-medium capitalize">{user?.role}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">O tipo de acesso define quais permissões você possui no sistema ScholarView.</p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} className="bg-[#4CAF50] hover:bg-[#43a047] gap-2 shadow-sm">
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <Card className="border-none shadow-md border-t-4 border-[#2E7D32]">
                <CardHeader>
                  <CardTitle className="text-lg text-[#2E7D32]">Painel Administrativo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-sm text-muted-foreground">Como administrador, você pode criar e gerenciar outros usuários.</p>
                   <Button className="w-full bg-[#2E7D32] hover:bg-[#1b5e20] gap-2">
                     <Plus className="h-4 w-4" />
                     Criar Novo Usuário
                   </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );
}
