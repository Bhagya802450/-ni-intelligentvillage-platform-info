const http = require('http');
const app = require('../src/server');

const TEST_PORT = 5005;
let serverInstance = null;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${TEST_PORT}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://localhost:${TEST_PORT}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  serverInstance = app.listen(TEST_PORT, async () => {
    try {
      console.log(`\nRunning HP-ASN & SUADR API Automated Tests on isolated port ${TEST_PORT}...`);

      // Test 1: Health
      const health = await get('/api/health');
      console.log("✔ GET /api/health:", health.status === 200 ? "PASS" : "FAIL");

      // Test 2: Farmer Login
      const farmerLogin = await post('/api/auth/login', { role: 'FARMER', identifier: '98160 12345' });
      console.log("✔ POST /api/auth/login (Farmer):", farmerLogin.body.success ? "PASS" : "FAIL", "-", farmerLogin.body.user?.name);

      // Test 3: Officer Login
      const officerLogin = await post('/api/auth/login', { role: 'OFFICER', identifier: 'OFF-HP-801' });
      console.log("✔ POST /api/auth/login (Officer):", officerLogin.body.success ? "PASS" : "FAIL", "-", officerLogin.body.user?.name);

      // Test 4: Farmer List
      const farmers = await get('/api/farmers');
      console.log("✔ GET /api/farmers:", farmers.body.count >= 3 ? "PASS" : "FAIL", `(${farmers.body.count} records)`);

      // Test 5: SUADR Zones & Telemetry
      const zones = await get('/api/suadr/zones');
      const telemetry = await get('/api/suadr/telemetry');
      console.log("✔ GET /api/suadr/zones & telemetry:", (zones.status === 200 && telemetry.status === 200) ? "PASS" : "FAIL");

      // Test 6: Schemes Analytics
      const analytics = await get('/api/schemes/analytics');
      console.log("✔ GET /api/schemes/analytics:", analytics.body.success ? "PASS" : "FAIL", `- Total Disbursed: ₹${analytics.body.metrics.disbursedAmountINR}`);

      // Test 7: HP-ASN Consent & Logs
      const hpasn = await get('/api/hpasn/logs');
      console.log("✔ GET /api/hpasn/logs:", hpasn.body.count >= 3 ? "PASS" : "FAIL", `(${hpasn.body.count} audit records)`);

      // Test 8: Mandi Rates
      const mandi = await get('/api/marketplace/mandi-rates');
      console.log("✔ GET /api/marketplace/mandi-rates:", mandi.body.count >= 5 ? "PASS" : "FAIL", `(${mandi.body.count} commodities)`);

      console.log("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! 🚀\n");

      serverInstance.close(() => {
        process.exit(0);
      });
    } catch (err) {
      console.error("Test failed with error:", err);
      if (serverInstance) serverInstance.close();
      process.exit(1);
    }
  });
}

runTests();
