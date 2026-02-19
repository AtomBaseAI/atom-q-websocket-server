# Quiz Server - Real-time WebSocket Quiz Application

A real-time quiz server built with PartyKit and WebSocket, supporting multiple participants with live scoring and leaderboards.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

---

## Features

### 🎮 Quiz Flow
- **5 seconds** - "Get Ready!" countdown
- **5 seconds** - Question loading screen
- **15 seconds** - Active question with live stats
- **3 seconds** - Answer reveal
- **Manual Leaderboard** - Admin controls when to show
- **Manual Next Question** - Admin controls progression

### 👥 User Management
- Real-time user join/leave notifications
- User avatars and nicknames
- Live connection status

### 📊 Real-time Statistics
- Live option selection counts
- Response rate tracking
- Per-question statistics

### 🏆 Scoring System
- **Correct answers**: 100 + ((10 - timeSpent) × 10) points
  - 3 sec → 170 pts
  - 5 sec → 150 pts
  - 8 sec → 120 pts
- **Wrong answers**: 0 points (regardless of time)
- Cumulative scoring across all questions

### 🎛️ Admin Controls
- Create quiz rooms
- View connected users
- Start quiz
- Show leaderboard (manual)
- Move to next question (manual)
- View questions list

### 👤 User Interface
- Join lobby with activity key
- View questions and select options
- See score confirmation
- View personal score on leaderboard
- Wait for admin's next question

---

## Quick Start

### Windows Users 🪟

**Install:**
```cmd
npm install
# or faster with bun
bun install
```

**Run:**
```cmd
# Terminal 1 - Server
bun run dev

# Terminal 2 - Admin (double-click simulate\admin.bat or run:)
cd simulate
admin.bat

# Terminal 3 - User (double-click simulate\user.bat or run:)
cd simulate
user.bat <activity-key> <nickname>
```

**Example:**
```cmd
user.bat quiz-a1b2c3d4 Alice
```

📖 **Full Windows Guide:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

---

### Linux/Mac Users 🐧🍎

**Install:**
```bash
bun install
# or
npm install
```

**Run:**
```bash
# Terminal 1 - Server
bun run dev

# Terminal 2 - Admin
cd simulate
bun run admin

# Terminal 3 - User
cd simulate
bun run user <activity-key> <nickname>
```

**Example:**
```bash
bun run user quiz-a1b2c3d4 Alice
```

---

## Installation

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **bun** package manager

### Steps

1. **Clone or download the project**

2. **Install dependencies:**
   ```bash
   npm install
   # or faster:
   bun install
   ```

3. **Start the dev server:**
   ```bash
   bun run dev
   ```

4. **Start the admin:**
   ```bash
   cd simulate
   bun run admin
   ```

5. **Share the activity key** with participants

6. **Start users:**
   ```bash
   cd simulate
   bun run user <activity-key> <nickname>
   ```

---

## Usage

### Starting the Server

```bash
bun run dev
```

Server will start on `http://127.0.0.1:1999`

### Starting the Admin

**Option 1: Using npm/bun script**
```bash
bun run admin
```

**Option 2: Windows Batch File**
```cmd
cd simulate
admin.bat
```

**Option 3: Windows PowerShell**
```powershell
cd simulate
.\admin.ps1
```

The admin will:
1. Connect to the server
2. Generate an activity key (e.g., `quiz-a1b2c3d4`)
3. Show connected users in real-time
4. Display menu options

### Starting a User

**Option 1: Using npm/bun script**
```bash
bun run user <activity-key> <nickname>
```

**Option 2: Windows Batch File**
```cmd
cd simulate
user.bat <activity-key> <nickname>
```

**Option 3: Windows PowerShell**
```powershell
cd simulate
.\user.ps1 <activity-key> <nickname>
```

**Examples:**
```bash
bun run user quiz-a1b2c3d4 Alice
bun run user quiz-a1b2c3d4 Bob
bun run user quiz-a1b2c3d4 Charlie user-custom-id
```

---

