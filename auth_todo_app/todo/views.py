from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Todo
from .serializers import TodoSerializer


class TodoViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = TodoSerializer

    def get_queryset(self):
        # Each user only ever sees their own todos
        return Todo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically attach the logged-in user on creation
        serializer.save(user=self.request.user)
