from django.contrib import admin

from .models import Agendamento

@admin.register(Agendamento)
class AgendamentoAdmin(admin.ModelAdmin):
    list_display = ('nome_cliente', 'servico', 'data', 'horario', 'profissional')
    list_filter = ('data', 'profissional', 'servico')
    search_fields = ('nome_cliente', 'email_cliente', 'telefone_cliente')

