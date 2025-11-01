from .models import CompanyInfo

def company_info(request):
    try:
        info = CompanyInfo.objects.first()
    except CompanyInfo.DoesNotExist:
        info = None
    return {'company_info': info}