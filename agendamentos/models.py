from django.db import models

class Agendamento(models.Model):
    servico = models.CharField(max_length=100)
    preco = models.CharField(max_length=50)
    profissional = models.CharField(max_length=100)
    data = models.DateField()
    horario = models.CharField(max_length=10)
    nome_cliente = models.CharField(max_length=200)
    email_cliente = models.EmailField()
    telefone_cliente = models.CharField(max_length=20)
    notas = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome_cliente} - {self.servico} ({self.data} {self.horario})"

    class Meta:
        verbose_name = "Agendamento"
        verbose_name_plural = "Agendamentos"

