from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from .models import Food_Group
from .models import Food

class Food_Group_GETSerializer(ModelSerializer):
	class Meta:
		model = Food_Group
		fields = '__all__'

class Food_Group_POSTSerializer(ModelSerializer):
	food_group = serializers.CharField(max_length=128, write_only=True)

	class Meta:
		model = Food_Group
		fields = '__all__'

class Food_GETSerializer(ModelSerializer):
	food_group = Food_Group_GETSerializer(read_only=True)

	class Meta:
		model = Food
		fields = '__all__'

class Food_POSTSerializer(ModelSerializer):
	class Meta:
		model = Food
		fields = '__all__'
