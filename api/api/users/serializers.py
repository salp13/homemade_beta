from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import User, Fridge_Item
from food.serializers import Food_POSTSerializer
from recipes.serializers import RecipeOverview_GETSerializer

class Fridge_Item_Serializer(ModelSerializer):
	food = Food_POSTSerializer(read_only=True)
	class Meta:
		model = Fridge_Item
		fields = '__all__'

class User_POSTSerializer(ModelSerializer):
	class Meta:
		model = User
		fields = '__all__'

class User_GETSerializer(ModelSerializer):
	saved_recipes = RecipeOverview_GETSerializer(read_only=True, many=True)
	
	class Meta:
		model = User
		fields = '__all__'