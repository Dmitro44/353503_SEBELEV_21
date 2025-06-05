from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase, Client
from django.urls import reverse

from vehicles.forms import VehicleForm
from vehicles.models import BodyType, CarModel, CarPark, Vehicle

User = get_user_model()

class ModelTestCase(TestCase):
    def setUp(self):
        # Создаем базовые объекты для тестирования всех моделей
        self.body_type = BodyType.objects.create(
            name='Седан',
            description='Четырехдверный автомобиль'
        )

        self.car_model = CarModel.objects.create(
            brand='Toyota',
            model='Camry',
            body_type=self.body_type
        )

        self.car_park = CarPark.objects.create(
            name='Центральный автопарк',
            address='ул. Примерная, 123'
        )

        self.vehicle = Vehicle.objects.create(
            license_plate='А123БВ456',
            car_model=self.car_model,
            year=2021,
            car_price=Decimal('1500000.00'),
            daily_rental_price=Decimal('3000.00'),
            car_park=self.car_park,
            is_available=True
        )

    def test_body_type_str(self):
        """Тест строкового представления модели BodyType"""
        self.assertEqual(str(self.body_type), 'Седан')

    def test_car_model_str(self):
        """Тест строкового представления модели CarModel"""
        self.assertEqual(str(self.car_model), 'Toyota Camry')

    def test_car_park_str(self):
        """Тест строкового представления модели CarPark"""
        self.assertEqual(str(self.car_park), 'Центральный автопарк')

    def test_vehicle_str(self):
        """Тест строкового представления модели Vehicle"""
        self.assertEqual(str(self.vehicle), 'Toyota Camry (А123БВ456)')


class FormTestCase(TestCase):
    def setUp(self):
        self.body_type = BodyType.objects.create(
            name='Седан',
            description='Четырехдверный автомобиль'
        )

        self.car_model = CarModel.objects.create(
            brand='Toyota',
            model='Camry',
            body_type=self.body_type
        )

        self.car_park = CarPark.objects.create(
            name='Центральный автопарк',
            address='ул. Примерная, 123'
        )

    def test_vehicle_form_valid(self):
        """Тест валидности формы с корректными данными"""
        form_data = {
            'license_plate': 'А123БВ456',
            'car_model': self.car_model.id,
            'year': 2021,
            'car_price': Decimal('1500000.00'),
            'daily_rental_price': Decimal('3000.00'),
            'car_park': self.car_park.id,
            'is_available': True,
        }
        form = VehicleForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_vehicle_form_invalid(self):
        """Тест невалидной формы с некорректными данными"""
        # Пустые поля (обязательные)
        form_data = {
            'license_plate': '',
            'car_model': '',
            'year': '',
            'car_price': '',
            'daily_rental_price': '',
            'car_park': '',
        }
        form = VehicleForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('license_plate', form.errors)
        self.assertIn('car_model', form.errors)
        self.assertIn('year', form.errors)
        self.assertIn('car_price', form.errors)
        self.assertIn('daily_rental_price', form.errors)
        self.assertIn('car_park', form.errors)


