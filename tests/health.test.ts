import request from 'supertest';
import app from '../src/app';

describe('Health check', () => {
  it('GET /health returns 200 and success payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Server is running',
    });
    expect(res.body.timestamp).toBeDefined();
  });
});
