from rest_framework.permissions import BasePermission


class IsSuperuser(BasePermission):
    """
    Only allow superusers to access shop management endpoints.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )