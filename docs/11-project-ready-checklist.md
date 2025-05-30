# Ready Checklist

## Before First Run

- [ ] Node.js 18+ installed
- [ ] Yarn installed (`npm install -g yarn`)
- [ ] Run `./scripts/init-all.sh`
- [ ] `.env` file exists (created by init script)

## Start Development

```bash
./scripts/start-dev.sh
```

Opens:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Firebase UI: http://localhost:4000

## Test It Works

1. Go to http://localhost:3000
2. Fill out the client form
3. Submit
4. Check Firebase UI for the data

## Common Issues

**Port already in use**: Run `./scripts/stop-dev.sh` first

**Firebase emulator errors**: Make sure Java 11+ is installed

**Can't find module**: Run `yarn install` in project root