import logging

import requests
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy, reverse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import (
    ListView,
    DetailView,
    TemplateView,
    CreateView,
    UpdateView,
    DeleteView,
)

from authentication.decorators import staff_required
from vehicles.models import Vehicle
from .forms import ReviewForm, ArticleForm, SliderForm
from .models import (
    Article,
    CompanyInfo,
    Review,
    Contact,
    Partner,
    GlossaryEntry,
    Vacancy,
    Banner,
    Slider,
)
from .utils import create_html_calendar

# Set up logging
logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    template_name = "content/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["banners"] = Banner.objects.filter(is_active=True)
        context["calendar"] = create_html_calendar()

        try:
            context["slider_settings"] = Slider.objects.first()
        except Slider.DoesNotExist:
            context["slider_settings"] = None

        # Get the latest published article
        try:
            latest_article = Article.objects.filter(published=True).latest(
                "published_at"
            )
            context["latest_article"] = latest_article
            logger.info(
                f"Latest article displayed on home page: {latest_article.title}"
            )
        except Article.DoesNotExist:
            context["latest_article"] = None
            logger.warning("No published articles available for home page")

        # Get partners
        context["partners"] = Partner.objects.all()

        # Get latest vehicles
        context["vehicles"] = Vehicle.objects.filter(is_available=True).order_by("-id")[
            :3
        ]

        # Получаем данные из сессии, если они там есть
        joke_setup = self.request.session.get("joke_setup")
        joke_punchline = self.request.session.get("joke_punchline")
        cat_fact = self.request.session.get("cat_fact")

        # Если в запросе указано обновить факт о котах или фактов нет в сессии
        if "refresh_cat_fact" in self.request.GET or not cat_fact:
            try:
                cat_fact_response = requests.get(
                    "https://catfact.ninja/fact", timeout=5
                )
                if cat_fact_response.status_code == 200:
                    cat_fact = cat_fact_response.json().get("fact")
                    # Сохраняем в сессию
                    self.request.session["cat_fact"] = cat_fact
                else:
                    cat_fact = "Не удалось загрузить факт о кошках."
            except Exception as e:
                logger.error(f"Error fetching cat fact: {str(e)}")
                cat_fact = "Не удалось загрузить факт о кошках."

        # Если в запросе указано получить новую шутку или шутки нет в сессии
        if "get_joke" in self.request.GET or (not joke_setup and not joke_punchline):
            try:
                joke_response = requests.get(
                    "https://official-joke-api.appspot.com/random_joke", timeout=5
                )
                if joke_response.status_code == 200:
                    joke_data = joke_response.json()
                    joke_setup = joke_data.get("setup")
                    joke_punchline = joke_data.get("punchline")
                    # Сохраняем в сессию
                    self.request.session["joke_setup"] = joke_setup
                    self.request.session["joke_punchline"] = joke_punchline
                else:
                    joke_setup = "Не удалось загрузить шутку."
                    joke_punchline = "Попробуйте еще раз позже."
            except Exception as e:
                logger.error(f"Error fetching joke: {str(e)}")
                joke_setup = "Ошибка при получении шутки."
                joke_punchline = "Попробуйте еще раз позже."

        # Добавляем данные в контекст
        context["joke_setup"] = joke_setup
        context["joke_punchline"] = joke_punchline
        context["cat_fact"] = cat_fact

        return context


class AboutView(TemplateView):
    template_name = "content/about.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        try:
            company_info = CompanyInfo.objects.first()
            context["company_info"] = company_info
            logger.info("Company information displayed on about page")
        except CompanyInfo.DoesNotExist:
            context["company_info"] = None
            logger.warning("No company information available for about page")

        return context


class NewsListView(ListView):
    model = Article
    template_name = "content/news_list.html"
    context_object_name = "articles"
    paginate_by = 10

    def get_queryset(self):
        queryset = Article.objects.filter(published=True).order_by("-published_at")
        logger.info(f"News list displayed with {queryset.count()} articles")
        return queryset


class NewsDetailView(DetailView):
    model = Article
    template_name = "content/news_detail.html"
    context_object_name = "article"

    def get_queryset(self):
        return Article.objects.filter(published=True)

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        logger.info(f"Article viewed: {obj.title}")
        return obj


@method_decorator(staff_required, name="dispatch")
class ArticleCreateView(CreateView):
    model = Article
    form_class = ArticleForm
    template_name = "content/news_form.html"
    success_url = reverse_lazy("news_list")

    def form_valid(self, form):
        form.instance.author = self.request.user
        form.instance.published_at = timezone.now() if form.instance.published else None
        messages.success(
            self.request, f"Новость '{form.instance.title}' успешно создана"
        )
        logger.info(f"Article created: {form.instance.title} by {self.request.user}")
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Добавление новости"
        return context


@method_decorator(staff_required, name="dispatch")
class ArticleUpdateView(UpdateView):
    model = Article
    form_class = ArticleForm
    template_name = "content/news_form.html"

    def get_success_url(self):
        return reverse_lazy("news_detail", kwargs={"pk": self.object.pk})

    def form_valid(self, form):
        # Если статус публикации меняется на "опубликовано"
        if (
            form.instance.published
            and not Article.objects.get(pk=form.instance.pk).published
        ):
            form.instance.published_at = timezone.now()

        messages.success(
            self.request, f"Новость '{form.instance.title}' успешно обновлена"
        )
        logger.info(f"Article updated: {form.instance.title} by {self.request.user}")
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Редактирование новости"
        return context


