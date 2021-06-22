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
from django.contrib import admin, auth
from django.urls import path
from food.views import many_foods, single_food, admin_food_group, single_food_group
from recipes.views import many_recipes, single_recipe, admin_post
from users.views import login, signup, many_users, single_user, metric_data, many_fridge, single_fridge, many_shopping_list, single_shopping_list, many_saved_recipes, single_saved_recipe


urlpatterns = [
    path('homemade/admin/', admin.site.urls),
    path('homemade/many_foods/', many_foods),
    path('homemade/single_food/<uuid:pk>', single_food),
    path('homemade/single_food_group/<int:pk>', single_food_group),
    path('homemade/admin_food_group', admin_food_group),
    path('homemade/many_recipes/', many_recipes),
    path('homemade/single_recipe/<uuid:pk>', single_recipe),
    path('homemade/admin_post', admin_post),
    path('homemade/many_users', many_users),
    path('homemade/single_user/<uuid:user_pk>', single_user),
    path('homemade/metric_data/<uuid:user_pk>', metric_data),
    path('homemade/many_fridge/<uuid:user_pk>', many_fridge),
    path('homemade/single_fridge/<uuid:user_pk>/<int:fridge_pk>', single_fridge),
    path('homemade/many_shopping_list/<uuid:user_pk>', many_shopping_list),
    path('homemade/single_shopping_list/<uuid:user_pk>/<int:shopping_list_pk>', single_shopping_list),
    path('homemade/many_saved_recipes/<uuid:user_pk>', many_saved_recipes),
    path('homemade/single_saved_recipe/<uuid:user_pk>/<uuid:recipe_pk>', single_saved_recipe),
    path('homemade/login', login),
    path('homemade/signup', signup)
]

# urlpatterns += [
#     path('accounts/', auth.urls),
# ]
