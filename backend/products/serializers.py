from rest_framework import serializers
from .models import Cake, CakeImage, Category




class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']


class CakeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeImage
        fields = ['id', 'cake', 'image', 'created_at', 'is_primary', 'updated_at']


class CakeSerializer(serializers.ModelSerializer):
    images = CakeImageSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
    )

    class Meta:
        model = Cake
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'weight',
            'is_featured', 'is_available', 'category', 'category_id',
            'images', 'created_at', 'updated_at',
        ]

    def validate(self, attrs):
        if self.instance is None and 'category' not in attrs:
            raise serializers.ValidationError({'category_id': 'This field is required.'})
        return attrs



class CakeImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeImage
        fields = ['id', 'image', 'is_primary']
