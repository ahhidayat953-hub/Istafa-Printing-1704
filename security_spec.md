# Security Specification & Red Team Audit — ISTAFA PRINTING

## 1. Data Invariants
1. **Store Isolation Invariant**: Every business document (`settings`, `categories`, `products`, `gallery`, `orders`, `customers`, `finance_transactions`, `debts_receivables`, `audit_logs`) must have `storeId == 'istafa_printing'` to prevent cross-tenant contamination.
2. **Anti-Reset Seed Invariant**: Initial default seeding is only permitted when `/settings/store_config` does not yet exist (`!exists(/databases/$(database)/documents/settings/store_config)`). Once initialized, only an authenticated Administrator can mutate catalog, gallery, finance, or store settings.
3. **Strict Schema & Key Validation**: Every write (`create` and `update`) is wrapped by `isValid[Entity](incoming())` enforcing `hasAll`, `hasOnly`, string `.size()` bounds, array `.size()` bounds, numeric boundaries, and `request.time` server timestamp integrity.
4. **Action-Based Updates**: Every `allow update` block begins with `isValid[Entity](incoming())`, verifies immutable fields (`id`, `storeId`, `createdAt`), and constrains modified keys via `incoming().diff(existing()).affectedKeys().hasOnly(...)`.
5. **Query Enforcer on List**: No `allow list` block uses `if true` or `get()`/`exists()`. All `list` operations enforce `resource.data.storeId == 'istafa_printing'` (plus `resource.data.adminScope == 'istafa_admin'` for internal admin collections).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Product Create**: `{ id: 'p1', storeId: 'istafa_printing', ..., isHacked: true }` -> Rejected by `data.keys().hasOnly(...)`.
2. **Cross-Store Poisoning**: `{ id: 'p1', storeId: 'other_store', ... }` -> Rejected by `data.storeId == 'istafa_printing'`.
3. **ID Poisoning (2KB junk ID)**: Document path `/products/a_very_long_2000_char_id$$$` -> Rejected by `isValidId(productId)`.
4. **Negative Product Price**: `{ price: -50000 }` -> Rejected by `data.price >= 0`.
5. **Unbounded Image Array (> 10 images)**: `{ images: ['1','2',...,'15'] }` -> Rejected by `data.images.size() <= 10`.
6. **Fake Client Timestamp on Create**: `{ createdAt: Timestamp.fromMillis(1000) }` -> Rejected by `incoming().createdAt == request.time`.
7. **Mutating Immutable `createdAt` on Update**: `{ createdAt: request.time }` -> Rejected by `incoming().createdAt == existing().createdAt`.
8. **Invalid Order Status Enum**: `{ status: 'HACKED_STATUS' }` -> Rejected by `data.status in ['Baru', 'Diproses', 'Selesai', 'Dibatalkan']`.
9. **Unauthorized Product Delete when Logged Out**: `deleteDoc('/products/p1')` when `session_state.active == false` and not signed in -> Rejected by `isAdmin()`.
10. **Email Spoofing with Unverified Email**: Auth token with `email == 'ahhidayat953@gmail.com'` and `email_verified == false` -> Rejected by `request.auth.token.email_verified == true`.
11. **Value Poisoning on Whitelisted Update Field**: Updating `price` on Product with `'free'` (string instead of number) -> Rejected because `isValidProduct(incoming())` wraps the entire `allow update` expression.
12. **Blanket Unfiltered List Query on Orders**: `getDocs(collection(db, 'orders'))` without `where('storeId', '==', 'istafa_printing')` and `where('adminScope', '==', 'istafa_admin')` -> Rejected by `allow list`.

## 3. Red Team Conflict & Audit Report
- **Identity Spoofing**: Blocked via `request.auth.token.email_verified == true` and server-validated session state.
- **Shadow Updates**: Blocked via strict `hasAll` + `hasOnly` in every `isValid[Entity]` helper and `affectedKeys().hasOnly(...)` in every `update` rule.
- **Value Poisoning**: Blocked because `isValid[Entity](incoming())` is the outer guard on every `allow update`.
- **Resource Exhaustion / Denial of Wallet**: Blocked via `isValidId()`, string `.size()` limits, bounded arrays, and zero `get()`/`exists()` calls inside `allow list`.
