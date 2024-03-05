const request = require('supertest');

const test = (app) => {
  describe('Error handling middleware', () => {
    it('should respond with 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent-route');
      expect(res.statusCode).toBe(404);
      expect(res.text).toBe('Page not found');
    });

    describe('Test error handling', () => {
      it('should handle errors properly', async () => {
        const response = await request(app).get('/test');
        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
      });
    });
  });
};
module.exports = test;
