import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';
const TOKEN = __ENV.TOKEN || 'dummy_token';

export default function () {
  // Test reading menu (high traffic public read)
  const menuRes = http.get(`${BASE_URL}/public/order/${TOKEN}`);
  
  check(menuRes, {
    'menu read status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
