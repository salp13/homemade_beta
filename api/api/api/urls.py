"""api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from food.views import fetch_foods, post_foods
from recipes.views import fetch_recipes, fetch_recipe, post_recipes

urlpatterns = [
    path('admin/', admin.site.urls),
    path('fetch_foods/', fetch_foods),
    path('post_foods/', post_foods),
    path('fetch_recipes/', fetch_recipes),
    path('fetch_recipe/', fetch_recipe),
    path('post_recipes/', post_recipes)
]
