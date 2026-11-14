from django.urls import path

from .views import (
    SubmitPaymentReferenceView,
)


urlpatterns = [

    # Customer submits UPI transaction reference
    path(
        "submit-reference/",
        SubmitPaymentReferenceView.as_view(),
        name="submit-payment-reference",
    ),

]