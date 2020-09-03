from django.db import models
from django.utils import timezone
import datetime
from uuid import uuid4

class User(models.Model):
    username = models.CharField(max_length=128, primary_key=True, editable=False)
    name = models.CharField(max_length=128)
    origin_account_date = models.DateField(default=timezone.now, editable=False)
    wasted_count = models.PositiveIntegerField(default=0)
    eaten_count = models.PositiveIntegerField(default=0)
    produce_wasted = models.PositiveIntegerField(default=0)
    meat_wasted = models.PositiveIntegerField(default=0)
    dairy_wasted = models.PositiveIntegerField(default=0)
    total_items = models.PositiveIntegerField(default=0)
    saved_recipes = models.ManyToManyField('recipes.Recipe')
    shopping_list = models.ManyToManyField('food.Food')
    fridge = models.ManyToManyField('food.Food', through='users.Fridge_Item', related_name='users')

    class Meta:
        db_table = 'users'


class Fridge_Item(models.Model):
    food = models.ForeignKey('food.Food', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expiration_date = models.DateField()
    
    class Meta:
        db_table = 'fridge_item'
