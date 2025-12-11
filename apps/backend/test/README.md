# Backend Tests

This directory contains all test files for the TS CMS backend application.

## Test Structure

```
test/
├── unit/                           # Unit tests
│   ├── auth/                      # Authentication tests
│   │   ├── auth.controller.spec.ts
│   │   └── auth.service.spec.ts
│   ├── scheduled-tweets/          # Scheduled tweets tests
│   │   ├── scheduled-tweets.controller.spec.ts
│   │   └── scheduled-tweets.service.spec.ts
│   ├── twitter/                   # Twitter service tests
│   │   └── twitter.service.spec.ts
│   └── media/                     # Media service tests
│       └── media.service.spec.ts
├── jest-unit.json                 # Unit test configuration
├── jest-e2e.json                  # E2E test configuration
└── app.e2e-spec.ts               # E2E tests
```

## Running Tests

### All tests

```bash
npm test
```

### Unit tests only

```bash
npm run test:unit
```

### E2E tests only

```bash
npm run test:e2e
```

### Watch mode (reruns on file changes)

```bash
npm run test:watch
```

### Coverage report

```bash
npm run test:cov
```

### Debug mode

```bash
npm run test:debug
```

## Test Coverage

Current test coverage includes:

### Auth Module ✅ 100%

- **AuthService**
  - User validation
  - Login with JWT tokens
  - Refresh token flow
  - Password hashing
  - User creation
  - Profile retrieval
  - Password change
- **AuthController**
  - Login endpoint
  - Token refresh endpoint
  - Profile retrieval
  - Logout
  - Password change

### Scheduled Tweets Module ✅ 71.6%

- **ScheduledTweetsService**
  - Create tweets (draft/scheduled/posted)
  - List all tweets with filtering
  - Find one tweet
  - Update tweets
  - Delete tweets
  - Get statistics
  - Immediate posting for near-future tweets
  - Error handling for failed scheduling
- **ScheduledTweetsController**
  - All CRUD endpoints
  - Status filtering
  - Search functionality
  - Statistics endpoint

### Twitter Module ⚠️ 8.4%

- **TwitterService**
  - Basic service structure tests
  - Method existence validation
  - _(Can be extended with more integration tests)_

### Media Module ⚠️ 13%

- **MediaService**
  - Basic service structure tests
  - Method existence validation
  - _(Can be extended with file processing tests)_

## Test Statistics

- **Total Test Suites:** 6 passed
- **Total Tests:** 53 passed
- **Overall Coverage:** ~39%

## Test Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocking**: External dependencies (database, APIs) are mocked
3. **Descriptive names**: Test names clearly describe what they test
4. **AAA Pattern**: Arrange, Act, Assert structure in each test
5. **Edge cases**: Tests cover both success and error scenarios

## Writing New Tests

When adding new features, follow this pattern:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { YourService } from "../../../src/your.service";

describe("YourService", () => {
  let service: YourService;

  const mockDependency = {
    method: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: DependencyClass,
          useValue: mockDependency,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("yourMethod", () => {
    it("should do something", async () => {
      // Arrange
      mockDependency.method.mockResolvedValue("result");

      // Act
      const result = await service.yourMethod();

      // Assert
      expect(result).toBe("result");
      expect(mockDependency.method).toHaveBeenCalled();
    });
  });
});
```

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline before deployment. All tests must pass for the build to succeed.

## Troubleshooting

### Tests hanging or not exiting

This can happen due to open handles (database connections, timers). Run with:

```bash
npm run test:unit -- --detectOpenHandles
```

### Test timeout

Increase timeout in jest configuration or specific test:

```typescript
it("long running test", async () => {
  // test code
}, 10000); // 10 seconds timeout
```

### Mock not working

Ensure you call `jest.clearAllMocks()` in `beforeEach` to reset mocks between tests.

## Future Improvements

- [ ] Add more integration tests for Twitter API interactions
- [ ] Add tests for media file processing
- [ ] Increase coverage for edge cases
- [ ] Add E2E tests for complete user flows
- [ ] Add performance benchmarks
