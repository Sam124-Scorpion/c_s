from django.contrib import admin
from .models import Category , CakeImage , Cake
# Register your models here.


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(Cake)
class CakeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'price', 'category', 'weight', 'stock', 'is_featured', 'is_available', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('category', 'is_featured', 'is_available')

@admin.register(CakeImage)
class CakeImageAdmin(admin.ModelAdmin):
    list_display = ('cake', 'image', 'created_at', 'is_primary', 'updated_at')
    search_fields = ('cake__name',)
    list_filter = ('is_primary',)