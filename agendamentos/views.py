from django.shortcuts import render
from django.http import JsonResponse
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from .models import Agendamento
import json
from datetime import datetime
from django.views.decorators.csrf import ensure_csrf_cookie


def _agendamento_para_dict(ag):
    return {
        'id': ag.id,
        'servico': ag.servico,
        'preco': ag.preco,
        'profissional': ag.profissional,
        'data': ag.data.isoformat(),
        'horario': ag.horario,
        'nome_cliente': ag.nome_cliente,
        'telefone_cliente': ag.telefone_cliente,
        'notas': ag.notas or '',
        'criado_em': ag.criado_em.isoformat() if ag.criado_em else '',
    }

@ensure_csrf_cookie
def index(request):
    return render(request, 'agendamentos/index.html')

def salvar_agendamento(request):
    if request.method == 'POST':
        try:
            data_json = json.loads(request.body)

            servico_data = data_json.get('servico') or {}
            profissional_data = data_json.get('profissional') or {}
            data_info = data_json.get('data') or {}

            data_raw = data_info.get('data')
            if not data_raw:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Data do agendamento ausente ou inválida. Volte à etapa da data e selecione novamente.'
                }, status=400)

            # Pega apenas os primeiros 10 caracteres (YYYY-MM-DD) para evitar fuso horário
            data_obj = datetime.strptime(str(data_raw)[:10], '%Y-%m-%d').date()

            profissional = profissional_data.get('nome')
            horario = data_json.get('horario')

            if not profissional or not horario:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Profissional ou horário ausente. Confirme as etapas anteriores.'
                }, status=400)

            nome_servico = servico_data.get('nome')
            if not nome_servico:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Serviço não informado. Selecione um serviço na primeira etapa.'
                }, status=400)

            # --- VALIDAÇÃO DE CONFLITO ---
            conflito = Agendamento.objects.filter(
                profissional=profissional,
                data=data_obj,
                horario=horario
            ).exists()

            if conflito:
                return JsonResponse({
                    'status': 'error', 
                    'message': f'Desculpe, o horário {horario} com o profissional {profissional} já foi reservado por outro cliente.'
                }, status=400)
            # -----------------------------

            agendamento = Agendamento(
                servico=nome_servico,
                preco=servico_data.get('preco') or '',
                profissional=profissional,
                data=data_obj,
                horario=horario,
                nome_cliente=data_json.get('nome'),
                email_cliente=data_json.get('email'),
                telefone_cliente=data_json.get('telefone'),
                notas=data_json.get('notas', '')
            )
            agendamento.save()
            return JsonResponse({'status': 'success', 'message': 'Agendamento realizado com sucesso!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)

def buscar_horarios_ocupados(request):
    data_raw = request.GET.get('data')
    profissional = request.GET.get('profissional')
    
    if not data_raw or not profissional:
        return JsonResponse({'horarios': []})
    
    try:
        # Pega apenas os primeiros 10 caracteres (YYYY-MM-DD) para evitar fuso horário
        data_obj = datetime.strptime(data_raw[:10], '%Y-%m-%d').date()
            
        horarios_ocupados = Agendamento.objects.filter(
            data=data_obj,
            profissional=profissional
        ).values_list('horario', flat=True)
        
        return JsonResponse({'horarios': list(horarios_ocupados)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def listar_meus_agendamentos(request):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)

    email = (request.GET.get('email') or '').strip()
    if not email:
        return JsonResponse({'status': 'success', 'agendamentos': []})

    try:
        validate_email(email)
    except DjangoValidationError:
        return JsonResponse({'status': 'error', 'message': 'Informe um e-mail válido.'}, status=400)

    lista = (
        Agendamento.objects.filter(email_cliente__iexact=email)
        .order_by('-data', 'horario')
    )
    return JsonResponse({
        'status': 'success',
        'agendamentos': [_agendamento_para_dict(a) for a in lista],
    })


def excluir_meu_agendamento(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)

    try:
        data_json = json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'status': 'error', 'message': 'JSON inválido.'}, status=400)

    pk = data_json.get('id')
    email = (data_json.get('email') or '').strip()

    if pk is None or not email:
        return JsonResponse({
            'status': 'error',
            'message': 'ID do agendamento e e-mail são obrigatórios.',
        }, status=400)

    try:
        validate_email(email)
    except DjangoValidationError:
        return JsonResponse({'status': 'error', 'message': 'E-mail inválido.'}, status=400)

    try:
        ag = Agendamento.objects.get(pk=pk)
    except Agendamento.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Agendamento não encontrado.'}, status=404)

    if ag.email_cliente.lower() != email.lower():
        return JsonResponse({
            'status': 'error',
            'message': 'Este e-mail não corresponde ao agendamento selecionado.',
        }, status=403)

    ag.delete()
    return JsonResponse({'status': 'success', 'message': 'Agendamento excluído com sucesso.'})
