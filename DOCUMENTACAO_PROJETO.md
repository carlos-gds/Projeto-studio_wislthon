# Documentação do Projeto: Studio By Wislthon
**Disciplina:** Códigos de Alta Performance - Web
**Professor:** Maurício Braga

## 1. Descrição da Aplicação
O **Studio By Wislthon** é uma aplicação web voltada para o gerenciamento de agendamentos de um salão de beleza. A aplicação permite que clientes escolham serviços, profissionais, datas e horários de forma intuitiva, garantindo que os dados sejam persistidos de forma segura em um banco de dados relacional.

## 2. Tecnologias Utilizadas
- **Backend:** Django (Python)
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados:** SQLite3
- **Design:** Responsivo (Adaptável para Mobile e Desktop)

## 3. Histórias de Usuário Implementadas

### História 1: Agendamento de Serviço (Cliente)
- **Descrição:** Como cliente, desejo selecionar um serviço e um profissional para agendar um horário no salão.
- **Critério de Aceite:** O sistema deve validar se todos os campos foram preenchidos e salvar as informações (serviço, profissional, data, horário e dados do cliente) no banco de dados SQLite.
- **Persistência:** Gravação no banco de dados.

### História 2: Gerenciamento de Agendamentos (Administrador)
- **Descrição:** Como dono do salão, desejo visualizar e gerenciar todos os agendamentos realizados.
- **Critério de Aceite:** Através do painel administrativo do Django (`/admin`), o administrador pode listar, filtrar por data/profissional e editar/excluir agendamentos.
- **Persistência:** Leitura e alteração no banco de dados.

### História 3: Validação de Dados e Segurança (Sistema)
- **Descrição:** Como sistema, devo garantir que os dados enviados pelo formulário sejam válidos e que não haja conflitos de horários.
- **Critério de Aceite:** 
  1. O sistema utiliza proteção CSRF para o envio de formulários.
  2. O sistema impede que dois agendamentos sejam feitos para o **mesmo profissional, na mesma data e no mesmo horário**.
  3. Caso o horário já esteja ocupado, o sistema retorna um erro informativo ao cliente.
- **Persistência:** Verificação de conflito no SQLite antes da gravação.

### História 4: Interface Adaptável (Usuário)
- **Descrição:** Como usuário, desejo acessar a aplicação tanto pelo celular quanto pelo computador sem perda de funcionalidade.
- **Critério de Aceite:** O layout deve se ajustar automaticamente ao tamanho da tela, mantendo o fluxo de agendamento funcional e legível.
- **Estilização:** Uso de CSS moderno e Media Queries.

## 4. Como Executar
1. Instalar dependências: `pip install django`
2. Executar migrações: `python manage.py migrate`
3. Iniciar servidor: `python manage.py runserver`
4. Acessar: `http://127.0.0.1:8000`
5. Painel Admin: `http://127.0.0.1:8000/admin` (Usuário: `admin` / Senha: `admin123`)
