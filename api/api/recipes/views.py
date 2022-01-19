from django.shortcuts import render
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import Diet_Serializer, Cuisine_Serializer, Meal_Type_Serializer, Ingredient_GETSerializer, Ingredient_POSTSerializer
from .serializers import Recipe_GETSerializer, RecipeOverview_GETSerializer, Recipe_POSTSerializer
from .models import Diet, Cuisine, Meal_Type, Ingredient, Recipe
from food.models import Food
from users.models import User
from food.serializers import Food_GETSerializer
from users.serializers import Username_GetSerializer
import json


@api_view(['get', 'post'])
def many_recipes(request, user_pk):
    if request.method == 'GET':
        if request.query_params:
            all_meal_types = Meal_Type.objects.values_list('meal_type', flat=True)
            all_diets = Diet.objects.values_list('diet', flat=True)
            all_cuisines = Cuisine.objects.values_list('cuisine', flat=True)

            search_param = request.query_params.get('value', '')
            lenient_search = ''
            if search_param != '':
                lenient_search = " " + search_param

            meal_type_params = request.query_params.getlist('meal_type', all_meal_types)
            diet_params = request.query_params.getlist('dietary_preference', all_diets)
            cuisine_params = request.query_params.getlist('cuisine', all_cuisines)
        
            recipes = (Recipe.objects.filter(
                recipe_name__startswith=search_param, 
                recipe_name__contains=lenient_search,
                meal_type__meal_type__in=meal_type_params, 
                diets__diet__in=diet_params, 
                cuisine__cuisine__in=cuisine_params
                ).distinct()
                .filter(Q(private=False) | Q(owner=user_pk)))
        else: 
            recipes = Recipe.objects.filter(Q(private=False) | Q(owner=user_pk))
        recipe_serializer = RecipeOverview_GETSerializer(recipes, many=True)
        recipes_data = recipe_serializer.data
        for ele in recipes_data: 
            user = User.objects.get(pk=ele['owner'])
            user_serializer = Username_GetSerializer(user)
            ele['owner_username'] = user_serializer.data['username']
        return Response(recipes_data)
    if request.method == 'POST':
        # this is a post because get requests do not allow a body to be sent
        if "specifiedItems" in request.data:
            if request.query_params:
                all_meal_types = Meal_Type.objects.values_list('meal_type', flat=True)
                all_diets = Diet.objects.values_list('diet', flat=True)
                all_cuisines = Cuisine.objects.values_list('cuisine', flat=True)

                search_param = request.query_params.get('value', '')
                lenient_search = ''
                if search_param != '':
                    lenient_search = " " + search_param
                meal_type_params = request.query_params.getlist('meal_type', all_meal_types)
                diet_params = request.query_params.getlist('dietary_preference', all_diets)
                cuisine_params = request.query_params.getlist('cuisine', all_cuisines)
            
                recipes = (Recipe.objects.filter(
                    recipe_name__startswith=search_param, 
                    recipe_name__contains=lenient_search,
                    meal_type__meal_type__in=meal_type_params, 
                    diets__diet__in=diet_params, 
                    cuisine__cuisine__in=cuisine_params
                    ).distinct()
                    .filter(foods__food_id__in=request.data['specifiedItems'])
                    .filter(Q(private=False) | Q(owner=user_pk))
                    .annotate(itemcount=Count('recipe_id'))
                    .order_by('-itemcount'))
            elif len(request.data['specifiedItems']) > 0:
                recipes = (Recipe.objects
                    .filter(foods__food_id__in=request.data['specifiedItems'])
                    .filter(Q(private=False) | Q(owner=user_pk))
                    .annotate(itemcount=Count('recipe_id'))
                    .order_by('-itemcount'))
            else: 
                recipes = Recipe.objects.filter(Q(private=False) | Q(owner=user_pk))
            recipe_serializer = RecipeOverview_GETSerializer(recipes, many=True)
            recipes_data = recipe_serializer.data
            for ele in recipes_data: 
                user = User.objects.get(pk=ele['owner'])
                user_serializer = Username_GetSerializer(user)
                ele['owner_username'] = user_serializer.data['username']
            return Response(recipes_data, status=status.HTTP_201_CREATED)
        else:
            recipe = request.data.dict()['recipe']
            recipe_json = json.loads(recipe)
            ingredients_data = recipe_json.pop('foods')
            recipe_json['image'] = None
            try:
                recipe_json['diets'] = Diet.objects.filter(diet__in=recipe_json['diets']).values_list('diet_id', flat=True)
                recipe_json['cuisine'] = Cuisine.objects.filter(cuisine=recipe_json['cuisine']).values_list('cuisine_id', flat=True)[0]
                recipe_json['meal_type'] = Meal_Type.objects.filter(meal_type=recipe_json['meal_type']).values_list('meal_type_id', flat=True)[0]
                recipe_json['owner'] = User.objects.filter(user_id=recipe_json['owner']).values_list('user_id', flat=True)[0]
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            recipe_serializer = Recipe_POSTSerializer(data=recipe_json)
            if not recipe_serializer.is_valid():
                    return Response(recipe_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            recipe_serializer.save()
            try:
                recipe_saved = Recipe.objects.get(pk=recipe_serializer.data['recipe_id'])
                recipe_saved.image.save('image.jpg', request.FILES['image'])
            except:
                recipe_saved = Recipe.objects.get(pk=recipe_serializer.data['recipe_id']).delete()
                return Response(status=status.HTTP_400_BAD_REQUEST)
            try:
                for ele in ingredients_data:
                    ele['recipe'] = recipe_serializer.data['recipe_id']
                    try:
                        ele['food'] = Food.objects.filter(food_name=ele['food']).values_list('food_id', flat=True)[0]
                    except:
                        ele['unlisted_food'] = ele['food']
                        ele['food'] = 'f423fee8-fa24-45eb-818a-a2a2dabff417'
                ingredients_serializer = Ingredient_POSTSerializer(data=ingredients_data, many=True)
                if ingredients_serializer.is_valid():
                    ingredients_serializer.save()
                    return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)
                created_recipe = Recipe.objects.get(pk=recipe_id).delete()
                return Response(ingredients_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except:
                created_recipe = Recipe.objects.get(pk=recipe_serializer.data['recipe_id']).delete()
                return Response(status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['get', 'patch', 'delete'])
def single_recipe(request, pk):
    try:
        recipe = Recipe.objects.get(pk=pk)
    except Recipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        recipe_serializer = Recipe_GETSerializer(recipe)
        user = User.objects.get(pk=recipe_serializer.data['owner'])
        user_serializer = Username_GetSerializer(user)
        recipe_data = recipe_serializer.data
        recipe_data['owner_username'] = user_serializer.data['username']
        return Response(recipe_data)
    elif request.method == 'PATCH':
        recipe_dict = request.data.dict()['recipe']
        recipe_json = json.loads(recipe_dict)
        recipe_json['image'] = None
        recipe_serializer = Recipe_GETSerializer(recipe)
        recipe_partial_serializer = Recipe_GETSerializer(recipe, data=recipe_json, partial=True)
        if recipe_partial_serializer.is_valid():
            recipe_partial_serializer.save()
            if recipe_serializer.data['private'] == False and recipe_json['private'] == True:
                # remove this recipe from users' saved recipes
                users = User.objects.filter(saved_recipes__recipe_id=pk).exclude(pk=recipe_serializer.data['owner'])
                for user in users:
                    user.saved_recipes.remove(recipe)
            try:
                recipe.image.save('image.jpg', request.FILES['image'])
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(recipe_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['get'])
def owned_recipe(request, user_id):
    if request.method == 'GET':
        recipes = Recipe.objects.filter(owner=user_id)
        recipe_serializer = RecipeOverview_GETSerializer(recipes, many=True)
        return Response(recipe_serializer.data)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['post'])
def admin_post(request):
    serializer = Meal_Type_Serializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)