from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    """
    Allows access only to users with the ADMIN role.
    """

    message = "Admin access is required to perform this action."

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        role = str(getattr(user, "role", "")).strip().upper()

        return role == "ADMIN"


class IsStudentUserRole(BasePermission):
    """
    Allows access only to users with the STUDENT role.
    """

    message = "Student access is required to perform this action."

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        role = str(getattr(user, "role", "")).strip().upper()

        return role == "STUDENT"