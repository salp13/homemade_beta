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
from food.views import many_foods, single_food, admin_food_group
from recipes.views import many_recipes, single_recipe, admin_post
from users.views import many_users, single_user, metric_data, many_fridge, single_fridge, many_shopping_list, single_shopping_list, many_saved_recipes, single_saved_recipe


urlpatterns = [
    path('admin/', admin.site.urls),
    path('many_foods/', many_foods),
    path('single_food/<uuid:pk>', single_food),
    path('admin_food_group', admin_food_group),
    path('many_recipes/', many_recipes),
    path('single_recipe/<uuid:pk>', single_recipe),
    path('admin_post', admin_post),
    path('many_users', many_users),
    path('single_user/<uuid:user_pk>', single_user),
    path('metric_data/<uuid:user_pk>', metric_data),
    path('many_fridge/<uuid:user_pk>', many_fridge),
    path('single_fridge/<uuid:user_pk>/<uuid:fridge_pk>', single_fridge),
    path('many_shopping_list/<uuid:user_pk>', many_shopping_list),
    path('single_shopping_list/<uuid:user_pk>/<uuid:shopping_list_pk>', single_shopping_list),
    path('many_saved_recipes/<uuid:user_pk>', many_saved_recipes),
    path('single_saved_recipe/<uuid:user_pk>/<uuid:recipe_pk>', single_saved_recipe),
]
