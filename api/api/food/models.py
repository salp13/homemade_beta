from django.db import models
from uuid import uuid4


# should contain images later
class Food_Group(models.Model):
    food_group_id = models.AutoField(primary_key=True)
    food_group = models.CharField(max_length=128)
    image = models.CharField(max_length=128, null=True)

    class Meta:
        db_table = 'food_group'

class Food(models.Model):
    food_id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    food_name = models.CharField(max_length=128, unique=True)
    default_days_to_exp = models.PositiveSmallIntegerField(null=True)
    food_group = models.ForeignKey(Food_Group, on_delete=models.RESTRICT)

    class Meta: 
        db_table = 'food'