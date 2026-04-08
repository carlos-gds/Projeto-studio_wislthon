from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('salvar-agendamento/', views.salvar_agendamento, name='salvar_agendamento'),
    path('buscar-horarios-ocupados/', views.buscar_horarios_ocupados, name='buscar_horarios_ocupados'),
    path('listar-meus-agendamentos/', views.listar_meus_agendamentos, name='listar_meus_agendamentos'),
    path('excluir-meu-agendamento/', views.excluir_meu_agendamento, name='excluir_meu_agendamento'),
]
