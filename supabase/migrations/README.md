# Database migrations

No migrations yet. Phase 2 introduces the full schema (products, orders,
inventory, roles/permissions, RLS policies, etc.) as numbered SQL files here,
e.g.:

```
0001_roles_and_permissions.sql
0002_catalog.sql
0003_inventory.sql
...
```

Each migration is applied via the Supabase CLI (`supabase db push` /
`supabase migration up`) against a project, and is version-controlled —
no manual, undocumented changes to the database schema.
