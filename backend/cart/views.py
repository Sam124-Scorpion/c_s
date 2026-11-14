from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Cake

# Create your views here.

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)

        cart = Cart.objects.prefetch_related("items__product__images").get(pk=cart.pk)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cake_id = request.data.get("cake_id")
        quantity = request.data.get("quantity", 1)


        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError("Quantity must be a positive integer.")
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)


        cake = get_object_or_404(Cake, pk=cake_id , is_available=True)

        if cake.stock < quantity:
            return Response({"error": "Not enough stock available."}, status=status.HTTP_400_BAD_REQUEST)


        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=cake , defaults={"quantity": quantity})

        if not created:
            cart_item.quantity += int(quantity)
            if cart_item.quantity > cake.stock:
                return Response({"error": "Not enough stock available."}, status=status.HTTP_400_BAD_REQUEST)

            cart_item.quantity = min(cart_item.quantity, cake.stock)
            cart_item.save()

        else:
            cart_item.quantity = int(quantity)
            cart_item.save()

        serializer = CartSerializer(cart)

        return Response({
            "message": "Item added to cart successfully.",
            "cart": serializer.data
        }, status=status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        quantity = request.data.get("quantity")

        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError("Quantity must be a positive integer.")
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)

        if cart_item.product.stock < quantity:
            return Response({"error": "Not enough stock available."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart_item.cart)

        return Response({
            "message": "Cart item updated successfully.",
            "cart": serializer.data
        }, status=status.HTTP_200_OK)

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        cart_item.delete()

        cart = get_object_or_404(Cart, user=request.user)
        serializer = CartSerializer(cart)

        return Response({
            "message": "Cart item removed successfully.",
            "cart": serializer.data
        }, status=status.HTTP_200_OK)
    