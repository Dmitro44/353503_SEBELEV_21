from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect


def staff_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Вам необходимо войти в систему для доступа к этой странице.')
            return redirect('login')

        try:
            if request.user.has_role('staff') or request.user.has_role('admin'):
                return view_func(request, *args, **kwargs)
            else:
                messages.error(request, 'У вас нет прав для выполнения этого действия. Необходимы права сотрудника.')
                return redirect('vehicle_list')
        finally:
            print('ab')

    return _wrapped_view