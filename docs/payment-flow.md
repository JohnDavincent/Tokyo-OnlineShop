# Manual Payment Flow (payment-services)

Tokyo GO takes payment manually: the customer transfers to a QRIS code or a bank
account, presses **I Have Paid**, and an admin approves or rejects the claim from
an inbox. Nothing is settled by a gateway — an admin decision is the only thing
that turns an order into a sale.

## Services involved

| Service | Port | Role |
|---|---|---|
| `transaction-services` | 5004 | Owns the order. Publishes the checkout, consumes the payment outcome. |
| `payment-services` | 5101 | Owns the payment window, the channels, the admin inbox, and the expiry sweep. |
| Kafka | 9092 | Carries the two events between them. |

## The states

**Payment** (`payment_service.payments`)

```
WAITING_PAYMENT ──customer confirms──▶ WAITING_CONFIRMATION ──admin approves──▶ PAID
       │                                        └─────────admin rejects──────▶ REJECTED
       └──window lapses──▶ EXPIRED
```

**Transaction** mirrors it: `WAITING_PAYMENT` → `WAITING_CONFIRMATION` → `SUCCESS`
/ `FAILED` / `EXPIRED`. (`PENDING` is kept only for orders created before this flow
existed.)

## The events

Both records live in `common` (`com.tokyo.common.event`) so producer and consumer
cannot drift.

| Topic | Producer | Consumer | Payload |
|---|---|---|---|
| `tokyo.transaction.created` | transaction-services | payment-services | `TransactionCreatedEvent` |
| `tokyo.payment.completed` | payment-services | transaction-services | `PaymentCompletedEvent` (`APPROVED` / `REJECTED` / `EXPIRED`) |

Both are published through `@TransactionalEventListener(AFTER_COMMIT)`, so an event
never escapes for a database transaction that rolled back. The consumer on the
payment side is idempotent (a duplicate `transactionId` is ignored), and the
transaction side ignores any outcome for an order that already reached a final
state — Kafka delivers at least once.

## Walkthrough

1. **Checkout.** `POST /tokyo/gropup/transaction` creates the order as
   `WAITING_PAYMENT` and emits `tokyo.transaction.created`. The response now
   carries `transactionId`, which the cart uses to send the customer to
   `/payment/{transactionId}`.
2. **Window opens.** payment-services creates a `Payment` in `WAITING_PAYMENT`
   with `expiresAt = now + app.payment.expiry-minutes` (default 30).
3. **Customer pays.** The payment page shows a countdown, the amount, and the
   channel picker. Picking one (`POST /payment/{id}/method`) snapshots the channel
   onto the payment and renders the QRIS image or the account number.
4. **Customer confirms.** `POST /payment/{id}/confirm` (optional sender name and
   note) moves the payment to `WAITING_CONFIRMATION`. The page then polls until a
   decision lands.
5. **Admin decides.** `/admin/payments` lists everything waiting. Approve emits
   `APPROVED`; reject emits `REJECTED` with the reason. The same two buttons also
   appear on the admin order detail page.
6. **Order settles.** transaction-services consumes the outcome: `APPROVED` sets
   `SUCCESS` and bumps the product sold counters; `REJECTED` sets `FAILED`;
   `EXPIRED` sets `EXPIRED`. Both cancellations record `cancelledAt` /
   `cancelledBy`.
7. **Nobody paid.** `PaymentExpiryScheduler` sweeps lapsed windows every
   `app.payment.expiry-scan-ms` (default 60s) and emits `EXPIRED`. Any read of a
   lapsed payment also closes it immediately, so the customer never sees a live
   pay-now screen for a dead window.

## Endpoints

Customer (`/tokyo/gropup/payment`, authenticated, owner-only):

- `GET /channels`
- `GET /transaction/{transactionId}`
- `POST /{paymentId}/method` — `{ "channelCode": "BCA" }`
- `POST /{paymentId}/confirm` — `{ "payerName": "...", "note": "..." }`

Admin (`/tokyo/gropup/ad-min/payment`, `ROLE_ADMIN`):

- `GET /inbox?status=&keyword=&currentPage=&pageSize=` — defaults to `WAITING_CONFIRMATION`
- `GET /inbox/count` — drives the sidebar badge
- `GET /{paymentId}` and `GET /transaction/{transactionId}`
- `POST /{paymentId}/approve`
- `POST /{paymentId}/reject` — `{ "reason": "..." }`

`POST /transaction/{id}/confirm` and `POST /ad-min/transaction/{id}/confirm` were
removed from transaction-services: an order status is now only ever changed by a
payment outcome.

## Configuration

Payment channels are configuration, not a table — they belong to the shop, not to
an order. Edit `app.payment.channels` in
`Backend/payment-services/src/main/resources/application.yaml`:

```yaml
app:
  payment:
    expiry-minutes: 30
    expiry-scan-ms: 60000
    channels:
      - code: QRIS_MAIN
        method: QRIS
        label: QRIS
        qr-image-url: /images/payment/qris.png
      - code: BCA
        method: BANK_TRANSFER
        label: Bank BCA
        account-number: "1234567890"
        account-name: "PT Tokyo Guntung Online"
```

`qr-image-url` is resolved by the frontend, so the real QRIS code goes in
`Frontend/tokyogo-frontend/public/images/payment/qris.png`. Until it exists the
QRIS option shows a placeholder and bank transfer still works.

## Running it

```bash
# 1. Kafka (and Postgres, if you use the local one)
docker compose -f infra/docker-compose.yml up -d

# 2. Once per database — Hibernate creates tables, not schemas
psql "$DATABASE_URL" -f infra/payment-schema.sql

# 3. Services
cd Backend && ./mvnw -pl payment-services spring-boot:run
```

Topics are declared as `NewTopic` beans in both services, so a fresh broker does
not depend on auto-creation.
