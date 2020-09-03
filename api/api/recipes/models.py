from django.db import models
from uuid import uuid4


# should contain images later
class Diet(models.Model):
    diet_id = models.AutoField(primary_key=True)
    diet = models.CharField(max_length=128)

    class Meta:
        db_table = 'diet'

class Cuisine(models.Model):
    cuisine_id = models.AutoField(primary_key=True)
    cuisine = models.CharField(max_length=128)

    class Meta:
        db_table = 'cuisine'

class Meal_Type(models.Model):
    meal_type_id = models.AutoField(primary_key=True)
    meal_type = models.CharField(max_length=128)

    class Meta:
        db_table = 'meal_type'

class Recipe(models.Model):
    recipe_id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=128)
    image = models.CharField(max_length=128, null=True)
    description = models.TextField()
    instructions = models.TextField(default='')
    diets = models.ManyToManyField(Diet)
    cuisine = models.ForeignKey(Cuisine, on_delete=models.RESTRICT, null=True)
    meal_type = models.ForeignKey(Meal_Type, on_delete=models.RESTRICT, null=True)
    foods = models.ManyToManyField('food.Food', through='recipes.Ingredient', related_name='recipes')

    class Meta: 
        db_table = 'recipe'

class Ingredient(models.Model):
    food = models.ForeignKey('food.Food', on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField(default=1)
    measurement_unit = models.CharField(max_length=128)
    
    class Meta:
        db_table = 'ingredient'