class ViewTestCase(TestCase):
    def setUp(self):
        # Создаем тестового пользователя (стафф)
        self.staff_user = User.objects.create_user(
            username='staffuser',
            password='staffpass',
            email='staff@example.com',
            is_staff=True
        )

        # Создаем обычного пользователя
        self.regular_user = User.objects.create_user(
            username='regularuser',
            password='userpass',
            email='user@example.com'
        )

        # Создаем тестовые данные
        self.body_type = BodyType.objects.create(
            name='Седан',
            description='Четырехдверный автомобиль'
        )

        self.car_model = CarModel.objects.create(
            brand='Toyota',
            model='Camry',
            body_type=self.body_type
        )

        self.car_park = CarPark.objects.create(
            name='Центральный автопарк',
            address='ул. Примерная, 123'
        )

        self.vehicle = Vehicle.objects.create(
            license_plate='А123БВ456',
            car_model=self.car_model,
            year=2021,
            car_price=Decimal('1500000.00'),
            daily_rental_price=Decimal('3000.00'),
            car_park=self.car_park,
            is_available=True
        )

        # Создаем HTTP клиент
        self.client = Client()

    def test_vehicle_list_view(self):
        """Тест представления списка автомобилей"""
        url = reverse('vehicle_list')
        response = self.client.get(url)

        # Проверяем статус ответа и шаблон
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'carrental/vehicle_list.html')

        # Проверяем наличие данных в контексте
        self.assertIn('vehicles', response.context)
        self.assertIn('brands', response.context)
        self.assertIn('body_types', response.context)
        self.assertIn('car_parks', response.context)
        self.assertIn('years', response.context)

        # Проверяем, что наш автомобиль есть в списке
        self.assertIn(self.vehicle, response.context['vehicles'])

    def test_vehicle_detail_view(self):
        """Тест представления детальной информации об автомобиле"""
        url = reverse('vehicle_detail', args=[self.vehicle.pk])
        response = self.client.get(url)

        # Проверяем статус ответа и шаблон
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'carrental/vehicle_detail.html')

        # Проверяем данные в контексте
        self.assertEqual(response.context['vehicle'], self.vehicle)

    def test_vehicle_create_view_get_not_staff(self):
        """Тест доступа к созданию автомобиля для не-стаффа"""
        self.client.login(username='regularuser', password='userpass')
        url = reverse('vehicle_create')
        response = self.client.get(url)

        # Должен быть редирект, так как пользователь не стафф
        self.assertEqual(response.status_code, 302)

    def test_vehicle_create_view_get_staff(self):
        """Тест доступа к созданию автомобиля для стаффа"""
        self.client.login(username='staffuser', password='staffpass')
        url = reverse('vehicle_create')
        response = self.client.get(url)

        # Проверяем, что стафф имеет доступ
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'carrental/vehicle_form.html')
        self.assertIn('form', response.context)

    def test_vehicle_create_view_post_staff(self):
        """Тест создания автомобиля через POST-запрос (стафф)"""
        self.client.login(username='staffuser', password='staffpass')
        url = reverse('vehicle_create')

        data = {
            'license_plate': 'В789ГД123',
            'car_model': self.car_model.id,
            'year': 2022,
            'car_price': '1800000.00',
            'daily_rental_price': '3500.00',
            'car_park': self.car_park.id,
            'is_available': True,
        }

        response = self.client.post(url, data)

        # Проверяем редирект после успешного создания
        self.assertEqual(response.status_code, 302)

        # Проверяем, что объект был создан
        self.assertTrue(Vehicle.objects.filter(license_plate='В789ГД123').exists())

    def test_vehicle_update_view_staff(self):
        """Тест обновления автомобиля (стафф)"""
        self.client.login(username='staffuser', password='staffpass')
        url = reverse('vehicle_update', args=[self.vehicle.pk])

        # GET-запрос должен отобразить форму
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'carrental/vehicle_form.html')

        # POST-запрос должен обновить объект
        data = {
            'license_plate': self.vehicle.license_plate,
            'car_model': self.vehicle.car_model.id,
            'year': 2022,  # Меняем год
            'car_price': '1600000.00',  # Меняем цену
            'daily_rental_price': '3200.00',  # Меняем цену аренды
            'car_park': self.vehicle.car_park.id,
            'is_available': False,  # Меняем доступность
        }

        response = self.client.post(url, data)

        # Проверяем редирект после успешного обновления
        self.assertEqual(response.status_code, 302)

        # Перезагружаем объект из базы данных
        updated_vehicle = Vehicle.objects.get(pk=self.vehicle.pk)

        # Проверяем, что данные обновились
        self.assertEqual(updated_vehicle.year, 2022)
        self.assertEqual(updated_vehicle.car_price, Decimal('1600000.00'))
        self.assertEqual(updated_vehicle.daily_rental_price, Decimal('3200.00'))
        self.assertEqual(updated_vehicle.is_available, False)

    def test_vehicle_delete_view_staff(self):
        """Тест удаления автомобиля (стафф)"""
        self.client.login(username='staffuser', password='staffpass')
        url = reverse('vehicle_delete', args=[self.vehicle.pk])

        # GET-запрос должен отобразить страницу подтверждения
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'carrental/vehicle_confirm_delete.html')

        # POST-запрос должен удалить объект
        response = self.client.post(url)

        # Проверяем редирект после успешного удаления
        self.assertEqual(response.status_code, 302)

        # Проверяем, что объект был удален
        self.assertFalse(Vehicle.objects.filter(pk=self.vehicle.pk).exists())

    def test_vehicle_filter_and_search(self):
        """Тест фильтрации и поиска автомобилей"""
        # Создаем дополнительные данные для тестирования фильтров
        body_type2 = BodyType.objects.create(name='Хэтчбек', description='Пятидверный автомобиль')
        car_model2 = CarModel.objects.create(brand='Honda', model='Civic', body_type=body_type2)
        car_park2 = CarPark.objects.create(name='Южный автопарк', address='ул. Тестовая, 456')

        vehicle2 = Vehicle.objects.create(
            license_plate='Е456ЖЗ789',
            car_model=car_model2,
            year=2020,
            car_price=Decimal('1200000.00'),
            daily_rental_price=Decimal('2500.00'),
            car_park=car_park2,
            is_available=False
        )

        # Тест фильтрации по марке
        url = reverse('vehicle_list') + '?brand=Toyota'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle, response.context['vehicles'])
        self.assertNotIn(vehicle2, response.context['vehicles'])

        # Тест фильтрации по типу кузова
        url = reverse('vehicle_list') + f'?body_type={body_type2.id}'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(vehicle2, response.context['vehicles'])
        self.assertNotIn(self.vehicle, response.context['vehicles'])

        # Тест фильтрации по году
        url = reverse('vehicle_list') + '?year=2021'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle, response.context['vehicles'])
        self.assertNotIn(vehicle2, response.context['vehicles'])

        # Тест фильтрации по доступности
        url = reverse('vehicle_list') + '?is_available=false'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(vehicle2, response.context['vehicles'])
        self.assertNotIn(self.vehicle, response.context['vehicles'])

        # Тест поиска
        url = reverse('vehicle_list') + '?search=Honda'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(vehicle2, response.context['vehicles'])
        self.assertNotIn(self.vehicle, response.context['vehicles'])

        # Тест сортировки
        url = reverse('vehicle_list') + '?ordering=-daily_rental_price'
        response = self.client.get(url)
        # Проверяем, что первый элемент в списке - более дорогой автомобиль
        self.assertEqual(response.context['vehicles'][0], self.vehicle)


