from django.contrib import admin

# Register your models here.
from .models import Diet, Cuisine, Meal_Type, Recipe, Ingredient

class DietAdmin(admin.ModelAdmin):
    pass
admin.site.register(Diet, DietAdmin)

class CuisineAdmin(admin.ModelAdmin):
    pass
admin.site.register(Cuisine, CuisineAdmin)

class Meal_TypeAdmin(admin.ModelAdmin):
    pass
admin.site.register(Meal_Type, Meal_TypeAdmin)

class RecipeAdmin(admin.ModelAdmin):
    pass
admin.site.register(Recipe, RecipeAdmin)

class IngredientAdmin(admin.ModelAdmin):
    pass
admin.site.register(Ingredient, IngredientAdmin)