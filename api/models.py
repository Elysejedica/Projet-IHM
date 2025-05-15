from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

class Column(models.Model):
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.title

class Task(models.Model):
    title = models.CharField(max_length=255)
    column = models.ForeignKey(Column, related_name='tasks', on_delete=models.CASCADE)
    order = models.IntegerField()
    labels = models.JSONField(default=list)  # Pour stocker les étiquettes
    history = models.JSONField(default=list)  # Pour stocker l'historique des actions
    members = models.ManyToManyField(User, related_name='tasks', blank=True)  # Pour les membres

    def add_history(self, action):
        self.history.append({'action': action, 'date': str(datetime.now())})
        self.save()

    def __str__(self):
        return f"{self.title} ({self.column.title})"