@method_decorator(staff_required, name="dispatch")
class ArticleDeleteView(DeleteView):
    model = Article
    template_name = "content/news_confirm_delete.html"
    success_url = reverse_lazy("news_list")

    def delete(self, request, *args, **kwargs):
        article = self.get_object()
        messages.success(request, f"Новость '{article.title}' успешно удалена")
        logger.info(f"Article deleted: {article.title} by {request.user}")
        return super().delete(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Удаление новости"
        return context


class ReviewListView(ListView):
    model = Review
    template_name = "content/review_list.html"
    context_object_name = "reviews"
    paginate_by = 10

    def get_queryset(self):
        queryset = Review.objects.filter(approved=True).order_by("-created_at")
        logger.info(f"Review list displayed with {queryset.count()} reviews")
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        approved_reviews = Review.objects.filter(approved=True)

        # Add average rating
        avg_rating = approved_reviews.aggregate(Avg("rating"))
        context["avg_rating"] = avg_rating["rating__avg"]

        # Add rating counts
        rating_counts = (
            approved_reviews.values("rating")
            .annotate(count=Count("rating"))
            .order_by("-rating")
        )
        context["rating_counts"] = rating_counts

        # Add total review count for the progress bar calculation
        total_reviews = approved_reviews.count()
        context["total_reviews"] = total_reviews

        return context


@method_decorator(login_required, name="dispatch")
class ReviewCreateView(CreateView):
    model = Review
    form_class = ReviewForm
    template_name = "content/review_form.html"
    success_url = reverse_lazy("review_list")

    def form_valid(self, form):
        form.instance.user = self.request.user
        response = super().form_valid(form)
        messages.success(
            self.request, "Спасибо за ваш отзыв! Он будет опубликован после проверки."
        )
        logger.info(f"Review submitted by {self.request.user.username}")
        return response


@method_decorator(staff_required, name="dispatch")
class ReviewManagementView(ListView):
    model = Review
    template_name = "content/review_management.html"
    context_object_name = "reviews"

    def get_queryset(self):
        # Получаем все отзывы, включая неподтвержденные
        queryset = Review.objects.all().order_by("-created_at")

        # Добавляем возможность фильтрации
        approved_filter = self.request.GET.get("approved")
        if approved_filter == "true":
            queryset = queryset.filter(approved=True)
        elif approved_filter == "false":
            queryset = queryset.filter(approved=False)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["approved_filter"] = self.request.GET.get("approved", "")
        context["pending_count"] = Review.objects.filter(approved=False).count()
        return context


@method_decorator(staff_required, name="dispatch")
class ReviewApproveView(View):
    def post(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        action = request.POST.get("action")

        if action == "approve":
            review.approved = True
            review.save()
            messages.success(
                request, f"Отзыв пользователя {review.user.username} успешно одобрен"
            )
            logger.info(f"Staff {request.user.username} approved review #{review.pk}")

        elif action == "reject":
            review.delete()  # Удаляем отзыв или можно добавить поле rejected=True и сохранять
            messages.warning(
                request, f"Отзыв пользователя {review.user.username} отклонен"
            )
            logger.info(f"Staff {request.user.username} rejected review #{review.pk}")

        next_url = request.POST.get("next", reverse("review_management"))
        return redirect(next_url)


class ContactsView(View):
    template_name = "content/contacts.html"

    def get(self, request):
        # Получаем всех контактных лиц, отсортированных по порядку и имени
        contacts = Contact.objects.all().order_by("order", "last_name", "first_name")

        # Получаем информацию о компании (предполагая, что она существует)
        try:
            company_info = CompanyInfo.objects.first()
        except CompanyInfo.DoesNotExist:
            company_info = None

        context = {"contacts": contacts, "company_info": company_info}

        return render(request, self.template_name, context)


class EmployeeContactsTableView(ListView):
    model = Contact
    template_name = "content/employee_contacts_table.html"
    context_object_name = "employees"
    paginate_by = 3

    def get_queryset(self):
        # Initial queryset, can be extended with sorting and filtering later
        return Contact.objects.all().order_by("last_name", "first_name")


class GlossaryView(ListView):
    model = GlossaryEntry
    template_name = "content/glossary.html"
    context_object_name = "entries"

    def get_queryset(self):
        return GlossaryEntry.objects.all().order_by("created_at")


class PrivacyPolicyView(TemplateView):
    template_name = "content/privacy_policy.html"


class VacancyListView(ListView):
    model = Vacancy
    template_name = "content/vacancy_list.html"
    context_object_name = "vacancies"

    def get_queryset(self):
        return Vacancy.objects.filter(is_active=True)


@method_decorator(staff_required, name="dispatch")
class SliderSettingsView(UpdateView):
    model = Slider
    form_class = SliderForm
    template_name = "content/slider_settings.html"
    success_url = reverse_lazy("home")

    def get_object(self, queryset=None):
        slider, created = Slider.objects.get_or_create(pk=1)
        return slider

    def form_valid(self, form):
        messages.success(self.request, "Настройки слайдера успешно обновлены")
        return super().form_valid(form)

