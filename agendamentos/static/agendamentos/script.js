let etapaAtual = 1;
let servicoSelecionado = null;
let profissionalSelecionado = null;
let dataSelecionada = null;
let horarioSelecionado = null;
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function obterCsrfToken() {
    const input = document.querySelector('[name=csrfmiddlewaretoken]');
    if (input && input.value) return input.value;
    return getCookie('csrftoken');
}

function irParaAgendar() {
    const alvo = document.getElementById('agendar');
    if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function atualizarLinhasProgresso() {
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`entre-${i}`);
        if (el) {
            el.classList.toggle('preenchido', etapaAtual > i);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    gerarCalendario();

    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const aberto = menu.classList.toggle('aberto');
            toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
            toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        });
        menu.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', () => {
                menu.classList.remove('aberto');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Abrir menu');
            });
        });
    }

    const hash = window.location.hash;
    if (hash === '#agendar') {
        setTimeout(() => irParaAgendar(), 100);
    }
    if (hash === '#meus-agendamentos') {
        setTimeout(() => {
            const el = document.getElementById('meus-agendamentos');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    const btnBuscarMeus = document.getElementById('btnBuscarMeusAgendamentos');
    const inputEmailMeus = document.getElementById('email-meus-agendamentos');
    if (btnBuscarMeus && inputEmailMeus) {
        btnBuscarMeus.addEventListener('click', buscarMeusAgendamentos);
        inputEmailMeus.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarMeusAgendamentos();
            }
        });
    }

    const listaMeus = document.getElementById('listaMeusAgendamentos');
    if (listaMeus) {
        listaMeus.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-excluir-id]');
            if (!btn) return;
            const id = btn.getAttribute('data-excluir-id');
            if (id) excluirMeuAgendamento(parseInt(id, 10));
        });
    }

    const links = document.querySelectorAll('.nav-menu .nav-link[href^="#"]');
    const secoes = [...links]
        .map((a) => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && secoes.length) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.getAttribute('id');
                    links.forEach((l) => {
                        l.classList.toggle('ativo', l.getAttribute('href') === `#${id}`);
                    });
                });
            },
            { rootMargin: '-40% 0px -45% 0px', threshold: 0 }
        );
        secoes.forEach((sec) => obs.observe(sec));
    }
});

function proximaEtapa() {
    if (etapaAtual === 1 && !servicoSelecionado) {
        alert('Por favor, selecione um serviço!');
        return;
    }
    if (etapaAtual === 2 && !profissionalSelecionado) {
        alert('Por favor, selecione um profissional!');
        return;
    }
    if (etapaAtual === 3 && !dataSelecionada) {
        alert('Por favor, selecione uma data!');
        return;
    }
    if (etapaAtual === 4 && !horarioSelecionado) {
        alert('Por favor, selecione um horário!');
        return;
    }

    if (etapaAtual === 5) {
        enviarAgendamento();
        return;
    }

    etapaAtual++;
    atualizarEtapa();
}

function etapaAnterior() {
    if (etapaAtual > 1) {
        etapaAtual--;
        atualizarEtapa();
    }
}

function atualizarEtapa() {
    for (let i = 1; i <= 5; i++) {
        const etapa = document.getElementById(`etapa-${i}`);
        if (etapa) {
            etapa.classList.toggle('ativa', i === etapaAtual);
        }
    }

    for (let i = 1; i <= 5; i++) {
        const progresso = document.getElementById(`progresso-${i}`);
        if (progresso) {
            progresso.classList.remove('ativo', 'concluido');
            if (i < etapaAtual) progresso.classList.add('concluido');
            else if (i === etapaAtual) progresso.classList.add('ativo');
        }
    }

    atualizarLinhasProgresso();

    const botaoProximo = document.getElementById('botaoProximo');
    if (botaoProximo) {
        botaoProximo.textContent = (etapaAtual === 5) ? 'Confirmar Agendamento' : 'Próximo →';
    }

    if (etapaAtual === 4) buscarHorariosOcupados();
    if (etapaAtual === 5) atualizarConfirmacao();
}

function selecionarServico(id, nome, preco, elemento) {
    document.querySelectorAll('#etapa-1 .opcao-servico').forEach(el => el.classList.remove('selecionada'));
    elemento.classList.add('selecionada');
    servicoSelecionado = { id, nome, preco };
}

