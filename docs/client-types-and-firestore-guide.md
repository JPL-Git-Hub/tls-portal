# Client Types and Firestore Data Structure Guide

## Understanding Client Type Definitions

Client type definitions are TypeScript interfaces that define the **structure of client data** in our application. They serve as a blueprint for what data fields a client record contains.

### What Are Client Type Definitions?

Client type definitions are essentially:
- **Client data structure** - The shape of client data
- **Client data fields** - What properties each client has
- **Client data schema** - The blueprint for client records
- **Client record format** - How client data is organized

### Example Type Definition

```typescript
interface Client {
  id: string;           // Unique identifier
  firstName: string;    // Client's first name
  lastName: string;     // Client's last name
  email: string;        // Contact email
  subdomain: string;    // Unique portal subdomain
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;      // When record was created
}
```

## Relationship to Firestore

### Firestore Structure

In Firestore, data is organized in:
1. **Collections** - Groups of documents (like folders)
2. **Documents** - Individual records (like files)

### How Types Map to Firestore

```
Firestore Structure:
└── tenants (collection)
    └── default-tenant (document)
        └── clients (collection)
            ├── ABC123 (document) ← This contains Client data
            ├── DEF456 (document) ← This contains Client data
            └── GHI789 (document) ← This contains Client data
```

### Type Definition → Firestore Document

The TypeScript `Client` interface defines exactly what fields each document in the `clients` collection will have:

```typescript
// TypeScript Definition
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subdomain: string;
}

// Becomes this Firestore Document
{
  "id": "ABC123",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "subdomain": "smit4567"
}
```

## Benefits of Type Definitions

1. **Type Safety** - TypeScript ensures you use the correct data structure
2. **IntelliSense** - IDE auto-completion knows what fields are available
3. **Documentation** - Types serve as living documentation of data structure
4. **Consistency** - Same structure used across frontend, backend, and database
5. **Validation** - Can generate validation schemas from types

## Example: Full Client Data Flow

```typescript
// 1. Type Definition (shared/types/client.ts)
export interface Client {
  id: string;
  tenantId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  subdomain: string;
  status: 'active' | 'inactive' | 'archived';
}

// 2. Frontend Form uses the type
const formData: CreateClientInput = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  mobile: "(555) 123-4567"
};

// 3. Backend Controller uses the type
const newClient: Client = {
  id: generateId(),
  tenantId: "default-tenant",
  profile: { ...formData },
  subdomain: generateSubdomain(formData),
  status: 'active'
};

// 4. Saved to Firestore
await db
  .collection('tenants')
  .doc(tenantId)
  .collection('clients')  // Collection of Client documents
  .doc(newClient.id)      // Individual Client document
  .set(newClient);        // Data matches Client type
```

## Key Concepts

- **Type Definition**: The TypeScript interface that defines data structure
- **Collection**: Firestore container for multiple documents of the same type
- **Document**: Individual record in Firestore that follows the type structure
- **Schema**: The overall structure and validation rules for the data

## Summary

Client type definitions in `client.ts` define the **exact structure** of client data that will be:
1. Collected in the React form
2. Validated on the backend
3. Stored as documents in Firestore collections
4. Retrieved and displayed in the application

This ensures consistency and type safety across the entire application stack.