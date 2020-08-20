from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Food_Group
from .models import Food

class Food_Group_Serializer(ModelSerializer):
	class Meta:
		model = Food_Group
		fields = '__all__'

class Food_Serializer(ModelSerializer):
	food_group_id = Food_Group_Serializer(read_only=True)

	class Meta:
		model = Food
		fields = '__all__'
