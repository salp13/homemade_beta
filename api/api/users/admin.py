from django.contrib import admin

# Register your models here.
from .models import User, Fridge_Item, Shopping_List_Item

class UserAdmin(admin.ModelAdmin):
    pass
admin.site.register(User, UserAdmin)

class Fridge_ItemAdmin(admin.ModelAdmin):
    pass
admin.site.register(Fridge_Item, Fridge_ItemAdmin)

class Shopping_List_ItemAdmin(admin.ModelAdmin):
    pass
admin.site.register(Shopping_List_Item, Shopping_List_ItemAdmin)
