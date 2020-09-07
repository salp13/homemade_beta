from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Diet_Serializer, Cuisine_Serializer, Meal_Type_Serializer, Ingredient_GETSerializer, Ingredient_POSTSerializer
from .serializers import Recipe_GETSerializer, RecipeOverview_GETSerializer, Recipe_POSTSerializer
from .models import Diet, Cuisine, Meal_Type, Ingredient, Recipe
from food.models import Food
from food.serializers import Food_GETSerializer

@api_view(['get', 'post', 'delete'])
def many_recipes(request):
    if request.method == 'GET':
        if request.query_params:
            all_meal_types = Meal_Type.objects.values_list('meal_type', flat=True)
            all_diets = Diet.objects.values_list('diet', flat=True)
            all_cuisines = Cuisine.objects.values_list('cuisine', flat=True)

            search_param = request.query_params.get('value', '')
            meal_type_params = request.query_params.getlist('meal_type', all_meal_types)
            diet_params = request.query_params.getlist('dietary_preference', all_diets)
            cuisine_params = request.query_params.getlist('cuisine', all_cuisines)
        
            recipes = (Recipe.objects.filter(
                recipe_name__startswith=search_param, 
                meal_type__meal_type__in=meal_type_params, 
                diets__diet__in=diet_params, 
                cuisine__cuisine__in=cuisine_params
                ))
        else: 
            recipes = Recipe.objects.all()
        recipe_serializer = RecipeOverview_GETSerializer(recipes, many=True)
        return Response(recipe_serializer.data)
    if request.method == 'POST':
        ingredients_data = request.data.pop('foods')
        try:
            request.data['diets'] = Diet.objects.filter(diet__in=request.data['diets']).values_list('diet_id', flat=True)
            request.data['cuisine'] = Cuisine.objects.filter(cuisine=request.data['cuisine']).values_list('cuisine_id', flat=True)[0]
            request.data['meal_type'] = Meal_Type.objects.filter(meal_type=request.data['meal_type']).values_list('meal_type_id', flat=True)[0]
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        recipe_serializer = Recipe_POSTSerializer(data=request.data)
        if not recipe_serializer.is_valid():
                return Response(recipe_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        recipe_serializer.save()
        try:
            for ele in ingredients_data:
                ele['recipe'] = recipe_serializer.data['recipe_id']
                try:
                    ele['food'] = Food.objects.filter(food_name=ele['food']).values_list('food_id', flat=True)[0]
                except:
                    ele['unlisted_food'] = ele['food']
                    ele['food'] = '0508cd76-8fec-4739-b996-c7001763c98f'
            ingredients_serializer = Ingredient_POSTSerializer(data=ingredients_data, many=True)
            if ingredients_serializer.is_valid():
                ingredients_serializer.save()
                return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)
            created_recipe = Recipe.objects.get(pk=recipe_id).delete()
            return Response(ingredients_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            created_recipe = Recipe.objects.get(pk=recipe_serializer.data['recipe_id']).delete()
            return Response(status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'DELETE':
        recipes = Recipe.objects.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['get', 'patch', 'delete'])
def single_recipe(request, pk):
    try:
        recipe = Recipe.objects.get(pk=pk)
    except Recipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        recipe_serializer = Recipe_GETSerializer(recipe)
        return Response(recipe_serializer.data)
    elif request.method == 'PATCH':
        recipe_partial_serializer = Recipe_GETSerializer(recipe, data=request.data, partial=True)
        if recipe_partial_serializer.is_valid():
            recipe_partial_serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(recipe_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['post'])
def admin_post(request):
    serializer = Cuisine_Serializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)