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

# DIVIDE

class Food_Group_D_Serializer(ModelSerializer):
	class Meta:
		model = Food_Group
		fields = '__all__'

class Food_Group_S_Serializer(ModelSerializer):
	class Meta:
		model = Food_Group
		fields = ['food_group_id', 'image']

class Food_S_Serializer(ModelSerializer):
	class Meta: 
		model = Food
		fields = ['food_id', 'food_name']

class Food_D_Serializer(ModelSerializer):
	class Meta:
		model = Food
		fields = '__all__'

class Food_DN_Serializer(ModelSerializer):
	food_group = Food_Group_D_Serializer(read_only=True)

	class Meta:
		model = Food
		fields = '__all__'

class Food_SN_Serializer(ModelSerializer):
	food_group = Food_Group_S_Serializer(read_only=True)

	class Meta:
		model = Food
		fields = '__all__'
