import calendar
from datetime import datetime
from django.utils.safestring import mark_safe

class Calendar(calendar.HTMLCalendar):
    def formatday(self, day, weekday):
        if day == 0:
            return '<td class="noday">&nbsp;</td>'  # day outside month
        else:
            return f'<td class="{self.cssclasses[weekday]}">{day}</td>'

def create_html_calendar():
    """
    Generates an HTML calendar for the current month.
    """
    now = datetime.now()
    cal = Calendar().formatmonth(now.year, now.month)
    return mark_safe(cal)