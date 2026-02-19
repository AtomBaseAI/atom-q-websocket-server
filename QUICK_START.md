# Quick Start Guide

## Windows Users

### Prerequisites
- Node.js v18+ (install from [nodejs.org](https://nodejs.org/))
- Git (optional)

### Install
```cmd
npm install
# or faster with bun
bun install
```

### Run Dev Server
```cmd
bun run dev
```

### Start Admin
**Method 1: Double-click** `simulate\admin.bat`

**Method 2: Command line**
```cmd
cd simulate
admin.bat
```

**Method 3: PowerShell**
```powershell
cd simulate
.\admin.ps1
```

### Start User
**Method 1: Double-click** `simulate\user.bat` (then enter activity key and nickname)

**Method 2: Command line**
```cmd
cd simulate
user.bat <activity-key> <nickname>
```

**Example:**
```cmd
user.bat quiz-a1b2c3d4 Alice
```

**Method 3: PowerShell**
```powershell
cd simulate
.\user.ps1 quiz-a1b2c3d4 Alice
```

---

## Linux/Mac Users

### Install
```bash
bun install
# or
npm install
```

### Run Dev Server
```bash
bun run dev
```

### Start Admin
```bash
cd simulate
bun run admin
# or
npm run admin
```

### Start User
```bash
cd simulate
bun run user <activity-key> <nickname>
# Example:
bun run user quiz-a1b2c3d4 Alice
```

---

## Quick Quiz Flow

1. **Terminal 1**: Run `bun run dev` (starts server)
2. **Terminal 2**: Run admin, note the activity key
3. **Terminal 3+**: Run users with the activity key
4. **Admin**: Select "Start Quiz" (option 2)
5. **Users**: Answer questions when prompted
6. **Admin**: Click "Show Leaderboard" after each question
7. **Admin**: Click "Next Question" to proceed
8. Repeat until all questions done

---

## Scripts Reference

### Package.json Scripts
```bash
bun run dev           # Start dev server
bun run build         # Compile TypeScript
bun run admin         # Start admin terminal
bun run user <key> <name>  # Start user terminal
bun run test:admin    # Run automated admin test
bun run test:user <key> <name>  # Run automated user test
bun run deploy        # Deploy to PartyKit
```

### Windows Scripts
- `simulate/admin.bat` - Admin launcher (double-click)
- `simulate/user.bat` - User launcher (needs args)
- `simulate/admin.ps1` - Admin PowerShell
- `simulate/user.ps1` - User PowerShell

---

## Need More Help?

- **Windows**: See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- **Test Results**: See [TEST_RESULTS.md](TEST_RESULTS.md)
- **Full Documentation**: See [README.md](README.md)

---

## Common Commands

### Windows Command Prompt
```cmd
npm install           # Install dependencies
npm run dev           # Start server
cd simulate
admin.bat            # Start admin
user.bat quiz-key Alice  # Start user
```

### Windows PowerShell
```powershell
npm install           # Install dependencies
npm run dev           # Start server
cd simulate
.\admin.ps1          # Start admin
.\user.ps1 quiz-key Alice  # Start user
```

### Linux/Mac Terminal
```bash
npm install           # Install dependencies
npm run dev           # Start server
cd simulate
npm run admin         # Start admin
npm run user quiz-key Alice  # Start user
```

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "node not recognized" | Install Node.js from nodejs.org |
| "bun not recognized" | Use npm instead, or install bun |
| Port 1999 in use | Kill process: `taskkill /F /PID <pid>` (Windows) or `kill -9 <pid>` (Linux/Mac) |
| Can't connect | Check server is running, check activity key |
| User can't answer | Make sure quiz is in question phase |

---

## Scoring

**Correct Answer:**
```
Score = 100 + ((10 - timeSpent) × 10)

Examples:
- 3 sec → 170 pts
- 5 sec → 150 pts
- 8 sec → 120 pts
```

**Wrong Answer:**
```
Score = 0 pts (regardless of time)
```
