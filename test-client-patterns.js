#!/usr/bin/env node

// Test script to verify subdomain generation patterns
const http = require('http');

const testClients = [
  {
    firstName: 'Amy',
    lastName: 'Li',
    email: 'amy.li@example.com',
    mobile: '4155550001',
    expected: 'lixx0001'
  },
  {
    firstName: 'Patrick',
    lastName: "O'Brien",
    email: 'patrick.obrien@example.com',
    mobile: '4155554321',
    expected: 'obri4321'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    mobile: '2125559876',
    expected: 'smit9876'
  }
];

function createClient(clientData) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      mobile: clientData.mobile
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/clients',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(`HTTP ${res.statusCode}: ${responseData}`);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Testing subdomain generation patterns...\n');

  for (const client of testClients) {
    try {
      console.log(`Testing: ${client.firstName} ${client.lastName}`);
      console.log(`Expected subdomain: ${client.expected}`);
      
      const result = await createClient(client);
      
      console.log(`✅ Created successfully!`);
      console.log(`   Actual subdomain: ${result.subdomain}`);
      console.log(`   Match: ${result.subdomain === client.expected ? '✓' : '✗'}`);
      console.log(`   Portal URL: ${result.portalUrl}\n`);
      
    } catch (error) {
      console.log(`❌ Error: ${error}\n`);
    }
  }
}

runTests();