from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Food_Group_Serializer, Food_GETSerializer, Food_POSTSerializer
from .models import Food_Group
from .models import Food

@api_view(['get', 'post', 'delete'])
def many_foods(request):
    if request.method == 'GET':
        if request.query_params:
            foods = Food.objects.filter(food_name__startswith=request.query_params.get('value'))
        else:
            foods = Food.objects.all()
        food_serializer = Food_GETSerializer(foods, many=True)
        return Response(food_serializer.data)
    elif request.method == 'POST':
        for index, ele in enumerate(request.data):
            try:
                food_group = Food_Group.objects.get(food_group=ele['food_group'])
            except Food_Group.DoesNotExist:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            food_group_serializer = Food_Group_Serializer(food_group)
            request.data[index]['food_group'] = food_group_serializer.data['food_group_id']
        food_serializer = Food_POSTSerializer(data=request.data, many=True)
        if food_serializer.is_valid():
            food_serializer.save()
            return Response(food_serializer.data, status=status.HTTP_201_CREATED)
        return Response(food_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        foods = Food.objects.all()
        foods.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['get', 'patch', 'delete'])
def single_food(request, pk):
    try: 
        food = Food.objects.get(pk=pk)
    except Food.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        food_serializer = Food_GETSerializer(food)
        return Response(food_serializer.data)
    elif request.method == 'PATCH':
        food_partial_serializer = Food_GETSerializer(food, data=request.data, partial=True)
        if food_partial_serializer.is_valid():
            food_partial_serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(food_partial_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        food.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['get', 'post'])
def admin_food_group(request):
    if request.method=='GET':
        food_groups = Food_Group.objects.all()
        serializer = Food_Group_Serializer(food_groups, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = Food_Group_Serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

