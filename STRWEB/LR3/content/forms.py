from django import forms

from .models import Review, Article, Slider


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ["text", "rating"]
        widgets = {
            "text": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 5,
                    "placeholder": "Напишите ваш отзыв здесь...",
                }
            ),
            "rating": forms.Select(attrs={"class": "form-control"}),
        }
        labels = {"text": "Текст отзыва", "rating": "Оценка"}
        help_texts = {"rating": "Выберите оценку от 1 до 5, где 5 - отлично"}


class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ["title", "summary", "content", "image", "published"]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "summary": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 10}),
            "image": forms.FileInput(attrs={"class": "form-control"}),
            "published": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }


class SliderForm(forms.ModelForm):
    class Meta:
        model = Slider
        fields = ["autoplay", "autoplay_speed", "arrows", "dots"]
        widgets = {
            "autoplay": forms.CheckboxInput(attrs={"class": ""}),
            "autoplay_speed": forms.NumberInput(),
            "arrows": forms.CheckboxInput(attrs={"class": ""}),
            "dots": forms.CheckboxInput(attrs={"class": ""}),
        }
        labels = {
            "autoplay": "Автоматическая прокрутка",
            "autoplay_speed": "Скорость автоматической прокрутки (в мс)",
            "arrows": "Показывать стрелки",
            "dots": "Показывать точки",
        }
