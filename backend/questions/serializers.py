from rest_framework import serializers
from .models import Question, Option


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = [
            "id",
            "option_text",
            "is_correct",
        ]


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "explanation",
            "marks",
            "difficulty",
            "options",
        ]

    def create(self, validated_data):
        options_data = validated_data.pop(
            "options",
            []
        )

        question = Question.objects.create(
            **validated_data
        )

        for option_data in options_data:
            Option.objects.create(
                question=question,
                **option_data
            )

        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop(
            "options",
            None
        )

        instance.question_text = validated_data.get(
            "question_text",
            instance.question_text
        )

        instance.explanation = validated_data.get(
            "explanation",
            instance.explanation
        )

        instance.marks = validated_data.get(
            "marks",
            instance.marks
        )

        instance.difficulty = validated_data.get(
            "difficulty",
            instance.difficulty
        )

        instance.save()

        if options_data is not None:

            instance.options.all().delete()

            for option_data in options_data:
                Option.objects.create(
                    question=instance,
                    **option_data
                )

        return instance