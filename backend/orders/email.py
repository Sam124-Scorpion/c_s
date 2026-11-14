from django.conf import settings
from django.core.mail import EmailMultiAlternatives


def send_order_confirmation_email(order):
    user = order.user

    if not user.email:
        return

    subject = f"Order #{order.id} confirmed - Cake Shop"

    items = order.items.select_related('cake').all()

    item_rows = ""

    for item in items:
        item_total = item.quantity * item.price

        item_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
                {item.cake.name}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
                {item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
                ₹{item_total:.2f}
            </td>
        </tr>
        """

    payment_method = (
        order.payment.payment_method.upper()
        if hasattr(order, 'payment')
        else ''
    )

    text_content = f"""
Hello {user.first_name or user.username},

Thank you for ordering from Cake Shop.

Your order #{order.id} has been confirmed.

Total amount: ₹{order.total_price:.2f}

Payment method: {payment_method}

Delivery date: {order.delivery_date}
Delivery time: {order.delivery_time}

We look forward to delivering your cake!

Thank you,
Cake Shop
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f8f5f2;
    font-family: Arial, sans-serif;
">

<div style="
    max-width: 600px;
    margin: 40px auto;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
">

    <div style="
        padding: 30px;
        text-align: center;
        background: #fff0f5;
    ">
        <h1 style="margin: 0;">
            🍰 Cake Shop
        </h1>

        <p>
            Order confirmed!
        </p>
    </div>

    <div style="padding: 30px;">

        <h2>
            Thank you, {user.first_name or user.username}!
        </h2>

        <p>
            Your order <strong>#{order.id}</strong>
            has been confirmed successfully.
        </p>

        <h3>Order details</h3>

        <table style="
            width: 100%;
            border-collapse: collapse;
        ">

            <thead>
                <tr>
                    <th style="text-align: left; padding: 8px;">
                        Cake
                    </th>

                    <th style="text-align: left; padding: 8px;">
                        Qty
                    </th>

                    <th style="text-align: left; padding: 8px;">
                        Price
                    </th>
                </tr>
            </thead>

            <tbody>
                {item_rows}
            </tbody>

        </table>

        <div style="
            margin-top: 20px;
            padding: 15px;
            background: #fff8e8;
            border-radius: 10px;
        ">

            <p>
                <strong>Total:</strong>
                ₹{order.total_price:.2f}
            </p>

            <p>
                <strong>Payment:</strong>
                {payment_method}
            </p>

            <p>
                <strong>Delivery date:</strong>
                {order.delivery_date}
            </p>

            <p>
                <strong>Delivery time:</strong>
                {order.delivery_time}
            </p>

        </div>

        <p style="margin-top: 25px;">
            We look forward to delivering your cake! 🎂
        </p>

    </div>

    <div style="
        padding: 20px;
        text-align: center;
        background: #fafafa;
        color: #777;
    ">
        Cake Shop · Thank you for shopping with us
    </div>

</div>

</body>
</html>
"""

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()