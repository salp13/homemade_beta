from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import User, Fridge_Item, Shopping_List_Item
from food.serializers import Food_D_Serializer, Food_S_Serializer, Food_SN_Serializer
from recipes.serializers import RecipeOverview_GETSerializer

class Fridge_Item_DN_Serializer(ModelSerializer):
	food = Food_D_Serializer(read_only=True)
	class Meta:
		model = Fridge_Item
		fields = '__all__'

class Fridge_Item_SN_Serializer(ModelSerializer):
	food = Food_S_Serializer(read_only=True)
	class Meta:
		model = Fridge_Item
		fields = '__all__'

class Fridge_Item_DNSN_Serializer(ModelSerializer):
	food = Food_SN_Serializer(read_only=True)
	class Meta:
		model = Fridge_Item
		fields = '__all__'

class Fridge_Item_D_Serializer(ModelSerializer):
	class Meta:
		model = Fridge_Item
		fields = '__all__'

class Shopping_List_Item_Serializer(ModelSerializer):
	food = Food_D_Serializer(read_only=True)
	class Meta:
		model = Shopping_List_Item
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