from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Diet, Cuisine, Meal_Type, Ingredient, Recipe
from food.serializers import Food_IngredientSerializer

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

class Ingredient_POSTSerializer(ModelSerializer):
	class Meta:
		model = Ingredient
		fields = '__all__'

class Ingredient_GETSerializer(ModelSerializer):
	food = Food_IngredientSerializer(read_only=True)
	
	class Meta:
		model = Ingredient
		fields = ['description', 'food', 'unlisted_food']

class Recipe_POSTSerializer(ModelSerializer):
	class Meta:
		model = Recipe
		fields = '__all__'

class Recipe_GETSerializer(ModelSerializer):
	diets = Diet_Serializer(read_only=True, many=True)
	cuisine = Cuisine_Serializer(read_only=True)
	meal_type = Meal_Type_Serializer(read_only=True)
	ingredients = Ingredient_GETSerializer(source='ingredient_set', many=True)
	
	class Meta:
		model = Recipe
		fields = ['recipe_id', 'recipe_name', 'image', 'diets', 'cuisine', 'meal_type', 'instructions', 'description', 'image', 'ingredients']

class RecipeOverview_GETSerializer(ModelSerializer):
	diets = Diet_Serializer(read_only=True, many=True)
	cuisine = Cuisine_Serializer(read_only=True)
	meal_type = Meal_Type_Serializer(read_only=True)
	
	class Meta:
		model = Recipe
		fields = ['recipe_id', 'recipe_name', 'image', 'diets', 'cuisine', 'meal_type']