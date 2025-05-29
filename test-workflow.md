# Client Portal Creation Workflow Test

## Services Running
- ✅ Backend API: http://localhost:3001
- ✅ Frontend: http://localhost:3000
- ✅ Firebase Emulator UI: http://localhost:4000

## Test Steps

### 1. Fill Out Client Intake Form
Open http://localhost:3000 and enter:
- **First Name**: Jane
- **Last Name**: Johnson
- **Email**: jane.johnson@example.com
- **Phone**: (555) 987-6543

Expected subdomain: `john6543`

### 2. Submit Form
- Click "Submit Client Information"
- Watch for success/error messages

### 3. Verify in Firebase Emulator
Open http://localhost:4000/firestore and check:
- Collection: `clients`
- Document should contain:
  ```json
  {
    "firstName": "Jane",
    "lastName": "Johnson", 
    "email": "jane.johnson@example.com",
    "phone": "(555) 987-6543",
    "subdomain": "john6543",
    "firmId": "default-firm",
    "createdAt": [timestamp]
  }
  ```

### 4. Check Backend Logs
In the terminal running dev servers, look for:
- POST request to `/api/clients`
- Success message with generated subdomain

## Expected Results
- ✅ Form validates phone number format
- ✅ Subdomain generated as: first 4 of last name + last 4 of phone
- ✅ Client document created in Firestore
- ✅ Success message displayed to user

## Troubleshooting
If form doesn't submit:
1. Check browser console (F12) for errors
2. Check backend terminal for error logs
3. Verify emulators are running at http://localhost:4000
4. Ensure no CORS errors in network tab