class AuthorizationTestCase(TestCase):
    """Тесты проверки прав доступа"""
    def setUp(self):
        # Создаем пользователей с правильными полями
        self.staff_user = User.objects.create_user(
            username='staffuser',
            password='staffpass',
            email='staff@example.com',
            role='staff',  # Указываем роль явно
            last_name='Сотрудник',
            first_name='Сотрудник',
            middle_name='Сотрудникович',
            phone='+375297584934',  # Подставьте валидный номер
            address='ул. Тестовая, 123'
        )

        self.regular_user = User.objects.create_user(
            username='regularuser',
            password='userpass',
            email='regular@example.com',
            role='client',
            last_name='Клиентов',
            first_name='Клиент',
            middle_name='Клиентович',
            phone='+375297582942',  # Подставьте валидный номер
            address='ул. Пользовательская, 456'
        )

        # Создаем тестовые данные
        self.body_type = BodyType.objects.create(name='Седан')
        self.car_model = CarModel.objects.create(brand='Toyota', model='Camry', body_type=self.body_type)
        self.car_park = CarPark.objects.create(name='Тестовый парк', address='Тестовый адрес')
        self.vehicle = Vehicle.objects.create(
            license_plate='А123БВ456',
            car_model=self.car_model,
            year=2021,
            car_price=Decimal('1500000.00'),
            daily_rental_price=Decimal('3000.00'),
            car_park=self.car_park,
            is_available=True
        )

        self.client = Client()

    def test_crud_access_staff(self):
        """Проверка доступа к CRUD операциям для стафф-пользователя"""
        self.client.login(username='staffuser', password='staffpass')

        # Проверка доступа к созданию
        response = self.client.get(reverse('vehicle_create'))
        self.assertEqual(response.status_code, 200)

        # Проверка доступа к обновлению
        response = self.client.get(reverse('vehicle_update', args=[self.vehicle.pk]))
        self.assertEqual(response.status_code, 200)

        # Проверка доступа к удалению
        response = self.client.get(reverse('vehicle_delete', args=[self.vehicle.pk]))
        self.assertEqual(response.status_code, 200)

    def test_crud_access_regular(self):
        """Проверка доступа к CRUD операциям для обычного пользователя"""
        self.client.login(username='regularuser', password='userpass')

        # Проверка доступа к созданию
        response = self.client.get(reverse('vehicle_create'))
        self.assertEqual(response.status_code, 302)  # Должен быть редирект

        # Проверка доступа к обновлению
        response = self.client.get(reverse('vehicle_update', args=[self.vehicle.pk]))
        self.assertEqual(response.status_code, 302)  # Должен быть редирект

        # Проверка доступа к удалению
        response = self.client.get(reverse('vehicle_delete', args=[self.vehicle.pk]))
        self.assertEqual(response.status_code, 302)  # Должен быть редирект

        # Проверяем, что POST запросы тоже недоступны
        response = self.client.post(reverse('vehicle_create'), {})
        self.assertEqual(response.status_code, 302)  # Должен быть редирект

        response = self.client.post(reverse('vehicle_update', args=[self.vehicle.pk]), {})
        self.assertEqual(response.status_code, 302)  # Должен быть редирект

        response = self.client.post(reverse('vehicle_delete', args=[self.vehicle.pk]))
        self.assertEqual(response.status_code, 302)  # Должен быть редирект
        self.assertTrue(Vehicle.objects.filter(pk=self.vehicle.pk).exists())  # Объект не должен быть удален


