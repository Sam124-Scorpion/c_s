from rest_framework import serializers
from .models import Cart , CartItem

class CartItemSerializer(serializers.ModelSerializer):
    cake = serializers.IntegerField(source="product_id", read_only=True)
    cake_name = serializers.CharField(source="product.name", read_only=True)
    cake_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    cake_image = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(
        source="total_price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = [
            "id",
            "cake",
            "cake_name",
            "cake_price",
            "cake_image",
            "quantity",
            "subtotal"
        ]
    def get_cake_image(self, obj):
        primary_image = obj.product.images.filter(is_primary=True).first()

        if primary_image and primary_image.image:
            return primary_image.image.url

        return None




class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many = True , read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Cart
        fields = [
            "id",
            "user",
            "items",
            "total_price",
            "created_at",
            "updated_at",
        ]