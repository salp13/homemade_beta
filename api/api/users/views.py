from django.shortcuts import render
from django.contrib.auth.models import User as Auth_User
from django.contrib.auth import authenticate 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .serializers import Fridge_Item_D_Serializer, Fridge_Item_DN_Serializer, Fridge_Item_SN_Serializer, Fridge_Item_DNSN_Serializer
from .serializers import User_GETSerializer, User_POSTSerializer, Shopping_List_Item_D_Serializer, Shopping_List_Item_DN_Serializer
from .models import User, Fridge_Item, Shopping_List_Item
from recipes.models import Recipe
from food.models import Food
from recipes.serializers import RecipeOverview_GETSerializer
from food.serializers import Food_S_Serializer, Food_D_Serializer
import datetime

@api_view(['post'])
def login(request):
    if request.method == 'POST':
        user = authenticate(username=request.data['username'], password=request.data['password'])
        if user is not None:
            try:
                user_obj = User.objects.get(username=request.data['username'])
            except User.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            user_serializer = User_GETSerializer(user_obj)
            return Response(user_serializer.data)
        else: 
            return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['post'])
@permission_classes((AllowAny, ))
def signup(request):
    if request.method == 'POST':
        # create admin user
        response = {"response": "ok"}
        username = request.data['username']
        email = request.data['email']
        password = request.data['password']
        name = request.data['name']
        try: 
            user = Auth_User.objects.create_user(username, email, password)
            user.save()
        except:
            response['response'] = "failed"
            return Response(response)
        # create data user
        user_serializer = User_POSTSerializer(data={"username": username, "name": name})
        if user_serializer.is_valid():
            user_serializer.save()
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['patch'])
def change_password(request):
    print(request.data)
    if request.method == 'PATCH':
        print('1')
        user = authenticate(username=request.data['username'], password=request.data['old_password'])
        if user is not None:
            print('2')
            user.set_password(request.data['new_password'])
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            print('3')
            return Response(status=status.HTTP_400_BAD_REQUEST)
    print('4')
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['get'])
def many_users(request):
    if request.method == 'GET':
        users = User.objects.all()
        users_serializer = User_GETSerializer(users, many=True)
        # print(user_serializer.data)
        return Response(users_serializer.data)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['get', 'patch', 'delete'])
