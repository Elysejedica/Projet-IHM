from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ColumnViewSet, TaskViewSet
from .views import UserViewSet

router = DefaultRouter()
router.register(r'columns', ColumnViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('tasks/<int:pk>/members/', TaskViewSet.as_view({'post': 'add_member'}), name='add_member_to_task'),
    path('tasks/<int:pk>/members/<int:user_id>/', TaskViewSet.as_view({'delete': 'remove_member'}), name='remove_member_from_task'),
]