## Quiz Flow

### 1. Lobby Phase
- Admin creates room
- Users join with activity key
- Admin sees users joining in real-time
- Admin menu shows "Show Questions" and "Start Quiz"

### 2. Quiz Start
- Admin clicks "Start Quiz"
- 5 sec "Get Ready!" message
- 5 sec "Loading question"
- Question appears with options

### 3. Question Phase (15 seconds)
- Question displayed with options
- Users select answers
- Real-time stats update (responses/total, option counts)
- Time countdown

### 4. Answer Reveal (3 seconds)
- Correct answer shown
- Statistics displayed
- User scores updated

### 5. Leaderboard Phase (Manual)
- Admin clicks "Show Leaderboard"
- Leaderboard displayed with cumulative scores
- **Users see ONLY their own score**
- Waits for admin's next action

### 6. Next Question (Manual)
- Admin clicks "Next Question"
- Flow repeats for all questions

### 7. Quiz Completion
- Final leaderboard shown
- All users disconnected
- Quiz ends

---

## Scoring System

### Formula
```
Correct Answer:
Score = 100 + ((10 - timeSpent) × 10)

Wrong Answer:
Score = 0
```

### Examples

| Time Spent | Time Bonus | Total Score |
|------------|------------|-------------|
| 3 seconds  | 70 pts     | **170 pts** |
| 5 seconds  | 50 pts     | **150 pts** |
| 8 seconds  | 20 pts     | **120 pts** |
| 10 seconds | 0 pts      | **100 pts** |
| Wrong      | N/A        | **0 pts** |

### Notes
- Faster answers = more points
- Wrong answers always get 0 points
- Maximum time bonus is at 10 seconds
- Scores accumulate across all questions

---

## Project Structure

```
quiz-party-server/
├── simulate/              # Interactive CLI clients
│   ├── server-admin.ts   # Admin terminal interface
│   ├── server-user.ts    # User terminal interface
│   ├── admin.bat         # Windows batch launcher
│   ├── user.bat          # Windows batch launcher
│   ├── admin.ps1         # Windows PowerShell launcher
│   └── user.ps1          # Windows PowerShell launcher
│
├── test/                  # Automated tests
│   ├── test-admin.ts     # Admin test script
│   ├── test-user.ts      # User test script
│   ├── auto-admin-test.ts    # Automated admin test
│   └── auto-user-test.ts     # Automated user test
│
├── party/                 # PartyKit handlers
│   └── quiz.ts            # Quiz room handler
│
├── store/                 # Data management
│   └── quizStore.ts      # Quiz state management
│
├── types/                 # TypeScript types
│   └── index.ts          # Shared type definitions
│
├── utils/                 # Utility functions
│   ├── scoring.ts        # Score calculation
│   └── timer.ts          # Timer utilities
│
├── server.ts              # Main server entry point
├── partykit.json          # PartyKit configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
├── WINDOWS_SETUP.md       # Windows setup guide
├── QUICK_START.md         # Quick reference guide
├── TEST_RESULTS.md        # Test results and verification
└── README.md              # This file
```

---

## Available Scripts

### Development
```bash
bun run dev           # Start dev server on port 1999
bun run build         # Compile TypeScript
bun run deploy        # Deploy to PartyKit
```

### Quiz Clients
```bash
bun run admin         # Start admin terminal
bun run user <key> <name>  # Start user terminal
```

### Testing
```bash
bun run test:admin    # Run automated admin test
bun run test:user <key> <name>  # Run automated user test
```

---

## Testing

### Automated Tests

**Test Admin:**
```bash
cd test
bun run test:admin
```

**Test User:**
```bash
cd test
bun run test:user <activity-key> <nickname>
```

**Example:**
```bash
cd test
bun run test:user quiz-a1b2c3d4 TestUser
```

### Manual Testing

1. Start dev server in one terminal
2. Start admin in another terminal
3. Note the activity key
4. Start 1 or more users in additional terminals
5. Admin starts quiz
6. Test all features:
   - User joining
   - Question display
   - Answer submission
   - Real-time stats
   - Leaderboard display
   - Next question
   - Quiz completion

