from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from .permissions import IsAdminUserRole
from .serializers import RegisterSerializer
from .models import User

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode,
)
from django.utils.encoding import force_bytes


# =========================================================
# REGISTER
# =========================================================

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    "message": "Student registered successfully.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# CURRENT USER
# =========================================================

class CurrentUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# ADMIN TEST
# =========================================================

class AdminTestView(APIView):

    permission_classes = [IsAdminUserRole]

    def get(self, request):

        return Response(
            {
                "message": "Admin access granted.",
                "username": request.user.username,
                "role": request.user.role,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# ADMIN - STUDENT LIST
# =========================================================

class AdminStudentListView(APIView):

    permission_classes = [IsAdminUserRole]

    def get(self, request):

        students = User.objects.filter(
            role="STUDENT"
        ).order_by("-created_at")

        # ---------------------------------------------
        # SEARCH
        # ---------------------------------------------

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        if search:

            students = students.filter(
                username__icontains=search
            ) | students.filter(
                email__icontains=search
            ) | students.filter(
                first_name__icontains=search
            ) | students.filter(
                last_name__icontains=search
            )

        # ---------------------------------------------
        # STUDENT DATA
        # ---------------------------------------------

        student_data = []

        for student in students:

            full_name = (
                f"{student.first_name} "
                f"{student.last_name}"
            ).strip()

            if not full_name:
                full_name = student.username

            student_data.append(
                {
                    "id": student.id,

                    "username": student.username,

                    "email": student.email,

                    "first_name": student.first_name,

                    "last_name": student.last_name,

                    "full_name": full_name,

                    "role": student.role,

                    "is_active": student.is_active,

                    "created_at": student.created_at,
                }
            )

        return Response(
            {
                "count": len(student_data),

                "students": student_data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# FORGOT PASSWORD
# =========================================================

class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email")

        if not email:

            return Response(
                {
                    "error": "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(
            email=email,
            is_active=True,
        ).first()

        # Don't reveal whether an email exists
        if not user:

            return Response(
                {
                    "message": (
                        "If an account exists with this email, "
                        "a password reset link has been generated."
                    )
                },
                status=status.HTTP_200_OK,
            )

        # ---------------------------------------------
        # GENERATE RESET TOKEN
        # ---------------------------------------------

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = default_token_generator.make_token(
            user
        )

        # Development/testing response.
        # In production, send this information by email.

        return Response(
            {
                "message": "Password reset token generated.",

                "uid": uid,

                "token": token,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        uid = request.data.get("uid")

        token = request.data.get("token")

        new_password = request.data.get(
            "new_password"
        )

        # ---------------------------------------------
        # VALIDATION
        # ---------------------------------------------

        if (
            not uid
            or not token
            or not new_password
        ):

            return Response(
                {
                    "error": (
                        "uid, token and new_password "
                        "are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # PASSWORD LENGTH
        # ---------------------------------------------

        if len(new_password) < 8:

            return Response(
                {
                    "error": (
                        "Password must be at least "
                        "8 characters long."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # DECODE USER ID
        # ---------------------------------------------

        try:

            user_id = urlsafe_base64_decode(
                uid
            ).decode()

            user = User.objects.get(
                pk=user_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):

            return Response(
                {
                    "error": "Invalid password reset link."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # VALIDATE TOKEN
        # ---------------------------------------------

        if not default_token_generator.check_token(
            user,
            token,
        ):

            return Response(
                {
                    "error": (
                        "Invalid or expired "
                        "password reset token."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------
        # UPDATE PASSWORD
        # ---------------------------------------------

        user.set_password(
            new_password
        )

        user.save()

        return Response(
            {
                "message": (
                    "Password reset successfully."
                )
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# LOGOUT
# =========================================================

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        if not refresh_token:

            return Response(
                {
                    "error": "Refresh token is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    "message": "Logout successful."
                },
                status=status.HTTP_200_OK,
            )

        except Exception:

            return Response(
                {
                    "error": "Invalid refresh token."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )