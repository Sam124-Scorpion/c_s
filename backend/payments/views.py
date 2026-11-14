from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Payment
from .serializers import SubmitPaymentReferenceSerializer
from orders.email import send_order_confirmation_email

class SubmitPaymentReferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubmitPaymentReferenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            payment = get_object_or_404(
                Payment.objects.select_for_update(),
                order__user=request.user,
                order_id=request.data.get("order_id"),
                payment_method="upi",
            )

            if payment.payment_status == "completed":
                return Response(
                    {
                        "message": "Payment has already been completed.",
                        "payment_id": payment.id,
                        "payment_status": payment.payment_status,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order = payment.order

            # Lock the order's cakes before changing stock.
            for order_item in order.items.select_related("cake").select_for_update():
                cake = order_item.cake

                if not cake.is_available:
                    return Response(
                        {
                            "error": f"{cake.name} is no longer available."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if cake.stock < order_item.quantity:
                    return Response(
                        {
                            "error": f"Not enough stock for {cake.name}."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Deduct stock after the customer submits the UTR.
            for order_item in order.items.select_related("cake").select_for_update():
                cake = order_item.cake
                cake.stock -= order_item.quantity
                cake.save(update_fields=["stock", "updated_at"])

            # Mark payment as completed.
            payment.transaction_reference = serializer.validated_data[
                "transaction_reference"
            ]
            payment.payment_status = "completed"
            payment.save(
                update_fields=[
                    "transaction_reference",
                    "payment_status",
                    "updated_at",
                ]
            )

            # Mark the order as paid and processing.
            order.payment_status = "paid"
            order.status = "processing"
            order.save(
                update_fields=[
                    "payment_status",
                    "status",
                    "updated_at",
                ]
            )

        send_order_confirmation_email(order)
        
        return Response(
            {
                "message": "Payment completed successfully.",
                "payment_id": payment.id,
                "order_id": order.id,
                "payment_status": payment.payment_status,
                "order_payment_status": order.payment_status,
                "order_status": order.status,
            },
            status=status.HTTP_200_OK,
        )