#!/usr/bin/env node

// Test script to create a client via the API
const http = require('http');

const testClientCreation = () => {
  console.log('Testing client creation...');
  
  const data = JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567'
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
          console.log('✅ Client created successfully:', result);
        } catch (e) {
          console.log('✅ Client created successfully:', responseData);
        }
      } else {
        console.error(`❌ Error: HTTP ${res.statusCode}`);
        console.error('Response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error creating client:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running on http://localhost:3001');
    console.log('2. Firebase emulators are running');
  });

  req.write(data);
  req.end();
};

testClientCreation();