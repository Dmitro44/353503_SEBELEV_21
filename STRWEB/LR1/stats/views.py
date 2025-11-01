# statistics/views.py
import base64
import io
from datetime import datetime, timedelta

import matplotlib.pyplot as plt
import numpy as np
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

from authentication.decorators import staff_required
from rentals.models import Rental


@method_decorator(staff_required, name='dispatch')
class StatisticsDashboardView(TemplateView):
    template_name = 'statistics/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Создаем графики с помощью Matplotlib
        charts = {}

        # 1. Базовая статистика по аренде и выручке
        rentals = Rental.objects.all()
        total_rentals = rentals.count()
        total_revenue = rentals.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        avg_rental_price = rentals.aggregate(Avg('total_amount'))['total_amount__avg'] or 0

        # 2. Популярность марок автомобилей (пирог)
        brand_data = self.get_brand_popularity()
        charts['brand_pie'] = self.create_pie_chart(
            brand_data['labels'],
            brand_data['values'],
            'Популярность марок автомобилей'
        )

        # 3. Статистика по месяцам (линейный график)
        monthly_stats = self.get_monthly_stats()
        charts['monthly_chart'] = self.create_line_chart(
            monthly_stats['months'],
            monthly_stats['counts'],
            monthly_stats['revenues'],
            'Динамика аренд по месяцам'
        )

        # 4. Распределение по длительности аренды (столбчатый график)
        duration_stats = self.get_rental_duration_stats()
        charts['duration_chart'] = self.create_bar_chart(
            duration_stats['categories'],
            duration_stats['counts'],
            'Распределение аренд по длительности'
        )

        # 5. Распределение по дням недели (столбчатый график)
        weekday_stats = self.get_weekday_stats()
        charts['weekday_chart'] = self.create_bar_chart(
            weekday_stats['days'],
            weekday_stats['counts'],
            'Аренды по дням недели'
        )

        # Добавляем графики и базовую статистику в контекст
        context.update({
            'charts': charts,
            'total_rentals': total_rentals,
            'total_revenue': round(total_revenue, 2),
            'avg_rental_price': round(avg_rental_price, 2),
            'brand_data': brand_data,
            'monthly_stats': monthly_stats,
            'duration_stats': duration_stats['detailed_data'],
            'weekday_stats': weekday_stats,
        })

        return context

    def get_brand_popularity(self):
        """Получает статистику популярности марок автомобилей"""
        # Получаем топ-5 популярных марок
        brand_counts = Rental.objects.values(
            'vehicle__car_model__brand'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        labels = [item['vehicle__car_model__brand'] for item in brand_counts]
        values = [item['count'] for item in brand_counts]

        return {'labels': labels, 'values': values}

    def get_monthly_stats(self):
        """Получает статистику по месяцам"""
        # Получаем данные за последние 6 месяцев
        six_months_ago = datetime.now().date() - timedelta(days=180)
        monthly_data = Rental.objects.filter(
            rental_date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('rental_date')
        ).values('month').annotate(
            count=Count('id'),
            revenue=Sum('total_amount')
        ).order_by('month')

        months = [item['month'].strftime('%b %Y') for item in monthly_data]
        counts = [item['count'] for item in monthly_data]
        revenues = [item['revenue'] or 0 for item in monthly_data]

        return {'months': months, 'counts': counts, 'revenues': revenues}

    def get_rental_duration_stats(self):
        """Получает статистику по длительности аренд"""
        # Создаем категории длительности аренды
        duration_categories = {
            '1 день': 0,
            '2-3 дня': 0,
            '4-7 дней': 0,
            '1-2 недели': 0,
            '2-4 недели': 0,
            'Более месяца': 0
        }

        # Получаем все аренды и группируем по длительности
        for rental in Rental.objects.all():
            if rental.rental_date and rental.actual_return_date:
                # Вычисляем длительность аренды в днях
                duration = (rental.actual_return_date - rental.rental_date).days

                if duration <= 1:
                    duration_categories['1 день'] += 1
                elif 2 <= duration <= 3:
                    duration_categories['2-3 дня'] += 1
                elif 4 <= duration <= 7:
                    duration_categories['4-7 дней'] += 1
                elif 8 <= duration <= 14:
                    duration_categories['1-2 недели'] += 1
                elif 15 <= duration <= 30:
                    duration_categories['2-4 недели'] += 1
                else:
                    duration_categories['Более месяца'] += 1

        # Собираем данные для графика
        categories = list(duration_categories.keys())
        counts = list(duration_categories.values())

        # Собираем детальные данные для таблицы
        detailed_data = []
        for category, count in duration_categories.items():
            percentage = 0
            total = sum(duration_categories.values())
            if total > 0:
                percentage = round((count / total) * 100, 1)

            detailed_data.append({
                'category': category,
                'count': count,
                'percentage': percentage
            })

        # Сортируем по количеству (опционально)
        detailed_data = sorted(detailed_data, key=lambda x: x['count'], reverse=True)

        return {
            'categories': categories,
            'counts': counts,
            'detailed_data': detailed_data
        }

    def get_weekday_stats(self):
        """Получает статистику по дням недели"""
        # Создаем словарь для хранения количества аренд по дням недели
        weekday_counts = {i: 0 for i in range(7)}

        # Получаем все аренды и вручную группируем по дням недели
        for rental in Rental.objects.all():
            if rental.rental_date:
                weekday = rental.rental_date.weekday()  # 0 = Понедельник, 6 = Воскресенье
                weekday_counts[weekday] += 1

        days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        counts = [weekday_counts[i] for i in range(7)]

        return {'days': days, 'counts': counts}

    def create_pie_chart(self, labels, values, title):
        """Создает круговую диаграмму"""
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
        ax.set_title(title)
        ax.axis('equal')  # Equal aspect ratio ensures the pie chart is circular

        return self.get_graph_png(fig)

    def create_line_chart(self, x_labels, y1_values, y2_values, title):
        """Создает линейный график с двумя осями Y"""
        fig, ax1 = plt.subplots(figsize=(10, 6))

        color = 'tab:blue'
        ax1.set_xlabel('Месяц')
        ax1.set_ylabel('Количество аренд', color=color)
        ax1.plot(x_labels, y1_values, color=color, marker='o')
        ax1.tick_params(axis='y', labelcolor=color)
        plt.xticks(rotation=45)

        ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis
        color = 'tab:red'
        ax2.set_ylabel('Выручка ($)', color=color)
        ax2.plot(x_labels, y2_values, color=color, marker='s')
        ax2.tick_params(axis='y', labelcolor=color)

        fig.tight_layout()
        fig.suptitle(title, fontsize=16)
        plt.subplots_adjust(top=0.9)

        return self.get_graph_png(fig)

    def create_bar_chart(self, labels, values, title):
        """Создает столбчатую диаграмму"""
        fig, ax = plt.subplots(figsize=(10, 6))
        y_pos = np.arange(len(labels))

        ax.barh(y_pos, values, align='center')
        ax.set_yticks(y_pos)
        ax.set_yticklabels(labels)
        ax.invert_yaxis()  # labels read top-to-bottom
        ax.set_title(title)

        # Добавляем значения на концах столбцов
        for i, v in enumerate(values):
            ax.text(v, i, str(v), va='center')

        return self.get_graph_png(fig)

    def get_graph_png(self, figure):
        """Преобразует график matplotlib в base64-строку для HTML"""
        buf = io.BytesIO()
        figure.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        string = base64.b64encode(buf.read())
        plt.close(figure)  # Очищаем фигуру из памяти
        return string.decode('utf-8')