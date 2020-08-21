from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import Food_Group_Serializer
from .serializers import Food_GETSerializer
from .serializers import Food_POSTSerializer
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
    serializer = Food_POSTSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)