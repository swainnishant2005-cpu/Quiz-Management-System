import os
from io import BytesIO
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models import Avg, Count, Max
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from .models import Attempt, Answer, Certificate
from .serializers import AttemptSerializer

from quizzes.models import Quiz
from questions.models import Question, Option


# ============================================================
# START QUIZ
# ============================================================

class StartQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):

        quiz = get_object_or_404(
            Quiz,
            id=quiz_id
        )

        # ----------------------------------------------------
        # Check quiz status
        # ----------------------------------------------------

        if quiz.status != "Published":

            return Response(
                {
                    "error": "This quiz is not available."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Check maximum attempts
        # ----------------------------------------------------

        previous_attempts = Attempt.objects.filter(
            student=request.user,
            quiz=quiz
        ).exclude(
            status="IN_PROGRESS"
        ).count()

        if previous_attempts >= quiz.max_attempts:

            return Response(
                {
                    "error": "Maximum attempts reached."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Check existing active attempt
        # ----------------------------------------------------

        active_attempt = Attempt.objects.filter(
            student=request.user,
            quiz=quiz,
            status="IN_PROGRESS"
        ).first()

        if active_attempt:

            return Response(
                AttemptSerializer(active_attempt).data,
                status=status.HTTP_200_OK
            )

        # ----------------------------------------------------
        # Create attempt
        # ----------------------------------------------------

        attempt = Attempt.objects.create(
            student=request.user,
            quiz=quiz
        )

        return Response(
            AttemptSerializer(attempt).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# SUBMIT QUIZ
# ============================================================

class SubmitQuizView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        # ----------------------------------------------------
        # Check attempt status
        # ----------------------------------------------------

        if attempt.status != "IN_PROGRESS":

            return Response(
                {
                    "error": "This attempt has already been completed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Check time
        # ----------------------------------------------------

        expiry_time = (
            attempt.started_at
            + timedelta(minutes=attempt.quiz.duration)
        )

        if timezone.now() > expiry_time:

            attempt.status = "FAILED"
            attempt.completed_at = timezone.now()
            attempt.save()

            return Response(
                {
                    "error": "Quiz time has expired.",
                    "status": "FAILED"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # Submitted answers
        # ----------------------------------------------------

        answers = request.data.get(
            "answers",
            []
        )

        correct = 0
        incorrect = 0
        unanswered = 0

        obtained_marks = 0
        total_marks = 0

        questions = Question.objects.filter(
            quiz=attempt.quiz
        )

        # ----------------------------------------------------
        # Process questions
        # ----------------------------------------------------

        for question in questions:

            total_marks += question.marks

            submitted_answer = next(
                (
                    answer
                    for answer in answers
                    if str(
                        answer.get("question_id")
                    ) == str(question.id)
                ),
                None
            )

            # ------------------------------------------------
            # Unanswered
            # ------------------------------------------------

            if not submitted_answer:

                unanswered += 1

                continue

            option_id = submitted_answer.get(
                "option_id"
            )

            option = Option.objects.filter(
                id=option_id,
                question=question
            ).first()

            if not option:

                return Response(
                    {
                        "error": (
                            f"Invalid option for "
                            f"question {question.id}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ------------------------------------------------
            # Correct / incorrect
            # ------------------------------------------------

            is_correct = option.is_correct

            Answer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=option,
                is_correct=is_correct
            )

            if is_correct:

                correct += 1
                obtained_marks += question.marks

            else:

                incorrect += 1

        # ----------------------------------------------------
        # Percentage
        # ----------------------------------------------------

        if total_marks > 0:

            percentage = (
                obtained_marks /
                total_marks
            ) * 100

        else:

            percentage = 0

        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        if percentage >= attempt.quiz.passing_percentage:

            result_status = "PASSED"

        else:

            result_status = "FAILED"

        # ----------------------------------------------------
        # Time taken
        # ----------------------------------------------------

        completed_time = timezone.now()

        time_taken = int(
            (
                completed_time -
                attempt.started_at
            ).total_seconds()
        )

        # ----------------------------------------------------
        # Save attempt
        # ----------------------------------------------------

        attempt.score = obtained_marks
        attempt.percentage = percentage
        attempt.correct_answers = correct
        attempt.incorrect_answers = incorrect
        attempt.unanswered = unanswered
        attempt.time_taken = time_taken
        attempt.status = result_status
        attempt.completed_at = completed_time

        attempt.save()

        # ----------------------------------------------------
        # Automatically create certificate
        # ----------------------------------------------------

        if attempt.status == "PASSED":

            Certificate.objects.get_or_create(
                attempt=attempt
            )

        return Response(
            AttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ATTEMPT RESULT
# ============================================================

class AttemptResultView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        if attempt.status == "IN_PROGRESS":

            return Response(
                {
                    "error": (
                        "Quiz attempt is not completed yet."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "attempt_id": attempt.id,

                "quiz_id": attempt.quiz.id,

                "quiz_title": attempt.quiz.title,

                "score": attempt.score,

                "percentage": attempt.percentage,

                "correct_answers": (
                    attempt.correct_answers
                ),

                "incorrect_answers": (
                    attempt.incorrect_answers
                ),

                "unanswered": attempt.unanswered,

                "time_taken": attempt.time_taken,

                "status": attempt.status,

                "started_at": attempt.started_at,

                "completed_at": attempt.completed_at,
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# ATTEMPT HISTORY
# ============================================================

class AttemptHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        attempts = Attempt.objects.filter(
            student=request.user
        ).exclude(
            status="IN_PROGRESS"
        ).select_related(
            "quiz"
        ).order_by(
            "-completed_at"
        )

        data = []

        for attempt in attempts:

            data.append(
                {
                    "attempt_id": attempt.id,

                    "quiz_id": attempt.quiz.id,

                    "quiz_title": attempt.quiz.title,

                    "score": attempt.score,

                    "percentage": attempt.percentage,

                    "correct_answers": (
                        attempt.correct_answers
                    ),

                    "incorrect_answers": (
                        attempt.incorrect_answers
                    ),

                    "unanswered": attempt.unanswered,

                    "time_taken": attempt.time_taken,

                    "status": attempt.status,

                    "completed_at": (
                        attempt.completed_at
                    ),
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ANSWER REVIEW
# ============================================================

class AnswerReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):

        attempt = get_object_or_404(
            Attempt,
            id=attempt_id,
            student=request.user
        )

        if attempt.status == "IN_PROGRESS":

            return Response(
                {
                    "error": (
                        "Quiz attempt is not completed yet."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = Answer.objects.filter(
            attempt=attempt
        ).select_related(
            "question",
            "selected_option"
        )

        review = []

        for answer in answers:

            correct_option = Option.objects.filter(
                question=answer.question,
                is_correct=True
            ).first()

            review.append(
                {
                    "question_id": answer.question.id,

                    "question": (
                        answer.question.question_text
                    ),

                    "selected_option": (
                        answer.selected_option.option_text
                    ),

                    "correct_option": (
                        correct_option.option_text
                        if correct_option
                        else None
                    ),

                    "is_correct": answer.is_correct,

                    "explanation": (
                        answer.question.explanation
                    ),

                    "marks": answer.question.marks,
                }
            )

        return Response(
            {
                "attempt_id": attempt.id,

                "quiz_id": attempt.quiz.id,

                "quiz_title": attempt.quiz.title,

                "review": review,
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# LEADERBOARD
# ============================================================

class LeaderboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        leaderboard = (
            Attempt.objects
            .filter(
                status__in=[
                    "PASSED",
                    "FAILED"
                ]
            )
            .values(
                "student_id",
                "student__username"
            )
            .annotate(
                quizzes_attempted=Count("id"),

                quizzes_passed=Count(
                    "id",
                    filter=models.Q(
                        status="PASSED"
                    )
                ),

                average_percentage=Avg(
                    "percentage"
                ),

                highest_percentage=Max(
                    "percentage"
                ),
            )
            .order_by(
                "-average_percentage",
                "-highest_percentage"
            )
        )

        data = []

        for rank, student in enumerate(
            leaderboard,
            start=1
        ):

            data.append(
                {
                    "rank": rank,

                    "student_id": (
                        student["student_id"]
                    ),

                    "username": (
                        student["student__username"]
                    ),

                    "quizzes_attempted": (
                        student["quizzes_attempted"]
                    ),

                    "quizzes_passed": (
                        student["quizzes_passed"]
                    ),

                    "average_percentage": round(
                        float(
                            student[
                                "average_percentage"
                            ] or 0
                        ),
                        2
                    ),

                    "highest_percentage": round(
                        float(
                            student[
                                "highest_percentage"
                            ] or 0
                        ),
                        2
                    ),
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ADMIN ATTEMPT LIST
# ============================================================

class AdminAttemptListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        attempts = (
            Attempt.objects
            .filter(
                status__in=[
                    "PASSED",
                    "FAILED"
                ]
            )
            .select_related(
                "student",
                "quiz"
            )
            .order_by(
                "-completed_at"
            )
        )

        data = []

        for attempt in attempts:

            data.append(
                {
                    "attempt_id": attempt.id,

                    "student_id": (
                        attempt.student.id
                    ),

                    "student_username": (
                        attempt.student.username
                    ),

                    "quiz_id": (
                        attempt.quiz.id
                    ),

                    "quiz_title": (
                        attempt.quiz.title
                    ),

                    "score": attempt.score,

                    "percentage": attempt.percentage,

                    "correct_answers": (
                        attempt.correct_answers
                    ),

                    "incorrect_answers": (
                        attempt.incorrect_answers
                    ),

                    "unanswered": (
                        attempt.unanswered
                    ),

                    "time_taken": (
                        attempt.time_taken
                    ),

                    "status": attempt.status,

                    "started_at": (
                        attempt.started_at
                    ),

                    "completed_at": (
                        attempt.completed_at
                    ),
                }
            )

        return Response(
            data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ADMIN ATTEMPT DETAIL
# ============================================================

class AdminAttemptDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):

        if request.user.role != "ADMIN":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        attempt = get_object_or_404(
            Attempt.objects.select_related(
                "student",
                "quiz"
            ),
            id=attempt_id
        )

        return Response(
            {
                "attempt_id": attempt.id,

                "student_id": attempt.student.id,

                "student_username": (
                    attempt.student.username
                ),

                "student_email": (
                    attempt.student.email
                ),

                "quiz_id": attempt.quiz.id,

                "quiz_title": (
                    attempt.quiz.title
                ),

                "score": attempt.score,

                "percentage": attempt.percentage,

                "correct_answers": (
                    attempt.correct_answers
                ),

                "incorrect_answers": (
                    attempt.incorrect_answers
                ),

                "unanswered": attempt.unanswered,

                "time_taken": attempt.time_taken,

                "status": attempt.status,

                "started_at": attempt.started_at,

                "completed_at": (
                    attempt.completed_at
                ),
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# PROFESSIONAL CERTIFICATE
# ============================================================

class CertificateDownloadView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):

        # ====================================================
        # GET PASSED ATTEMPT
        # ====================================================

        attempt = get_object_or_404(
            Attempt.objects.select_related(
                "student",
                "quiz",
                "quiz__category"
            ),
            id=attempt_id,
            student=request.user,
            status="PASSED"
        )

        # ====================================================
        # CERTIFICATE
        # ====================================================

        certificate, created = Certificate.objects.get_or_create(
            attempt=attempt
        )

        # ====================================================
        # PAGE SIZE
        # ====================================================

        PAGE_WIDTH = 1536
        PAGE_HEIGHT = 1024

        buffer = BytesIO()

        pdf = canvas.Canvas(
            buffer,
            pagesize=(PAGE_WIDTH, PAGE_HEIGHT)
        )

        # ====================================================
        # COLORS
        # ====================================================

        NAVY = (
            12 / 255,
            32 / 255,
            67 / 255
        )

        DARK_NAVY = (
            7 / 255,
            24 / 255,
            52 / 255
        )

        GOLD = (
            196 / 255,
            137 / 255,
            35 / 255
        )

        LIGHT_GOLD = (
            235 / 255,
            205 / 255,
            135 / 255
        )

        GREEN = (
            24 / 255,
            135 / 255,
            75 / 255
        )

        DARK = (
            35 / 255,
            42 / 255,
            55 / 255
        )

        WHITE = (
            1,
            1,
            1
        )

        CREAM = (
            0.985,
            0.975,
            0.945
        )

        # ====================================================
        # BACKGROUND
        # ====================================================

        pdf.setFillColorRGB(*CREAM)

        pdf.rect(
            0,
            0,
            PAGE_WIDTH,
            PAGE_HEIGHT,
            fill=1,
            stroke=0
        )

        # ====================================================
        # OUTER NAVY BORDER
        # ====================================================

        pdf.setStrokeColorRGB(*NAVY)
        pdf.setLineWidth(12)

        pdf.rect(
            18,
            18,
            PAGE_WIDTH - 36,
            PAGE_HEIGHT - 36,
            fill=0,
            stroke=1
        )

        # ====================================================
        # INNER GOLD BORDER
        # ====================================================

        pdf.setStrokeColorRGB(*GOLD)
        pdf.setLineWidth(3)

        pdf.rect(
            35,
            35,
            PAGE_WIDTH - 70,
            PAGE_HEIGHT - 70,
            fill=0,
            stroke=1
        )

        # ====================================================
        # DECORATIVE NAVY LEFT PANEL
        # ====================================================

        pdf.setFillColorRGB(*NAVY)

        pdf.roundRect(
            -180,
            -150,
            410,
            1320,
            220,
            fill=1,
            stroke=0
        )

        # ====================================================
        # DECORATIVE GOLD CURVE
        # ====================================================

        pdf.setStrokeColorRGB(*GOLD)
        pdf.setLineWidth(14)

        path = pdf.beginPath()

        path.moveTo(80, -30)
        path.curveTo(
            40,
            280,
            180,
            610,
            470,
            1040
        )

        pdf.drawPath(
            path,
            stroke=1,
            fill=0
        )

        # ====================================================
        # SECOND GOLD CURVE
        # ====================================================

        pdf.setStrokeColorRGB(*LIGHT_GOLD)
        pdf.setLineWidth(5)

        path = pdf.beginPath()

        path.moveTo(115, -20)
        path.curveTo(
            80,
            300,
            220,
            650,
            510,
            1040
        )

        pdf.drawPath(
            path,
            stroke=1,
            fill=0
        )

        # ====================================================
        # TOP RIGHT GOLD DECORATION
        # ====================================================

        pdf.setFillColorRGB(*GOLD)

        pdf.roundRect(
            1210,
            875,
            250,
            100,
            20,
            fill=1,
            stroke=0
        )

        # Decorative dots

        pdf.setFillColorRGB(*WHITE)

        for row in range(4):

            for col in range(8):

                x = 1250 + col * 25
                y = 900 + row * 18

                pdf.circle(
                    x,
                    y,
                    2,
                    fill=1,
                    stroke=0
                )

        # ====================================================
        # MEDAL / SEAL
        # ====================================================

        medal_x = 145
        medal_y = 760

        # Ribbon

        pdf.setFillColorRGB(*GOLD)

        pdf.rect(
            medal_x - 28,
            medal_y + 80,
            56,
            160,
            fill=1,
            stroke=0
        )

        pdf.setFillColorRGB(*LIGHT_GOLD)

        pdf.rect(
            medal_x + 8,
            medal_y + 80,
            20,
            160,
            fill=1,
            stroke=0
        )

        # Outer medal

        pdf.setFillColorRGB(*GOLD)

        pdf.circle(
            medal_x,
            medal_y,
            92,
            fill=1,
            stroke=0
        )

        # Inner medal

        pdf.setFillColorRGB(*NAVY)

        pdf.circle(
            medal_x,
            medal_y,
            76,
            fill=1,
            stroke=0
        )

        # Stars

        pdf.setFillColorRGB(*LIGHT_GOLD)

        pdf.setFont(
            "Helvetica-Bold",
            24
        )

        pdf.drawCentredString(
            medal_x,
            medal_y + 35,
            "★ ★ ★"
        )

        pdf.setFont(
            "Helvetica-Bold",
            17
        )

        pdf.drawCentredString(
            medal_x,
            medal_y - 5,
            "WELL DONE!"
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawCentredString(
            medal_x,
            medal_y - 28,
            "KEEP LEARNING"
        )

        pdf.drawCentredString(
            medal_x,
            medal_y - 42,
            "KEEP GROWING"
        )

        # ====================================================
        # QUIZMASTER HEADER
        # ====================================================

        pdf.setFillColorRGB(*NAVY)

        pdf.setFont(
            "Helvetica-Bold",
            40
        )

        pdf.drawCentredString(
            820,
            915,
            "QUIZMASTER"
        )

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica",
            14
        )

        pdf.drawCentredString(
            820,
            890,
            "QUIZ & ASSESSMENT PLATFORM"
        )

        pdf.setStrokeColorRGB(*GOLD)
        pdf.setLineWidth(2)

        pdf.line(
            650,
            865,
            990,
            865
        )

        # ====================================================
        # CERTIFICATE TITLE
        # ====================================================

        pdf.setFillColorRGB(*NAVY)

        pdf.setFont(
            "Helvetica-Bold",
            66
        )

        pdf.drawCentredString(
            850,
            770,
            "CERTIFICATE"
        )

        pdf.setFillColorRGB(*GOLD)

        pdf.setFont(
            "Helvetica-Bold",
            36
        )

        pdf.drawCentredString(
            850,
            720,
            "OF ACHIEVEMENT"
        )

        pdf.setStrokeColorRGB(*GOLD)
        pdf.setLineWidth(2)

        pdf.line(
            570,
            695,
            1130,
            695
        )

        # ====================================================
        # PRESENTED TO
        # ====================================================

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica",
            18
        )

        pdf.drawCentredString(
            850,
            650,
            "This certificate is proudly presented to"
        )

        # ====================================================
        # STUDENT NAME
        # ====================================================

        student_name = (
            f"{attempt.student.first_name} "
            f"{attempt.student.last_name}"
        ).strip()

        if not student_name:
            student_name = attempt.student.username

        student_name = student_name.title()

        # Try Windows cursive fonts.

        cursive_font = "Helvetica"

        cursive_fonts = [
            r"C:\Windows\Fonts\segoesc.ttf",
            r"C:\Windows\Fonts\segoepr.ttf",
            r"C:\Windows\Fonts\BRUSHSCI.TTF",
        ]

        for font_path in cursive_fonts:

            if os.path.exists(font_path):

                try:

                    pdfmetrics.registerFont(
                        TTFont(
                            "CertificateCursive",
                            font_path
                        )
                    )

                    cursive_font = "CertificateCursive"

                    break

                except Exception:

                    pass

        pdf.setFillColorRGB(*NAVY)

        pdf.setFont(
            cursive_font,
            55
        )

        pdf.drawCentredString(
            850,
            565,
            student_name
        )

        pdf.setStrokeColorRGB(*GOLD)
        pdf.setLineWidth(2)

        pdf.line(
            560,
            535,
            1140,
            535
        )

        # ====================================================
        # DESCRIPTION
        # ====================================================

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica",
            18
        )

        pdf.drawCentredString(
            850,
            490,
            "for successfully completing the assessment"
        )

        # ====================================================
        # QUIZ INFORMATION
        # ====================================================

        quiz_title = attempt.quiz.title

        category_name = "General"

        if attempt.quiz.category:

            category_name = attempt.quiz.category.name

        # ====================================================
        # QUIZ RIBBON
        # ====================================================

        ribbon_x = 570
        ribbon_y = 410
        ribbon_width = 560
        ribbon_height = 58

        pdf.setFillColorRGB(*NAVY)

        pdf.rect(
            ribbon_x,
            ribbon_y,
            ribbon_width,
            ribbon_height,
            fill=1,
            stroke=0
        )

        # Left ribbon tail

        pdf.setFillColorRGB(*GOLD)

        left_path = pdf.beginPath()

        left_path.moveTo(
            ribbon_x,
            ribbon_y
        )

        left_path.lineTo(
            ribbon_x - 32,
            ribbon_y + 29
        )

        left_path.lineTo(
            ribbon_x,
            ribbon_y + ribbon_height
        )

        left_path.close()

        pdf.drawPath(
            left_path,
            fill=1,
            stroke=0
        )

        # Right ribbon tail

        right_path = pdf.beginPath()

        right_path.moveTo(
            ribbon_x + ribbon_width,
            ribbon_y
        )

        right_path.lineTo(
            ribbon_x + ribbon_width + 32,
            ribbon_y + 29
        )

        right_path.lineTo(
            ribbon_x + ribbon_width,
            ribbon_y + ribbon_height
        )

        right_path.close()

        pdf.drawPath(
            right_path,
            fill=1,
            stroke=0
        )

        pdf.setFillColorRGB(*WHITE)

        pdf.setFont(
            "Helvetica-Bold",
            24
        )

        pdf.drawCentredString(
            850,
            429,
            quiz_title.upper()
        )

        # ====================================================
        # CATEGORY
        # ====================================================

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica",
            17
        )

        pdf.drawCentredString(
            850,
            385,
            f"Category: {category_name}"
        )

        # ====================================================
        # PERFORMANCE DATA
        # ====================================================

        percentage = float(
            attempt.percentage or 0
        )

        hours = attempt.time_taken // 3600

        minutes = (
            attempt.time_taken % 3600
        ) // 60

        seconds = (
            attempt.time_taken % 60
        )

        time_taken = (
            f"{hours:02d}:"
            f"{minutes:02d}:"
            f"{seconds:02d}"
        )

        # ====================================================
        # PERFORMANCE PANEL
        # ====================================================

        panel_x = 420
        panel_y = 235
        panel_width = 860
        panel_height = 105

        pdf.setFillColorRGB(
            1,
            1,
            1
        )

        pdf.roundRect(
            panel_x,
            panel_y,
            panel_width,
            panel_height,
            20,
            fill=1,
            stroke=0
        )

        pdf.setStrokeColorRGB(*GOLD)
        pdf.setLineWidth(2)

        pdf.roundRect(
            panel_x,
            panel_y,
            panel_width,
            panel_height,
            20,
            fill=0,
            stroke=1
        )

        column = panel_width / 3

        pdf.setStrokeColorRGB(*LIGHT_GOLD)
        pdf.setLineWidth(1)

        pdf.line(
            panel_x + column,
            panel_y + 18,
            panel_x + column,
            panel_y + panel_height - 18
        )

        pdf.line(
            panel_x + column * 2,
            panel_y + 18,
            panel_x + column * 2,
            panel_y + panel_height - 18
        )

        # ====================================================
        # SCORE
        # ====================================================

        score_x = panel_x + column / 2

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica-Bold",
            12
        )

        pdf.drawCentredString(
            score_x,
            300,
            "FINAL SCORE"
        )

        pdf.setFillColorRGB(*GREEN)

        pdf.setFont(
            "Helvetica-Bold",
            25
        )

        pdf.drawCentredString(
            score_x,
            265,
            f"{percentage:.2f}%"
        )

        # ====================================================
        # RESULT
        # ====================================================

        result_x = (
            panel_x +
            column +
            column / 2
        )

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica-Bold",
            12
        )

        pdf.drawCentredString(
            result_x,
            300,
            "RESULT"
        )

        pdf.setFillColorRGB(*GREEN)

        pdf.setFont(
            "Helvetica-Bold",
            14
        )

        pdf.drawCentredString(
            result_x,
            278,
            "SUCCESSFULLY"
        )

        pdf.drawCentredString(
            result_x,
            258,
            "PASSED"
        )

        # ====================================================
        # TIME
        # ====================================================

        time_x = (
            panel_x +
            column * 2 +
            column / 2
        )

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica-Bold",
            12
        )

        pdf.drawCentredString(
            time_x,
            300,
            "TIME TAKEN"
        )

        pdf.setFillColorRGB(*NAVY)

        pdf.setFont(
            "Helvetica-Bold",
            23
        )

        pdf.drawCentredString(
            time_x,
            265,
            time_taken
        )

        # ====================================================
        # CERTIFICATE INFORMATION
        # ====================================================

        if attempt.completed_at:

            year = attempt.completed_at.year

            completion_date = (
                attempt.completed_at.strftime(
                    "%d %B %Y"
                )
            )

        else:

            year = timezone.now().year

            completion_date = (
                timezone.now().strftime(
                    "%d %B %Y"
                )
            )

        certificate_id = (
            f"QM-{year}-{attempt.id:06d}"
        )

        # ====================================================
        # CERTIFICATE ID
        # ====================================================

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            390,
            145,
            "CERTIFICATE ID"
        )

        pdf.setFont(
            "Helvetica",
            13
        )

        pdf.drawString(
            390,
            123,
            certificate_id
        )

        # ====================================================
        # DATE
        # ====================================================

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            700,
            145,
            "DATE OF COMPLETION"
        )

        pdf.setFont(
            "Helvetica",
            13
        )

        pdf.drawString(
            700,
            123,
            completion_date
        )

        # ====================================================
        # SIGNATURE
        # ====================================================

        pdf.setStrokeColorRGB(*NAVY)
        pdf.setLineWidth(1)

        pdf.line(
            1040,
            145,
            1200,
            145
        )

        pdf.setFillColorRGB(*NAVY)

        pdf.setFont(
            "Helvetica-Bold",
            11
        )

        pdf.drawCentredString(
            1120,
            123,
            "QUIZMASTER"
        )

        pdf.setFillColorRGB(*DARK)

        pdf.setFont(
            "Helvetica",
            9
        )

        pdf.drawCentredString(
            1120,
            107,
            "Authorized Signature"
        )

        # ====================================================
        # DECORATIVE BOTTOM STARS
        # ====================================================

        pdf.setFillColorRGB(*GOLD)

        pdf.setFont(
            "Helvetica-Bold",
            22
        )

        pdf.drawCentredString(
            820,
            65,
            "★  ★  ★  ★  ★"
        )

        # ====================================================
        # FINISH
        # ====================================================

        pdf.showPage()

        pdf.save()

        buffer.seek(0)

        filename = (
            f"QuizMaster-Certificate-{attempt.id}.pdf"
        )

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=filename,
            content_type="application/pdf"
        )
