from django.db import models
from django.utils import timezone
import datetime
from uuid import uuid4

class User(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    username = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    origin_account_date = models.DateField(default=datetime.date.today)
    wasted_count = models.PositiveIntegerField(default=0)
    eaten_count = models.PositiveIntegerField(default=0)
    produce_wasted = models.PositiveIntegerField(default=0)
    meat_wasted = models.PositiveIntegerField(default=0)
    dairy_wasted = models.PositiveIntegerField(default=0)
    total_items = models.PositiveIntegerField(default=0)
    saved_recipes = models.ManyToManyField('recipes.Recipe', blank=True)
    shopping_list = models.ManyToManyField('food.Food', through='users.Shopping_List_Item')
    fridge = models.ManyToManyField('food.Food', through='users.Fridge_Item', related_name='users')

    class Meta:
        db_table = 'users'


class Fridge_Item(models.Model):
    food = models.ForeignKey('food.Food', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unlisted_food = models.CharField(max_length=128, null=True)
    expiration_date = models.DateField(null=True)
    
    class Meta:
        db_table = 'fridge_item'

class Shopping_List_Item(models.Model):
    food = models.ForeignKey('food.Food', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unlisted_food = models.CharField(max_length=128, null=True)

    class Meta:
        db_table = 'shopping_list'