function selecionarProfissional(nome, iniciais, descricao, elemento) {
    document.querySelectorAll('#etapa-2 .cartao-profissional').forEach(el => el.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    profissionalSelecionado = { nome, iniciais, descricao };
}

function gerarCalendario() {
    const container = document.getElementById('containerDatas');
    if (!container) return;

    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasDoMes = ultimoDia.getDate();
    const diaInicial = primeiroDia.getDay();

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesAnoEl = document.getElementById('mesAno');
    if (mesAnoEl) mesAnoEl.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;

    container.innerHTML = '';

    for (let i = 0; i < diaInicial; i++) {
        const span = document.createElement('span');
        container.appendChild(span);
    }

    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    for (let dia = 1; dia <= diasDoMes; dia++) {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'botao-data';
        btn.textContent = dia;

        const dataObj = new Date(anoAtual, mesAtual, dia);
        if (dataObj < hoje) {
            btn.disabled = true;
        } else {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                selecionarData(dia, dataObj, this);
            });
        }
        container.appendChild(btn);
    }
}

function selecionarData(dia, dataObj, elemento) {
    document.querySelectorAll('.botao-data').forEach(el => el.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const diaStr = String(dataObj.getDate()).padStart(2, '0');

    dataSelecionada = {
        dia,
        data: `${ano}-${mes}-${diaStr}`,
        formatada: `${nomesDias[dataObj.getDay()]}, ${dia} de ${nomesMeses[dataObj.getMonth()]} de ${dataObj.getFullYear()}`
    };
}

function mesPrevio() {
    mesAtual--;
    if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
    gerarCalendario();
}

function proximoMes() {
    mesAtual++;
    if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
    gerarCalendario();
}

function buscarHorariosOcupados() {
    if (!dataSelecionada || !profissionalSelecionado) return;

    const slots = document.querySelectorAll('.slot-tempo');
    slots.forEach(el => {
        el.classList.add('carregando');
        el.classList.remove('indisponivel', 'selecionado');
        el.onclick = null;
    });
    horarioSelecionado = null;

    const url = `/buscar-horarios-ocupados/?data=${dataSelecionada.data}&profissional=${encodeURIComponent(profissionalSelecionado.nome)}`;

    fetch(url)
    .then(res => res.json())
    .then(data => {
        const ocupados = data.horarios || [];
        slots.forEach(el => {
            const texto = el.textContent.trim();
            el.classList.remove('carregando');
            if (ocupados.includes(texto)) {
                el.classList.add('indisponivel');
                el.onclick = null;
            } else {
                el.classList.remove('indisponivel');
                el.onclick = () => selecionarHorario(texto, el);
            }
        });
    })
    .catch(() => {
        slots.forEach(el => el.classList.remove('carregando'));
    });
}

function selecionarHorario(horario, elemento) {
    if (elemento.classList.contains('indisponivel')) return;
    document.querySelectorAll('.slot-tempo').forEach(el => el.classList.remove('selecionado'));
    elemento.classList.add('selecionado');
    horarioSelecionado = horario;
}

function atualizarConfirmacao() {
    document.getElementById('confirmar-servico').textContent = servicoSelecionado?.nome || '-';
    document.getElementById('confirmar-profissional').textContent = profissionalSelecionado?.nome || '-';
    document.getElementById('confirmar-data').textContent = dataSelecionada?.formatada || '-';
    document.getElementById('confirmar-horario').textContent = horarioSelecionado || '-';
}

function enviarAgendamento() {
    const nome = document.getElementById('nome-final').value.trim();
    const email = document.getElementById('email-final').value.trim();
    const telefone = document.getElementById('telefone-final').value.trim();

    if (!nome || !email || !telefone) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    if (!servicoSelecionado || !profissionalSelecionado || !dataSelecionada || !horarioSelecionado) {
        alert('Algum dado do agendamento está incompleto. Volte às etapas anteriores e confira serviço, profissional, data e horário.');
        return;
    }

    const csrftoken = obterCsrfToken();
    if (!csrftoken) {
        alert('Não foi possível validar a sessão (CSRF). Recarregue a página e tente novamente.');
        return;
    }

    const dados = {
        servico: servicoSelecionado,
        profissional: profissionalSelecionado,
        data: dataSelecionada,
        horario: horarioSelecionado,
        nome, email, telefone,
        notas: document.getElementById('notas-final').value
    };

    const botao = document.getElementById('botaoProximo');
    if (botao) {
        botao.disabled = true;
        botao.dataset.rotuloOriginal = botao.textContent;
        botao.textContent = 'Enviando…';
    }

    fetch('/salvar-agendamento/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'same-origin',
        body: JSON.stringify(dados)
    })
    .then(async (res) => {
        const texto = await res.text();
        let payload;
        try {
            payload = texto ? JSON.parse(texto) : {};
        } catch {
            if (res.status === 403) {
                throw new Error('Acesso negado (CSRF). Recarregue a página e tente de novo.');
            }
            throw new Error('Resposta inválida do servidor (código ' + res.status + ').');
        }
        if (!res.ok) {
            throw new Error(payload.message || ('Erro ao salvar (HTTP ' + res.status + ').'));
        }
        return payload;
    })
    .then((data) => {
        if (data.status === 'success') {
            alert('Agendamento realizado com sucesso!');
            location.reload();
        } else {
            alert('Erro: ' + (data.message || 'Falha desconhecida.'));
        }
    })
    .catch((err) => {
        alert(err.message || 'Não foi possível conectar ao servidor. Verifique sua rede e tente novamente.');
    })
    .finally(() => {
        if (botao) {
            botao.disabled = false;
            if (botao.dataset.rotuloOriginal) botao.textContent = botao.dataset.rotuloOriginal;
        }
    });
}

