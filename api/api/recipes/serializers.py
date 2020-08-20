from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Diet
from .models import Cuisine
from .models import Meal_Type
from .models import Ingredient
from .models import Recipe

class Diet_Serializer(ModelSerializer):
	class Meta:
		model = Diet
		fields = '__all__'

class Cuisine_Serializer(ModelSerializer):
	class Meta:
		model = Cuisine
		fields = '__all__'

class Meal_Type_Serializer(ModelSerializer):
	class Meta:
		model = Meal_Type
		fields = '__all__'

class Ingredient_Serializer(ModelSerializer):
	class Meta:
		model = Ingredient
		fields = '__all__'

class Recipe_Serializer(ModelSerializer):
	diet_id = Diet_Serializer(read_only=True)
    cuisine_id = Cuisine_Serializer(read_only=True)
    meal_type_id = Meal_Type_Serializer(read_only=True)
    ingredient_id = Ingredient_Serializer(read_only=True)

	class Meta:
		model = Recipe
		fields = '__all__'
