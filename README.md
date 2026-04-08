# Studio By Wislthon - Sistema de Agendamento Online

Este é um projeto de aplicação web desenvolvido para a disciplina de **Códigos de Alta Performance - Web**, focado em oferecer uma solução real de agendamento para um salão de beleza.

## 🚀 Funcionalidades

- **Agendamento Inteligente:** Fluxo em 5 etapas para escolha de serviço, profissional, data e horário.
- **Sincronização em Tempo Real:** O sistema consulta o banco de dados e desabilita visualmente (deixa cinza) horários que já foram reservados.
- **Painel Administrativo:** Interface completa para o proprietário gerenciar clientes e agendamentos.
- **Design Responsivo:** Interface adaptável para dispositivos móveis e desktop.
- **Validação de Dados:** Proteção contra agendamentos duplicados e campos obrigatórios.

## 🛠️ Tecnologias Utilizadas

- **Backend:** [Django 5.0+](https://www.djangoproject.com/) (Python)
- **Banco de Dados:** [SQLite](https://www.sqlite.org/) (Nativo do Django)
- **Frontend:** HTML5, CSS3 Moderno e JavaScript (Vanilla)
- **Segurança:** Proteção CSRF e validação de formulários.

## ⚙️ Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/studio_wislthon.git
   cd studio_wislthon
   ```

2. **Crie um ambiente virtual (opcional, mas recomendado):**
   ```bash
   python -m venv venv
   # No Windows:
   venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Execute as migrações do banco de dados:**
   ```bash
   python manage.py migrate
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   python manage.py runserver
   ```

6. **Acesse no navegador:**
   - Site: `http://127.0.0.1:8000`
   - Painel Admin: `http://127.0.0.1:8000/admin` (Usuário: `admin` | Senha: `admin123`)

## 📝 Requisitos da Disciplina Atendidos

- [x] Uso de Banco de Dados SQLite.
- [x] Aplicação com leitura e escrita de dados.
- [x] No mínimo 4 histórias de usuário implementadas.
- [x] Design responsivo e organizado.

---
Desenvolvido como parte do projeto acadêmico de **Códigos de Alta Performance - Web**.
