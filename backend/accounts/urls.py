from django.urls import path

from .views import (
    RegisterView,
    CurrentUserView,
    AdminTestView,
    AdminStudentListView,
    ForgotPasswordView,
    ResetPasswordView,
    LogoutView,
)


urlpatterns = [

    # =====================================================
    # REGISTRATION
    # =====================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),


    # =====================================================
    # CURRENT USER
    # =====================================================

    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),


    # =====================================================
    # ADMIN TEST
    # =====================================================

    path(
        "admin-test/",
        AdminTestView.as_view(),
        name="admin-test",
    ),


    # =====================================================
    # ADMIN - STUDENTS
    # =====================================================

    path(
        "admin/students/",
        AdminStudentListView.as_view(),
        name="admin-student-list",
    ),


    # =====================================================
    # FORGOT PASSWORD
    # =====================================================

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),


    # =====================================================
    # RESET PASSWORD
    # =====================================================

    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),


    # =====================================================
    # LOGOUT
    # =====================================================

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),
]