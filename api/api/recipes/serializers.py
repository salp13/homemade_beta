from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Diet, Cuisine, Meal_Type, Ingredient, Recipe
from food.serializers import Food_POSTSerializer

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
	food = Food_POSTSerializer(read_only=True)
	class Meta:
		model = Ingredient
		fields = '__all__'

class Recipe_POSTSerializer(ModelSerializer):
	class Meta:
		model = Recipe
		fields = '__all__'

class Recipe_GETSerializer(ModelSerializer):
	diets = Diet_Serializer(read_only=True, many=True)
	cuisine = Cuisine_Serializer(read_only=True)
	meal_type = Meal_Type_Serializer(read_only=True)
	
	class Meta:
		model = Recipe
		fields = '__all__'

class RecipeOverview_GETSerializer(ModelSerializer):
	diets = Diet_Serializer(read_only=True, many=True)
	cuisine = Cuisine_Serializer(read_only=True)
	meal_type = Meal_Type_Serializer(read_only=True)
	
	class Meta:
		model = Recipe
		fields = ['recipe_id', 'name', 'image', 'diets', 'cuisine', 'meal_type']