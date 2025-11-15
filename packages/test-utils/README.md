# @azora/test-utils

Testing utilities for Azora OS.

## Installation

```bash
npm install @azora/test-utils
```

## Usage

### Factories

```typescript
import { userFactory, courseFactory } from '@azora/test-utils';

const user = userFactory.create({ email: 'custom@email.com' });
const course = courseFactory.create({ price: 500 });
```

### Fixtures

```typescript
import { testUser, testCourse } from '@azora/test-utils';

// Use predefined test data
expect(response.user).toEqual(testUser);
```

### Helpers

```typescript
import { mockRequest, mockResponse, waitFor } from '@azora/test-utils';

const req = mockRequest({ body: { email: 'test@test.com' } });
const res = mockResponse();
await controller.create(req, res);
expect(res.status).toHaveBeenCalledWith(201);
```

### Mocks

```typescript
import { mockPrisma, mockRedis } from '@azora/test-utils';

mockPrisma.user.findUnique.mockResolvedValue(testUser);
```