See [TEST_RESULTS.md](TEST_RESULTS.md) for detailed test results.

---

## Configuration

### PartyKit Config (`partykit.json`)
```json
{
  "name": "quiz-server",
  "main": "server.ts",
  "port": 1999
}
```

### Questions

Questions are defined in `simulate/server-admin.ts`. To add or modify questions:

```typescript
const QUESTIONS = [
  {
    id: 'q1',
    text: 'Your question here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0, // Index of correct option (0-based)
  },
  // Add more questions...
];
```

### Scoring

Scoring logic is in `utils/scoring.ts`:

```typescript
// Base points for correct answer
private static readonly BASE_POINTS = 100;

// Points per second (10 points per second)
private static readonly POINTS_PER_SECOND = 10;

// Maximum time considered for scoring (10 seconds)
private static readonly MAX_SCORING_TIME = 10;
```

---

## Platform Support

### ✅ Windows
- Batch files (.bat) for easy double-click execution
- PowerShell scripts (.ps1) for advanced users
- Full npm and bun support

### ✅ Linux
- Shell scripts support
- npm and bun support

### ✅ macOS
- Terminal support
- npm and bun support

**Windows users:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows setup instructions.

---

## Troubleshooting

### Port Already in Use
**Error:** `Port 1999 is already in use`

**Solution:**
```bash
# Linux/Mac
lsof -ti:1999 | xargs kill -9

# Windows
netstat -ano | findstr :1999
# Note the PID (last number)
taskkill /PID <PID> /F
```

### Module Not Found
**Error:** `Cannot find module 'ws'`

**Solution:**
```bash
npm install
# or
bun install
```

### Connection Refused
**Error:** `ECONNREFUSED`

**Solutions:**
1. Ensure dev server is running (`bun run dev`)
2. Check server is on port 1999
3. Verify activity key is correct
4. Check firewall settings

### Users Not Connecting
**Solutions:**
1. Ensure admin is running
2. Verify activity key is correct
3. Check dev server logs
4. Ensure all users use same activity key

---

## Advanced Usage

### Running Multiple Tests

```bash
# Terminal 1 - Admin
cd test
bun run test:admin

# Terminal 2 - User 1
cd test
bun run test:user quiz-a1b2c3d4 Alice

# Terminal 3 - User 2
cd test
bun run test:user quiz-a1b2c3d4 Bob

# Terminal 4 - User 3
cd test
bun run test:user quiz-a1b2c3d4 Charlie
```

### Custom Question Duration

Edit questions in `simulate/server-admin.ts`:
```typescript
const questionsWithDuration = QUESTIONS.map(q => ({
  ...q,
  duration: 20, // Change from 15 to 20 seconds
}));
```

### Deploying to Production

```bash
bun run deploy
```

This will deploy the quiz server to PartyKit Cloud.

---

## Documentation

- [QUICK_START.md](QUICK_START.md) - Quick reference guide
- [WINDOWS_SETUP.md](WINDOWS_SETUP.md) - Windows setup and troubleshooting
- [TEST_RESULTS.md](TEST_RESULTS.md) - Test results and verification

---

## Technology Stack

- **Framework:** PartyKit (WebSocket server)
- **Language:** TypeScript 5
- **Package Manager:** bun (npm compatible)
- **Runtime:** Node.js 18+

---

## License

MIT

---

## Support

For issues or questions:
1. Check [TROUBLESHOOTING](#troubleshooting) section
2. Review [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for Windows-specific issues
3. Check [TEST_RESULTS.md](TEST_RESULTS.md) for feature verification

---

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All tests pass
- Documentation is updated
- Windows compatibility is maintained

---

## Acknowledgments

- Built with [PartyKit](https://partykit.io/)
- Real-time communication via [WebSocket](https://github.com/websockets/ws)
- Scoring system based on time-based algorithms

---

**Enjoy the quiz! 🎉**
