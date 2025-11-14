import * as http from 'http';

describe('Health Check', () => {
  it('should return 200 OK', (done) => {
    http.get('http://localhost:3000/health', (res) => {
      expect(res.statusCode).toBe(200);
      done();
    });
  });
});
