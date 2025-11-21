# authentication/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from django.utils import timezone

from users.models import User


class RegisterForm(UserCreationForm):
    username = forms.CharField(required=True, label='Имя пользователя')
    email = forms.EmailField(required=True, label='Email')
    date_of_birth = forms.DateField(
        required=True,
        label='Дата рождения',
        widget=forms.DateInput(attrs={'type': 'date'}),
        help_text='Вам должно быть не менее 18 лет для регистрации.'
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'middle_name', 'date_of_birth', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['password1'].label = 'Пароль'
        self.fields['password2'].label = 'Подтверждение пароля'
        self.fields['first_name'].label = 'Имя'
        self.fields['first_name'].required = True
        self.fields['last_name'].label = 'Фамилия'
        self.fields['last_name'].required = True
        self.fields['middle_name'].label = 'Отчество'

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'

    def clean_date_of_birth(self):
        dob = self.cleaned_data.get('date_of_birth')
        if dob:
            today = timezone.now().date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 18:
                raise ValidationError('Вам должно быть не менее 18 лет для регистрации.')
        return dob


class LoginForm(forms.Form):
    username = forms.CharField(required=True, label='Имя пользователя')
    password = forms.CharField(widget=forms.PasswordInput, label='Пароль')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Добавляем классы Bootstrap к полям
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'


class ProfileForm(forms.ModelForm):

    class Meta:
        model = User
        fields = ('username', 'email', 'last_name', 'first_name', 'middle_name', 'address', 'phone')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Добавляем классы Bootstrap к полям
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
