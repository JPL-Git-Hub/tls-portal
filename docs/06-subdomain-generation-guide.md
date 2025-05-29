# Subdomain Generation Guide

## Overview

The TLS Portal system automatically generates unique subdomains for each client portal. This guide documents the subdomain generation patterns, rules, and implementation considerations.

## Subdomain Format

Each subdomain follows a strict 8-character format:
- **First 4 characters**: Letters from the client's last name
- **Last 4 characters**: Digits from the client's mobile number

### Format Pattern
```
[4 letters][4 digits]
```

### Examples
- John Smith, (212) 555-1234 → `smit1234`
- Amy Li, (415) 555-0001 → `lixx0001`
- Patrick O'Brien, (555) 555-4321 → `obri4321`

## Generation Rules

### 1. Last Name Processing
- Convert to lowercase
- Remove all non-alphabetic characters (apostrophes, hyphens, spaces)
- Take the first 4 letters
- If shorter than 4 letters, pad with 'x'

**Examples:**
- "Smith" → "smit"
- "Johnson" → "john"
- "Li" → "lixx"
- "Wu" → "wuxx"
- "O" → "oxxx"
- "O'Brien" → "obri" (apostrophe removed)
- "Van Der Berg" → "vand" (spaces removed)

### 2. Mobile Number Processing
- Extract all digits from the phone number
- Remove formatting characters: parentheses, hyphens, spaces, plus signs
- Take the last 4 digits
- Require at least 4 digits total

**Examples:**
- "(212) 555-1234" → "1234"
- "+1 415-555-9876" → "9876"
- "555-0001" → "0001"
- "123-456-7890" → "7890"

## Implementation Pattern

### Basic Generation Function
```typescript
function generateSubdomain(lastName: string, mobile: string): string {
  // Clean last name: lowercase, letters only
  const cleanLastName = lastName.trim().toLowerCase().replace(/[^a-z]/g, '');
  
  // Clean mobile: digits only
  const cleanMobile = mobile.replace(/\D/g, '');
  
  // Create subdomain parts
  const namePrefix = cleanLastName.substring(0, 4).padEnd(4, 'x');
  const mobileSuffix = cleanMobile.slice(-4);
  
  return `${namePrefix}${mobileSuffix}`;
}
```

### Validation Function
```typescript
function isValidSubdomain(subdomain: string): boolean {
  // Must be exactly 8 characters: 4 letters + 4 digits
  const pattern = /^[a-z]{4}\d{4}$/;
  return pattern.test(subdomain);
}
```

## Handling Edge Cases

### 1. Short Last Names
Names shorter than 4 letters are padded with 'x':
- "Li" → "lixx"
- "Wu" → "wuxx"
- "O" → "oxxx"

### 2. Special Characters
All non-alphabetic characters are removed:
- "O'Brien" → "obri"
- "Smith-Jones" → "smit"
- "Van Der Berg" → "vand"

### 3. International Phone Numbers
Extract only the digits, use last 4:
- "+1 (415) 555-0001" → "0001"
- "+44 20 7123 4567" → "4567"

### 4. Insufficient Phone Digits
The system requires at least 4 digits in the phone number. If less, generation fails with an error.

## Uniqueness and Collisions

### Collision Detection
While the combination of name + phone typically ensures uniqueness, collisions can occur:
- Same last name prefix + same last 4 digits
- Family members with sequential phone numbers

### Collision Resolution Strategy
```typescript
function generateUniqueSubdomain(
  lastName: string,
  mobile: string,
  existingSubdomains: string[]
): string {
  const baseSubdomain = generateSubdomain(lastName, mobile);
  
  if (!existingSubdomains.includes(baseSubdomain)) {
    return baseSubdomain;
  }
  
  // Append counter for uniqueness
  let counter = 2;
  let uniqueSubdomain = `${baseSubdomain}${counter}`;
  
  while (existingSubdomains.includes(uniqueSubdomain)) {
    counter++;
    uniqueSubdomain = `${baseSubdomain}${counter}`;
  }
  
  return uniqueSubdomain;
}
```

## Portal URL Formation

Once generated, the subdomain forms the complete portal URL:
```
https://[subdomain].thelawshop.com
```

Examples:
- `https://smit1234.thelawshop.com`
- `https://lixx0001.thelawshop.com`
- `https://obri4321.thelawshop.com`

## Testing Subdomain Generation

### Test Cases to Consider
1. **Standard names**: Common first/last names
2. **Short names**: 1-3 letter last names
3. **Special characters**: Apostrophes, hyphens, spaces
4. **International formats**: Various phone number formats
5. **Edge cases**: Empty strings, invalid inputs

### Example Test Data
```javascript
const testCases = [
  { lastName: 'Smith', mobile: '(212) 555-1234' },      // Standard
  { lastName: 'Li', mobile: '555-0001' },               // Short name
  { lastName: "O'Brien", mobile: '555-4321' },          // Apostrophe
  { lastName: 'Van Der Berg', mobile: '202-555-0199' }, // Spaces
];
```

## Client Record Structure

When storing client data, include the generated subdomain:

```javascript
{
  id: 'unique-id',
  subdomain: 'smit1234',
  profile: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    mobile: '(212) 555-1234'
  },
  portalUrl: 'https://smit1234.thelawshop.com',
  status: 'active'
}
```

## Best Practices

1. **Validate inputs** before generation
2. **Store the original** phone number and name exactly as entered
3. **Cache subdomain** to avoid regeneration
4. **Check uniqueness** before assignment
5. **Log generation** for debugging
6. **Handle errors gracefully** with user-friendly messages

## Security Considerations

1. **Don't expose** the generation algorithm publicly
2. **Validate subdomain format** on every request
3. **Rate limit** subdomain generation attempts
4. **Log suspicious patterns** (e.g., sequential generation attempts)
5. **Never use** subdomain as sole authentication

## Troubleshooting

### Common Issues

1. **"Mobile number must have at least 4 digits"**
   - Ensure phone number contains at least 4 numeric digits
   - Check for formatting issues

2. **Invalid subdomain format**
   - Verify the generated string matches `[a-z]{4}\d{4}` pattern
   - Check for unexpected characters

3. **Collision on generation**
   - Implement unique subdomain generation with counter
   - Consider adding additional entropy if needed

### Debugging Tips
- Log the cleaned inputs (name and mobile) before generation
- Verify the regex patterns match expected formats
- Test with various international phone formats
- Ensure consistent string encoding (UTF-8)