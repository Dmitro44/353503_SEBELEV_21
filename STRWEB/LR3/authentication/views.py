from django.shortcuts import redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib import messages
from django.views import View
from django.views.generic import UpdateView
from django.views.generic.edit import FormView
from django.views.generic.base import TemplateView
from rest_framework.reverse import reverse_lazy

from users.models import User
from .forms import RegisterForm, LoginForm, ProfileForm

import logging
logger = logging.getLogger(__name__)


class RegisterView(FormView):
    template_name = 'carrental/auth/register.html'
    form_class = RegisterForm
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        user = form.save(commit=False)
        user.role = 'client'
        user.save()
        login(self.request, user)
        messages.success(self.request, 'Регистрация успешно завершена!')
        logger.info(f"User registered: {user.username} (ID: {user.id}), DOB: {user.date_of_birth}, Role: {user.role}")
        return super().form_valid(form)


class LoginView(FormView):
    template_name = 'carrental/auth/login.html'
    form_class = LoginForm

    def form_valid(self, form):
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user = authenticate(username=username, password=password)
        if user:
            login(self.request, user)
            messages.success(self.request, f'Добро пожаловать, {user.username}!')
            logger.info(f"User logged in: {user.username} (ID: {user.id})")
            next_url = self.request.GET.get('next', 'home')
            return redirect(next_url)
        else:
            messages.error(self.request, 'Неверное имя пользователя или пароль')
            logger.warning(f"Failed login attempt for username: {username}")
            return self.form_invalid(form)


class LogoutView(View):
    @method_decorator(login_required)
    def get(self, request):
        username = request.user.username
        user_id = request.user.id
        logout(request)
        messages.info(request, 'Вы вышли из системы')
        logger.info(f"User logged out: {username} (ID: {user_id})")
        return redirect('home')


class ProfileView(FormView):
    template_name = 'carrental/auth/profile.html'
    form_class = ProfileForm
    success_url = reverse_lazy('profile')

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['instance'] = self.request.user
        return kwargs

    def form_valid(self, form):
        form.save()
        messages.success(self.request, 'Ваш профиль успешно обновлён!')
        logger.info(f"User profile updated: {self.request.user.username} (ID: {self.request.user.id})")
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'Исправьте ошибки в форме.')
        return super().form_invalid(form)
