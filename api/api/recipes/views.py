from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Diet_Serializer, Cuisine_Serializer, Meal_Type_Serializer, Ingredient_GETSerializer, Ingredient_POSTSerializer
from .serializers import Recipe_GETSerializer, RecipeOverview_GETSerializer, Recipe_POSTSerializer
from .models import Diet, Cuisine, Meal_Type, Ingredient, Recipe
from food.models import Food
from food.serializers import Food_GETSerializer

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
            recipe_name__startswith=search_param, 
            meal_type__meal_type__in=meal_type_params, 
            diets__diet__in=diet_params, 
            cuisine__cuisine__in=cuisine_params
            ))
    else: 
        recipes = Recipe.objects.all()
    serializer = RecipeOverview_GETSerializer(recipes, many=True)
    return Response(serializer.data)

@api_view(['get'])
def fetch_recipe(request, pk):
    try:
        recipe = Recipe.objects.get(pk=pk)
    except Recipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    ingredients = Ingredient.objects.all().filter(recipe__pk=pk)
    recipe_serializer = Recipe_GETSerializer(recipe, many=False).data
    ingredients_serializer = Ingredient_GETSerializer(ingredients, many=True).data
    serialized = recipe_serializer['ingredients'] = ingredients_serializer
    return Response(recipe_serializer)

@api_view(['post'])
def post_recipe(request):
    ingredients_data = request.data.pop('foods')
    recipe_data = request.data
    print(request.data['diets'])

    for index, ele in enumerate(request.data['diets']):
        try:
            diet = Diet.objects.get(diet=ele)
        except Diet.DoesNotExist:
            print(ele)
        serializer = Diet_Serializer(diet)
        print(serializer.data)
        request.data['diets'][index] = serializer.data.get('diet_id')

    print(request.data['diets'])

    try: 
        cuisine = Cuisine.objects.get(cuisine=request.data.get('cuisine'))
    except Cuisine.DoesNotExist:
        print(request.data.cuisine)
    cuisine_serializer = Cuisine_Serializer(cuisine)
    request.data['cuisine'] = cuisine_serializer.data.get('cuisine_id')

    try:
        meal_type = Meal_Type.objects.get(meal_type=request.data.get('meal_type'))
    except Meal_Type.DoesNotExist:
        print(request.data.meal_type)
    meal_type_serializer = Meal_Type_Serializer(meal_type)
    request.data['meal_type'] = meal_type_serializer.data.get('meal_type_id')


    recipe_serializer = Recipe_POSTSerializer(data=recipe_data, many=False)
    if not recipe_serializer.is_valid():
            return Response(recipe_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    recipe_serializer.save()

    recipe_id = recipe_serializer.data['recipe_id']
    for ele in ingredients_data:
        food = ele['food']
        try:
            food_object = Food.objects.get(food_name=food)
            food_serializer = Food_GETSerializer(food_object)
            ele['food'] = food_serializer.data['food_id']
        except Food.DoesNotExist:
            ele['food'] = 'f704d172-3e5a-4aab-a516-7d2846c051c5'
            ele['unlisted_food'] = food
        ele['recipe'] = recipe_id

    ingredients_serializer = Ingredient_POSTSerializer(data=ingredients_data, many=True)
    if not ingredients_serializer.is_valid():
        print(ingredients_data)
        return Response(ingredients_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    ingredients_serializer.save()
    
    return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['delete'])
def delete_recipe(request, pk):
    if request.method == 'DELETE':
        try:
            recipe = Recipe.objects.get(pk=pk)
            recipe.delete()
        except Recipe.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['get', 'post'])
def admin_post(request):
    if request.method=='GET':
        diets = Diet.objects.all()
        serializer = Diet_Serializer(diets, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = Meal_Type_Serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)