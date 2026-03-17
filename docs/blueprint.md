# **App Name**: ScholarView

## Core Features:

- Autenticação e Autorização de Usuários: Implementa autenticação de usuários via Firebase Authentication, verificando o campo 'tipo' (administrador/professor) armazenado no Cloud Firestore para controlar o acesso às funcionalidades e garantir que apenas usuários autenticados possam acessar o sistema. Inclui funcionalidades de login, logout e gerenciamento de sessões.
- Dashboard Geral: Visualização consolidada e personalizável de informações chave do sistema escolar, como desempenho, frequência e avisos importantes, obtidas de forma eficiente do Cloud Firestore. Apresenta cards e tabelas resumidas, tudo renderizado com Tailwind CSS e adaptado ao perfil do usuário (admin/professor).
- Calendário Interativo: Gerenciamento e visualização de eventos escolares, prazos, feriados e horários de aula armazenados no Cloud Firestore. Inclui funcionalidades de filtro e lembretes, exibindo informações relevantes para as turmas ou perfil do usuário logado.
- Gestão de Turmas: Ferramenta para administradores criarem e gerenciarem turmas no Cloud Firestore. Professores podem visualizar apenas suas turmas atribuídas, matricular e desmatricular alunos, e acessar informações detalhadas de cada classe de forma filtrada por seu perfil.
- Registro de Frequência: Sistema para professores registrarem, consultarem e analisarem a frequência dos alunos em suas turmas. Os dados são armazenados e recuperados do Cloud Firestore, com relatórios gerenciais disponíveis para visualização em tabelas, otimizados para evitar leituras excessivas.
- Gestão de Notas e Médias: Funcionalidade para professores inserirem e acompanharem notas, calcularem médias e gerarem boletins para suas turmas. Todos os dados são gerenciados no Cloud Firestore e apresentados em formatos de tabela para fácil leitura, com acesso restrito às turmas do professor.
- Geração Inteligente de Destaques: Uma ferramenta de IA que atua como um tool, analisando o desempenho acadêmico e a participação dos alunos armazenados no Cloud Firestore. Ela identifica e sugere automaticamente conquistas e áreas de melhoria, destacando os resultados de forma personalizada e acessível aos professores para suas respectivas turmas.
- Gestão de Perfil do Usuário e Funções: Área dedicada para os usuários visualizarem e atualizarem suas informações pessoais (nome, email) armazenadas no Cloud Firestore. Administradores têm a permissão de criar novos usuários com o perfil de professor, definindo seu campo 'tipo' e gerenciando suas permissões.

## Style Guidelines:

- Cor primária: Verde esmeralda (#4CAF50), transmitindo vitalidade e crescimento, ideal para botões, elementos interativos e a barra superior.
- Cor de fundo: Cinza muito claro (#F5F5F5), para proporcionar um ambiente limpo e neutro que destaque o conteúdo dos cards brancos e tabelas.
- Cor dos ícones: Verde escuro (#2E7D32), para garantir contraste e visibilidade em um fundo claro.
- Fonte para corpo e títulos: 'Inter', um sans-serif moderno e objetivo, selecionado pela sua excelente legibilidade em telas e dashboards densos em dados, garantindo clareza nas tabelas e cards.
- Ícones em estilo glifo ou line-art, na cor verde escuro, minimalistas e consistentes com o tema educacional e administrativo, complementando a estética moderna e limpa.
- Layout responsivo com sistema de grid flexível, utilizando cards brancos e tabelas em blocos informativos no estilo dashboard, e uma barra de navegação superior verde, todos otimizados com Tailwind CSS.
- Transições suaves para elementos interativos como navegação entre abas, filtragem de dados e atualização de conteúdo, melhorando a experiência do usuário sem distrações.