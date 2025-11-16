from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter(name='linestolist')
def linestolist(value):
    """
    Преобразует многострочный текст в HTML-список ul/li.
    Каждая строка текста становится элементом списка li.
    """
    if not value:
        return ""
    
    # Разбиваем строку по символу новой строки и убираем пустые строки
    lines = [line.strip() for line in value.strip().split('\n') if line.strip()]
    
    # Формируем HTML-элементы списка
    list_items = "".join([f"<li>{line}</li>" for line in lines])
    
    # Возвращаем готовый HTML-список, помеченный как "безопасный"
    return mark_safe(f"<ul>{list_items}</ul>")

