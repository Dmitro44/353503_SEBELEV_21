def user_role(request):
    context = {}
    if request.user.is_authenticated:
        try:
            context['is_staff_user'] = request.user.has_role('staff')
            context['is_admin_user'] = request.user.has_role('admin')
        except:
            context['is_staff_user'] = False
            context['is_admin_user'] = False
    return context