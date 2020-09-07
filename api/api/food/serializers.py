from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Food_Group
from .models import Food

class Food_Group_Serializer(ModelSerializer):
	class Meta:
		model = Food_Group
		fields = '__all__'

class Food_GETSerializer(ModelSerializer):
	food_group = Food_Group_Serializer(read_only=True)

	class Meta:
		model = Food
		fields = '__all__'

class Food_POSTSerializer(ModelSerializer):
	class Meta:
		model = Food
		fields = '__all__'

class Food_IngredientSerializer(ModelSerializer):

	class Meta: 
		model = Food
		fields = ['food_id', 'food_name']
