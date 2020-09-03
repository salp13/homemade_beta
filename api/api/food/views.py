from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Food_Group_Serializer, Food_GETSerializer, Food_POSTSerializer
from .models import Food_Group
from .models import Food

@api_view(['get'])
def fetch_foods(request):
    if request.query_params:
        foods = Food.objects.filter(name__startswith=request.query_params.__getitem__('value'))
    else: 
        foods = Food.objects.all()
    serializer = Food_GETSerializer(foods, many=True)
    return Response(serializer.data)

# admin use
@api_view(['post', 'put'])
def post_foods(request):
    for index, ele in enumerate(request.data):
        try:
            food_group = Food_Group.objects.get(food_group=ele['food_group'])
        except Food_Group.DoesNotExist:
            print(ele['food_group'])
        serializer = Food_Group_Serializer(food_group)
        request.data[index]['food_group'] = serializer.data.get('food_group_id')
    serializer = Food_POSTSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['get', 'post'])
def admin_clean(request):
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

