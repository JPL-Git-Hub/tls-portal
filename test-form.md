# Test Instructions for React Form

## Step 1: Emulators are Running

Firebase emulators are now running:
- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Storage: http://localhost:9199
- UI: http://localhost:4000

## Step 2: Start Development Servers

In a new terminal, run:

```bash
cd /Users/josephleon/repos/tls-portal
yarn dev
```

This will start:
- Backend API on http://localhost:3001
- React frontend on http://localhost:3000

## Step 3: Test the Form

1. Open http://localhost:3000 in your browser
2. You should see the client intake form
3. Fill out the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: (555) 123-4567

4. Submit the form
5. Check the emulator UI at http://localhost:4000/firestore to see the created document

## Expected Result

- A new client document should be created in Firestore
- The subdomain should be: `doex4567`
- The backend should return a success response

## Troubleshooting

If the form doesn't submit:
1. Check browser console for errors
2. Check backend logs in the terminal running `yarn dev`
3. Verify emulators are still running at http://localhost:4000