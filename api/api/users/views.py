from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Fridge_Item_Serializer, User_GETSerializer, User_POSTSerializer
from .models import User, Fridge_Item
import datetime

@api_view(['get'])
def fetch_users(request):
    users = User.objects.all()
    serializer = User_GETSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['post'])
def post_users(request):
    serializer = User_POSTSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['get', 'put', 'delete'])
def single_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = User_GETSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = User_POSTSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['put', 'post', 'delete'])
def user_fridge(request, pk, foodPK):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        food = Food.objects.get(pk=foodPK)
    except Food.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        fridge_item = Fridge_Item.get(user=user, food=food)
    except Fridge_Item.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = Fridge_Item_Serializer(fridge_item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'POST':
        exp_days = food.default_days_to_exp
        user.fridge_item.add(food, through_defaults={'expiration_date': datetime.datetime.now() + datetime.timedelta(days=exp_days)})
        return Response(status=status.HTTP_201_CREATED)
    elif request.method == 'DELETE':
        user.fridge_item.remove(food)
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['post', 'delete'])
def user_shopping_list(request, pk, foodPK):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        food = Food.objects.get(pk=foodPK)
    except Food.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'POST':
        user.shopping_list.add(food)
        return Response(status=status.HTTP_201_CREATED)
    elif request.method == 'DELETE':
        user.shopping_list.remove(food)
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['post', 'delete'])
def user_saved_recipes(request, pk, recipePK):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        recipe = Recipe.objects.get(pk=recipePK)
    except Recipe.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'POST':
        user.saved_recipes.add(recipe)
        return Response(status=status.HTTP_201_CREATED)
    elif request.method == 'DELETE':
        user.saved_recipes.remove(recipe)
        return Response(status=status.HTTP_204_NO_CONTENT)