function formatarDataBR(iso) {
    if (!iso) return '—';
    const partes = String(iso).split('-');
    if (partes.length < 3) return iso;
    const [y, m, d] = partes;
    return `${d}/${m}/${y}`;
}

function buscarMeusAgendamentos() {
    const input = document.getElementById('email-meus-agendamentos');
    const lista = document.getElementById('listaMeusAgendamentos');
    const msg = document.getElementById('msgMeusAgendamentos');
    if (!input || !lista) return;

    const email = input.value.trim();
    if (!email) {
        if (msg) {
            msg.textContent = 'Digite o e-mail usado no agendamento.';
            msg.hidden = false;
            msg.classList.add('msg-meus-agendamentos--erro');
        }
        lista.innerHTML = '';
        return;
    }
    if (msg) {
        msg.textContent = 'Buscando…';
        msg.hidden = false;
        msg.classList.remove('msg-meus-agendamentos--erro');
    }
    lista.innerHTML = '';

    const url = `/listar-meus-agendamentos/?email=${encodeURIComponent(email)}`;

    fetch(url, { credentials: 'same-origin' })
        .then(async (res) => {
            const texto = await res.text();
            let data;
            try {
                data = texto ? JSON.parse(texto) : {};
            } catch {
                throw new Error('Resposta inválida do servidor.');
            }
            if (!res.ok) {
                throw new Error(data.message || 'Não foi possível buscar os agendamentos.');
            }
            return data;
        })
        .then((data) => {
            if (msg) msg.hidden = true;
            const itens = data.agendamentos || [];
            if (!itens.length) {
                lista.innerHTML = '<p class="lista-meus-vazia">Nenhum agendamento encontrado para este e-mail.</p>';
                return;
            }
            lista.innerHTML = itens.map((ag) => `
                <article class="cartao-meu-agendamento">
                    <div class="cartao-meu-agendamento__info">
                        <h3 class="cartao-meu-agendamento__titulo">${escapeHtml(ag.servico)}</h3>
                        <dl class="cartao-meu-agendamento__dl">
                            <div><dt>Valor</dt><dd>${escapeHtml(ag.preco)}</dd></div>
                            <div><dt>Profissional</dt><dd>${escapeHtml(ag.profissional)}</dd></div>
                            <div><dt>Data</dt><dd>${formatarDataBR(ag.data)}</dd></div>
                            <div><dt>Horário</dt><dd>${escapeHtml(ag.horario)}</dd></div>
                            <div><dt>Nome</dt><dd>${escapeHtml(ag.nome_cliente)}</dd></div>
                            <div><dt>Telefone</dt><dd>${escapeHtml(ag.telefone_cliente)}</dd></div>
                        </dl>
                    </div>
                    <button type="button" class="botao botao-excluir-agendamento" data-excluir-id="${ag.id}">Excluir</button>
                </article>
            `).join('');
        })
        .catch((err) => {
            lista.innerHTML = '';
            if (msg) {
                msg.textContent = err.message || 'Erro ao buscar.';
                msg.hidden = false;
                msg.classList.add('msg-meus-agendamentos--erro');
            } else {
                alert(err.message);
            }
        });
}

function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function excluirMeuAgendamento(id) {
    const input = document.getElementById('email-meus-agendamentos');
    if (!input) return;
    const email = input.value.trim();
    if (!email) {
        alert('Informe o e-mail e clique em Buscar antes de excluir.');
        return;
    }
    if (!confirm('Deseja realmente excluir este agendamento? Esta ação não pode ser desfeita.')) {
        return;
    }

    const csrftoken = obterCsrfToken();
    if (!csrftoken) {
        alert('Recarregue a página e tente novamente (sessão).');
        return;
    }

    fetch('/excluir-meu-agendamento/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'same-origin',
        body: JSON.stringify({ id, email })
    })
        .then(async (res) => {
            const texto = await res.text();
            let data;
            try {
                data = texto ? JSON.parse(texto) : {};
            } catch {
                throw new Error('Resposta inválida do servidor.');
            }
            if (!res.ok) {
                throw new Error(data.message || ('Erro HTTP ' + res.status));
            }
            return data;
        })
        .then((data) => {
            if (data.status === 'success') {
                buscarMeusAgendamentos();
            } else {
                alert(data.message || 'Não foi possível excluir.');
            }
        })
        .catch((err) => alert(err.message || 'Falha ao excluir.'));
}