def single_user(request, user_pk):
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        user_serializer = User_GETSerializer(user)
        return Response(user_serializer.data)
    elif request.method == 'PATCH':
        user_partial_serializer = User_GETSerializer(user, data=request.data, partial=True)
        if user_partial_serializer.is_valid():
            user_partial_serializer.save()
            return Response(user_partial_serializer.data)
        return Response(user_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get', 'patch'])
def metric_data(request, user_pk):
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        user_serializer = User_GETSerializer(user)
        return Response(user_serializer.data)
    elif request.method == 'PATCH':
        user_partial_serializer = User_POSTSerializer(user, data=request.data, partial=True)
        if user_partial_serializer.is_valid():
            user_partial_serializer.save()
            return Response(user_partial_serializer.data)
        return Response(user_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get', 'post'])
def many_fridge(request, user_pk):
    if request.method == 'GET':
        if request.query_params:
            # searching through fridge
            listed_foods = Food.objects.filter(food_name__startswith=request.query_params.get('value')).value_list('food_name', flat=True)
            unlisted_foods = Fridge_Item.objects.filter(unlisted_foods__startswith=request.query_params.get('value')).value_list('unlisted_food', flat=True)
            foods = listed_foods.append(unlisted_foods)
            fridge = Fridge_Item.objects.filter(user=user_pk, food__in=foods)
        else:
            # fetching entire fridge
            fridge = Fridge_Item.objects.filter(user=user_pk)
        fridge_serializer = Fridge_Item_DNSN_Serializer(fridge, many=True)
        return Response(fridge_serializer.data)
    elif request.method == 'POST':
        # data given : food_id, user_id, food_name if unlisted 
        # find food_element in order to access default days to exp
        food_element = Food.objects.get(pk=request.data['food'])
        food_serializer = Food_D_Serializer(food_element) 
        request.data['user'] = user_pk #if UI has access to it's user's pk then this is unnecessary 
        # if the food's default_days_to_exp is not null
        if (food_serializer.data['default_days_to_exp']):
            request.data['expiration_date'] = datetime.datetime.now().date() + datetime.timedelta(days=food_serializer.data['default_days_to_exp'])
        fridge_serializer = Fridge_Item_D_Serializer(data=request.data)
        if fridge_serializer.is_valid():
            fridge_serializer.save()
            # return all fridge_item information
            fridge_item = Fridge_Item.objects.get(id=fridge_serializer.data['id'])
            fridge_serializer_full = Fridge_Item_DNSN_Serializer(fridge_item)
            return Response(fridge_serializer_full.data, status=status.HTTP_201_CREATED)
        return Response(fridge_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get', 'patch', 'delete'])
def single_fridge(request, user_pk, fridge_pk):
    try:
        fridge_item = Fridge_Item.objects.get(pk=fridge_pk)
    except Fridge_Item.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET': # no current use case (unformatted)
        fridge_serializer = Fridge_Item_DNSN_Serializer(fridge_item)
        return Response(fridge_serializer.data)
    elif request.method == 'PATCH':
        fridge_partial_serializer = Fridge_Item_DNSN_Serializer(fridge_item, data=request.data, partial=True)
        if fridge_partial_serializer.is_valid():
            fridge_partial_serializer.save()
            return Response(fridge_partial_serializer.data)
        return Response(fridge_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        fridge_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get', 'patch', 'post'])
def many_shopping_list(request, user_pk):
    if request.method == 'GET':
        # searching through shopping list 
        if request.query_params:
            listed_foods = Food.objects.filter(food_name__startswith=request.query_params.get('value')).value_list('food_name', flat=True)
            unlisted_foods = Shopping_List_Item.objects.filter(unlisted_foods__startswith=request.query_params.get('value')).value_list('unlisted_food', flat=True)
            foods = listed_foods.append(unlisted_foods)
            shopping_list = Shopping_List_Item.objects.filter(user=user_pk, food__in=foods)
        else:
            # fetching entire shopping list
            shopping_list = Shopping_List_Item.objects.filter(user=user_pk)
        shopping_list_serializer = Shopping_List_Item_DN_Serializer(shopping_list, many=True)
        return Response(shopping_list_serializer.data)
    elif request.method == 'POST':
        request.data['user'] = user_pk #if UI has access to it's user's pk then this is unnecessary 
        shopping_list_serializer = Shopping_List_Item_D_Serializer(data=request.data)
        if shopping_list_serializer.is_valid():
            shopping_list_serializer.save()
            shopping_list = Shopping_List_Item.objects.get(id=shopping_list_serializer.data['id'])
            shopping_list_serializer_full = Shopping_List_Item_DN_Serializer(shopping_list)
            return Response(shopping_list_serializer_full.data, status=status.HTTP_201_CREATED)
        return Response(shopping_list_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'PATCH':
        arr_to_save = []
        for ele in request.data:
            try:
                shopping_list_item = Shopping_List_Item.objects.get(pk=ele['id'])
            except Shopping_List_Item.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            shopping_list_partial_serializer = Shopping_List_Item_DN_Serializer(shopping_list_item, data=ele, partial=True) # cannot do many=True -- loop over data? put them all? 
            if shopping_list_partial_serializer.is_valid():
                arr_to_save.append(shopping_list_partial_serializer)
            else:
                return Response(shopping_list_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        for ele in arr_to_save:
            ele.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get', 'patch', 'delete'])
def single_shopping_list(request, user_pk, shopping_list_pk):
    try:
        shopping_list_item = Shopping_List_Item.objects.get(pk=shopping_list_pk)
    except Shopping_List_Item.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        shopping_list_serializer = Shopping_List_Item_DN_Serializer(shopping_list_item)
        return Response(shopping_list_serializer.data)
    elif request.method == 'PATCH':
        shopping_list_partial_serializer = Shopping_List_Item_DN_Serializer(shopping_list_item, data=request.data, partial=True)
        if shopping_list_partial_serializer.is_valid():
            shopping_list_partial_serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(shopping_list_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        shopping_list_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get'])
def many_saved_recipes(request, user_pk):
    user = User.objects.get(pk=user_pk)
    saved_recipes = user.saved_recipes.all()
    saved_recipes_serializer = RecipeOverview_GETSerializer(saved_recipes, many=True)
    return Response(saved_recipes_serializer.data)


@api_view(['get', 'post', 'delete'])
def single_saved_recipe(request, user_pk, recipe_pk):
    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    try:
        recipe = Recipe.objects.get(pk=recipe_pk)
    except Recipe.DoesNotExist: 
        return Response(status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        try:
            recipe_found = user.saved_recipes.get(pk=recipe_pk)
            recipe_serializer = RecipeOverview_GETSerializer(recipe)
            return Response(recipe_serializer.data)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'POST':
        user.saved_recipes.add(recipe)
        recipe_serializer = RecipeOverview_GETSerializer(recipe)
        return Response(recipe_serializer.data, status=status.HTTP_201_CREATED)
    elif request.method == 'DELETE':
        user.saved_recipes.remove(recipe)
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)