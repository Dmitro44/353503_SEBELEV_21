import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from rentals.models import PromoCode

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Updates the status of expired promo codes'

    def handle(self, *args, **options):
        today = timezone.now().date()
        expired_codes = PromoCode.objects.filter(valid_to__lt=today, is_active=True)
        
        count = expired_codes.count()
        
        if count > 0:
            for code in expired_codes:
                code.is_active = False
                code.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully expired {count} promo codes.'))
            logger.info(f'Expired {count} promo codes.')
        else:
            self.stdout.write(self.style.SUCCESS('No promo codes to expire.'))
            logger.info('No promo codes to expire.')