class VehicleListFiltersTestCase(TestCase):
    """Детальные тесты для фильтров в представлении списка автомобилей"""

    def setUp(self):
        # Создаем типы кузова
        self.sedan = BodyType.objects.create(name='Седан', description='Четырехдверный автомобиль')
        self.hatchback = BodyType.objects.create(name='Хэтчбек', description='Пятидверный автомобиль')
        self.suv = BodyType.objects.create(name='Внедорожник', description='Высокий клиренс')

        # Создаем модели автомобилей
        self.toyota_camry = CarModel.objects.create(brand='Toyota', model='Camry', body_type=self.sedan)
        self.honda_civic = CarModel.objects.create(brand='Honda', model='Civic', body_type=self.hatchback)
        self.toyota_rav4 = CarModel.objects.create(brand='Toyota', model='RAV4', body_type=self.suv)

        # Создаем автопарки
        self.central_park = CarPark.objects.create(name='Центральный', address='ул. Центральная, 1')
        self.south_park = CarPark.objects.create(name='Южный', address='ул. Южная, 10')

        # Создаем автомобили
        self.vehicle1 = Vehicle.objects.create(
            license_plate='А123БВ777',
            car_model=self.toyota_camry,
            year=2021,
            car_price=Decimal('1800000.00'),
            daily_rental_price=Decimal('3500.00'),
            car_park=self.central_park,
            is_available=True
        )

        self.vehicle2 = Vehicle.objects.create(
            license_plate='В456ГД777',
            car_model=self.honda_civic,
            year=2020,
            car_price=Decimal('1500000.00'),
            daily_rental_price=Decimal('3000.00'),
            car_park=self.south_park,
            is_available=False
        )

        self.vehicle3 = Vehicle.objects.create(
            license_plate='Е789ЖЗ777',
            car_model=self.toyota_rav4,
            year=2022,
            car_price=Decimal('2200000.00'),
            daily_rental_price=Decimal('4000.00'),
            car_park=self.central_park,
            is_available=True
        )

        self.client = Client()

    def test_combined_filters(self):
        """Тест комбинированных фильтров"""
        # Фильтр по бренду + году
        url = reverse('vehicle_list') + '?brand=Toyota&year=2021'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle1, response.context['vehicles'])

        # Фильтр по доступности + автопарку
        url = reverse('vehicle_list') + f'?is_available=true&car_park={self.central_park.id}'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 2)
        self.assertIn(self.vehicle1, response.context['vehicles'])
        self.assertIn(self.vehicle3, response.context['vehicles'])

        # Фильтр по типу кузова + бренду + доступности
        url = reverse('vehicle_list') + f'?body_type={self.sedan.id}&brand=Toyota&is_available=true'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle1, response.context['vehicles'])

    def test_search_functionality(self):
        """Тест функциональности поиска"""
        # Поиск по гос. номеру (частичное совпадение)
        url = reverse('vehicle_list') + '?search=А123'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle1, response.context['vehicles'])

        # Поиск по бренду
        url = reverse('vehicle_list') + '?search=Honda'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle2, response.context['vehicles'])

        # Поиск по типу кузова
        url = reverse('vehicle_list') + '?search=Внедорожник'
        response = self.client.get(url)
        self.assertEqual(len(response.context['vehicles']), 1)
        self.assertIn(self.vehicle3, response.context['vehicles'])

    def test_ordering_functionality(self):
        """Тест функциональности сортировки"""
        # Сортировка по цене аренды (по возрастанию)
        url = reverse('vehicle_list') + '?ordering=daily_rental_price'
        response = self.client.get(url)
        vehicles_list = list(response.context['vehicles'])
        self.assertEqual(vehicles_list[0], self.vehicle2)  # Самый дешевый первым
        self.assertEqual(vehicles_list[2], self.vehicle3)  # Самый дорогой последним

        # Сортировка по цене аренды (по убыванию)
        url = reverse('vehicle_list') + '?ordering=-daily_rental_price'
        response = self.client.get(url)
        vehicles_list = list(response.context['vehicles'])
        self.assertEqual(vehicles_list[0], self.vehicle3)  # Самый дорогой первым
        self.assertEqual(vehicles_list[2], self.vehicle2)  # Самый дешевый последним

        # Сортировка по году (по возрастанию)
        url = reverse('vehicle_list') + '?ordering=year'
        response = self.client.get(url)
        vehicles_list = list(response.context['vehicles'])
        self.assertEqual(vehicles_list[0], self.vehicle2)  # 2020 год
        self.assertEqual(vehicles_list[2], self.vehicle3)  # 2022 год

        # Сортировка по году (по убыванию)
        url = reverse('vehicle_list') + '?ordering=-year'
        response = self.client.get(url)
        vehicles_list = list(response.context['vehicles'])
        self.assertEqual(vehicles_list[0], self.vehicle3)  # 2022 год
        self.assertEqual(vehicles_list[2], self.vehicle2)  # 2020 год

    def test_default_ordering(self):
        """Тест сортировки по умолчанию"""
        url = reverse('vehicle_list')
        response = self.client.get(url)
        # По умолчанию должна быть сортировка по цене аренды (возрастание)
        vehicles_list = list(response.context['vehicles'])
        self.assertEqual(vehicles_list[0], self.vehicle2)  # Самый дешевый первым
        self.assertEqual(vehicles_list[2], self.vehicle3)  # Самый дорогой последним