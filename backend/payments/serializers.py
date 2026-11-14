from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "payment_method",
            "amount",
            "transaction_reference",
            "status",
            "verified_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order",
            "amount",
            "status",
            "verified_by",
            "created_at",
            "updated_at",
        ]


class SubmitPaymentReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["transaction_reference"]

    def validate_transaction_reference(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Please enter a valid UPI transaction reference."
            )
        if len(value) < 6:
            raise serializers.ValidationError(
                "Transaction reference must contain at least 6 characters."
            )
        return value