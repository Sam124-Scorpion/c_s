from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsSuperuser
from .models import Order
from .serializers import (
    AdminOrderSerializer,
    CustomerOrderCreateSerializer,
    CustomerOrderSerializer,
)


class CustomerOrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related(
            'items__cake',
        ).order_by('-created_at')
        return Response(CustomerOrderSerializer(orders, many=True).data)

    def post(self, request):
        serializer = CustomerOrderCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response({
            'message': 'Order placed successfully.',
            'order': CustomerOrderSerializer(order).data,
        }, status=status.HTTP_201_CREATED)


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.select_related('user').prefetch_related(
        'items__cake',
    ).order_by('-created_at')
    serializer_class = AdminOrderSerializer
    permission_classes = [IsSuperuser]


class AdminOrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = AdminOrderSerializer
    permission_classes = [IsSuperuser]
    http_method_names = ['patch', 'head', 'options']
