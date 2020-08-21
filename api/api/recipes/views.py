from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Diet_Serializer, Cuisine_Serializer, Meal_Type_Serializer, Ingredient_Serializer
from .serializers import Recipe_GETSerializer, RecipeOverview_GETSerializer, Recipe_POSTSerializer
from .models import Diet, Cuisine, Meal_Type, Ingredient, Recipe
from food.models import Food

@api_view(['get'])
def fetch_recipes(request):
    all_meal_types = Meal_Type.objects.values_list('meal_type', flat=True)
    all_diets = Diet.objects.values_list('diet', flat=True)
    all_cuisines = Cuisine.objects.values_list('cuisine', flat=True)

    if request.query_params:
        search_param = request.query_params.get('value', '')
        meal_type_params = request.query_params.getlist('meal_type', all_meal_types)
        diet_params = request.query_params.getlist('dietary_preference', all_diets)
        cuisine_params = request.query_params.getlist('cuisine', all_cuisines)
    
        recipes = (Recipe.objects.filter(
            name__startswith=search_param, 
            meal_type__meal_type__in=meal_type_params, 
            diets__diet__in=diet_params, 
            cuisine__cuisine__in=cuisine_params
            ))
    else: 
        recipes = Recipe.objects.all()
    serializer = RecipeOverview_GETSerializer(recipes, many=True)
    return Response(serializer.data)

@api_view(['get'])
def fetch_recipe(request):
    if request.query_params:
        recipe_id = request.query_params.get('id')
        recipe = Recipe.objects.get(recipe_id=recipe_id)
        ingredients = Ingredient.objects.all().filter(recipe__recipe_id=recipe_id)
        recipe_serializer = Recipe_GETSerializer(recipe, many=False).data
        ingredients_serializer = Ingredient_Serializer(ingredients, many=True).data
        serialized = recipe_serializer['ingredients'] = ingredients_serializer
        return Response(recipe_serializer)
    else: 
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['post'])
def post_recipes(request):
    ingredients_data = request.data.pop('ingredients')
    recipe_data = request.data

    recipe_serializer = Recipe_POSTSerializer(data=recipe_data, many=False)
    if not recipe_serializer.is_valid():
            return Response(recipe_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    recipe_serializer.save()

    recipe_id = recipe_serializer.data['recipe_id']
    for ele in ingredients_data:
        food = ele['food']
        food_id = Food.objects.filter(name=food).values()
        print(food_id)
        ele['food'] = food_id[0]['food_id']
        ele['recipe'] = recipe_id

    ingredients_serializer = Ingredient_Serializer(data=ingredients_data, many=True)
    if not ingredients_serializer.is_valid():
        return Response(ingredients_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    ingredients_serializer.save()
    
    return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)