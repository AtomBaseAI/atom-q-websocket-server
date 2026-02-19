# Windows Setup Guide

## Prerequisites

Before running the quiz application on Windows, ensure you have the following installed:

### Required
- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **Git** (optional, for cloning the repo) - [Download from git-scm.com](https://git-scm.com/)

### Optional (Recommended)
- **Bun** - Fast JavaScript package manager (faster than npm)
  - Download from [bun.sh](https://bun.sh/)
  - Or install via PowerShell: `irm bun.sh/install.ps1 | iex`

---

## Installation

### 1. Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install Dependencies
Open PowerShell or Command Prompt in the project directory and run:

**Using npm (default):**
```cmd
npm install
```

**Using bun (faster, recommended):**
```cmd
bun install
```

---

## Running the Quiz Application

### Option 1: Using Batch Files (.bat) - Simple & Easy

#### Start the Dev Server
```cmd
bun run dev
```
or
```cmd
npm run dev
```

#### Start the Admin
Double-click `simulate\admin.bat` or run:
```cmd
cd simulate
admin.bat
```

The admin will:
1. Connect to the server
2. Generate an activity key (e.g., `quiz-a1b2c3d4`)
3. Show connected users
4. Allow you to start the quiz

#### Start a User
Double-click `simulate\user.bat` or run:
```cmd
cd simulate
user.bat <activity-key> <nickname>
```

**Examples:**
```cmd
user.bat quiz-a1b2c3d4 Alice
user.bat quiz-a1b2c3d4 Bob
user.bat quiz-a1b2c3d4 Charlie
```

---

### Option 2: Using PowerShell Scripts (.ps1)

#### Enable PowerShell Scripts (One-time setup)

If you haven't run PowerShell scripts before, you may need to enable them:

1. Open PowerShell as Administrator
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

#### Start the Admin
```powershell
cd simulate
.\admin.ps1
```

#### Start a User
```powershell
cd simulate
.\user.ps1 <activity-key> <nickname>
```

**Examples:**
```powershell
.\user.ps1 quiz-a1b2c3d4 Alice
.\user.ps1 quiz-a1b2c3d4 Bob user-custom-id
```

---

### Option 3: Using npm/bun Scripts

#### Start the Admin
```cmd
bun run admin
```
or
```cmd
npm run admin
```

#### Start a User
```cmd
bun run user <activity-key> <nickname>
```
or
```cmd
npm run user <activity-key> <nickname>
```

**Examples:**
```cmd
bun run user quiz-a1b2c3d4 Alice
bun run user quiz-a1b2c3d4 Bob
```

---

## How to Run a Quiz

### Step 1: Start the Dev Server
Open a terminal and run:
```cmd
bun run dev
```

Keep this terminal open. The server should show:
```
Ready on http://0.0.0.0:1999
```

### Step 2: Start the Admin
Open a new terminal and run:
```cmd
cd simulate
admin.bat
```

The admin will display:
```
🎮 QUIZ ADMIN TERMINAL
======================================================================
Activity Key: quiz-a1b2c3d4
Total Questions: 10

👥 Connected Users: 0

----------------------------------------------------------------------
1. Show Questions
2. Start Quiz
0. Exit
----------------------------------------------------------------------
```

### Step 3: Share the Activity Key
Copy the activity key (e.g., `quiz-a1b2c3d4`) and share it with participants.

### Step 4: Users Join
Each participant opens a terminal and runs:
```cmd
cd simulate
user.bat quiz-a1b2c3d4 Alice
```

Replace `Alice` with your nickname.

### Step 5: Admin Starts the Quiz
In the admin terminal, select option `2` to start the quiz.

### Step 6: Quiz Flow
The quiz will follow this flow for each question:

1. **5 seconds** - "Get Ready!" message
2. **5 seconds** - Loading question
3. **15 seconds** - Question with options (live stats updating)
4. **3 seconds** - Answer revealed
5. **Wait** - Admin clicks "Show Leaderboard"
6. **Leaderboard** - Shows scores
7. **Wait** - Admin clicks "Next Question"

### Step 7: Quiz Completion
After all questions, the final leaderboard is displayed.

---

## Testing the Quiz

### Run Automated Tests

#### Automated Admin Test
```cmd
cd test
bun run test:admin
```
or
```cmd
cd test
npm run test:admin
```

#### Automated User Test
```cmd
cd test
bun run test:user <activity-key> <nickname>
```
or
```cmd
cd test
npm run test:user <activity-key> <nickname>
```

**Example:**
```cmd
cd test
bun run test:user quiz-a1b2c3d4 TestUser
```

---

## Troubleshooting

### Issue: "node is not recognized"
**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: "bun is not recognized"
**Solution:** 
- Either use `npm` instead of `bun`
- Or install Bun from [bun.sh](https://bun.sh/)

### Issue: "Cannot find module 'ws'"
**Solution:** Run `npm install` or `bun install` in the project directory

### Issue: "Port 1999 is already in use"
**Solution:**
1. Find and stop the process using port 1999:
   ```cmd
   netstat -ano | findstr :1999
   ```
2. Note the PID (last number)
3. Kill the process:
   ```cmd
   taskkill /PID <PID> /F
   ```
4. Restart the dev server

### Issue: PowerShell script won't run
**Solution:**
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Try running the script again

### Issue: User can't connect
**Solutions:**
1. Ensure dev server is running (`bun run dev`)
2. Check the activity key is correct
3. Ensure admin is running
4. Check firewall settings

---

## Keyboard Shortcuts in Quiz

### Admin Terminal
- Type `1` - Show Questions
- Type `2` - Start Quiz / Show Leaderboard / Next Question
- Type `0` - Exit

### User Terminal
- Type `1`, `2`, `3`, `4` - Select answer option
- Press Enter - Submit answer

---

## Scoring System

### Correct Answer Formula
```
Score = 100 + ((10 - timeSpent) × 10)
```

### Examples
- Correct + 3 sec = 100 + 70 = **170 points**
- Correct + 5 sec = 100 + 50 = **150 points**
- Correct + 8 sec = 100 + 20 = **120 points**
- Wrong + any time = **0 points**

### Notes
- Faster answers get more points
- Wrong answers always get 0 points
- Scores accumulate across all questions

---

## File Structure

```
/home/z/my-project/
├── simulate/              # Quiz clients
│   ├── server-admin.ts   # Admin TypeScript source
│   ├── server-user.ts    # User TypeScript source
│   ├── admin.bat         # Windows admin launcher
│   ├── user.bat          # Windows user launcher
│   ├── admin.ps1         # PowerShell admin launcher
│   └── user.ps1          # PowerShell user launcher
│
├── test/                  # Automated tests
│   ├── auto-admin-test.ts
│   └── auto-user-test.ts
│
├── party/                 # PartyKit server
│   └── quiz.ts
│
├── store/                 # Data management
├── types/                 # Type definitions
├── utils/                 # Utilities
├── server.ts              # Main server entry
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

---

## Building from Source

If you want to compile the TypeScript files:

```cmd
bun run build
```
or
```cmd
npm run build
```

Compiled files will be in the `dist/` directory.

---

## Tips for Windows Users

### 1. Use PowerShell or Windows Terminal
PowerShell and Windows Terminal provide better command-line experience than Command Prompt.

### 2. Enable Long Paths in Windows
If you have issues with long file paths:
1. Open Registry Editor as Administrator
2. Navigate to: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`
3. Set `LongPathsEnabled` to `1`

### 3. Use Bun for Faster Operations
Bun is much faster than npm for installing dependencies and running scripts.

### 4. Keep Multiple Terminals Open
You'll need at least 3 terminals:
- Terminal 1: Dev server
- Terminal 2: Admin
- Terminal 3+: Users

### 5. Use Activity Key Copies
Copy the activity key directly from the admin terminal to avoid typos.

---

## Advanced Usage

### Run Multiple Users at Once
Open multiple terminal windows and run:
```cmd
cd simulate
user.bat quiz-a1b2c3d4 Alice

cd simulate
user.bat quiz-a1b2c3d4 Bob

cd simulate
user.bat quiz-a1b2c3d4 Charlie

cd simulate
user.bat quiz-a1b2c3d4 Diana
```

### Create Desktop Shortcuts
1. Right-click on `simulate\admin.bat`
2. Select "Create shortcut"
3. Move shortcut to desktop
4. Double-click to start admin anytime

### Run on Different Ports
If you need to run on a different port, edit `partykit.json`:
```json
{
  "name": "quiz-server",
  "main": "server.ts",
  "port": 3000
}
```

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the main README.md
3. Check the test results in `TEST_RESULTS.md`

---

## Summary

✅ **Windows Support:** Full support with both .bat and .ps1 scripts
✅ **Package Manager:** Supports both npm and bun
✅ **Installation:** Simple npm/bun install
✅ **Usage:** Easy batch file execution or npm scripts
✅ **Testing:** Automated tests included

Enjoy the quiz on Windows! 🎉
