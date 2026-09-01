Drop the shop's real QRIS code here as `qris.png`.

The payment page renders whatever `app.payment.channels[].qr-image-url` points at in
Backend/payment-services/src/main/resources/application.yaml (default: /images/payment/qris.png).
Until that file exists the QRIS option shows a "not configured yet" placeholder and
customers can still pay by bank transfer.
