/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 */
export const DIRTY_DOZEN_TEST_CASES = [
  {
    id: 1,
    name: 'Reject shadow field injection on product creation',
    collection: 'products',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Reject cross-store document write',
    collection: 'products',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Reject malformed document ID with special characters',
    collection: 'products',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Reject negative product price',
    collection: 'products',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Reject unbounded images array (> 10 elements)',
    collection: 'products',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Reject forged client createdAt timestamp on order creation',
    collection: 'orders',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Reject mutation of immutable createdAt field on update',
    collection: 'products',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Reject invalid order status outside enum',
    collection: 'orders',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Reject product deletion when admin session is inactive',
    collection: 'products',
    operation: 'delete',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Reject spoofed admin email when email_verified is false',
    collection: 'settings',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Reject value poisoning on whitelisted update key',
    collection: 'products',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Reject unfiltered list query missing storeId constraint',
    collection: 'orders',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
  },
];
