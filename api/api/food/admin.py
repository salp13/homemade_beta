from django.contrib import admin

# Register your models here.
from .models import Food, Food_Group

class FoodAdmin(admin.ModelAdmin):
    pass
admin.site.register(Food, FoodAdmin)

class Food_GroupAdmin(admin.ModelAdmin):
    pass
admin.site.register(Food_Group, Food_GroupAdmin)