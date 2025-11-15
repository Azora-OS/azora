import supertest from 'supertest';

export const apiHelper = {
  createRequest: (app: any) => supertest(app),

  expectSuccess: (response: supertest.Response, statusCode: number = 200) => {
    expect(response.status).toBe(statusCode);
    expect(response.body).toBeDefined();
  },

  expectError: (response: supertest.Response, statusCode: number, message?: string) => {
    expect(response.status).toBe(statusCode);
    expect(response.body.error).toBeDefined();
    if (message) {
      expect(response.body.error).toContain(message);
    }
  },

  expectValidationError: (response: supertest.Response, field?: string) => {
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    if (field) {
      expect(response.body.errors).toHaveProperty(field);
    }
  },

  expectUnauthorized: (response: supertest.Response) => {
    expect(response.status).toBe(401);
  },

  expectForbidden: (response: supertest.Response) => {
    expect(response.status).toBe(403);
  },

  expectNotFound: (response: supertest.Response) => {
    expect(response.status).toBe(404);
  },
};
