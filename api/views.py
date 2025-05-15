from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Column, Task
from .serializers import ColumnSerializer, TaskSerializer, UserSerializer
from django.contrib.auth.models import User


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def list(self, request, *args, **kwargs):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class ColumnViewSet(viewsets.ModelViewSet):
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('order')
    serializer_class = TaskSerializer

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        labels = request.data.get('labels', None)
        if labels is not None:
            task.labels = labels
            task.add_history("Étiquettes mises à jour")
        return super().update(request, *args, **kwargs)

    def add_member(self, request, pk=None):
        task = self.get_object()
        user_id = request.data.get('userId')
        try:
            user = User.objects.get(id=user_id)
            task.members.add(user)
            task.add_history(f"Membre ajouté: {user.username}")
            return Response({'message': 'Membre ajouté'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

    def remove_member(self, request, pk=None, user_id=None):
        task = self.get_object()
        try:
            user = User.objects.get(id=user_id)
            task.members.remove(user)
            task.add_history(f"Membre retiré: {user.username}")
            return Response({'message': 'Membre retiré'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
