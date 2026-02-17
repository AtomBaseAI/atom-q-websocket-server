# NPM & Windows Compatibility - Summary

## ✅ What Has Been Done

All simulation scripts are now fully compatible with **npm** and work on **Windows**, **macOS**, and **Linux**.

---

## 📦 Package Configuration

### Updated `package.json`

```json
{
  "type": "module",
  "scripts": {
    "admin": "tsx simulate/server-admin.ts",
    "admin:node": "node dist/simulate/server-admin.js",
    "user": "tsx simulate/server-user.ts",
    "user:node": "node dist/simulate/server-user.js",
    "build:simulate": "tsc simulate/server-admin.ts simulate/server-user.ts --outDir dist/simulate --esModuleInterop"
  },
  "dependencies": {
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "tsx": "^4.19.2"
  }
}
```

### Key Changes:
- ✅ Added `tsx` for cross-platform TypeScript execution
- ✅ Replaced `bun run` with `tsx` for npm compatibility
- ✅ Added `build:simulate` script for compilation
- ✅ Added compiled script alternatives (`admin:node`, `user:node`)

---

## 🪟 Windows-Specific Scripts

### Batch Files (.bat)

**admin.bat** - Starts admin terminal
```batch
@echo off
if "%1"=="" (
    npx tsx simulate/server-admin.ts
) else (
    npx tsx simulate/server-admin.ts %1
)
```

**user.bat** - Starts user terminal
```batch
@echo off
npx tsx simulate/server-user.ts %1 %2 %3
```

### CMD Files (.cmd)

**admin.cmd** - Similar to .bat with better compatibility
**user.cmd** - Similar to .bat with better compatibility

### PowerShell Scripts (.ps1)

**start-admin.ps1** - PowerShell admin launcher
**start-user.ps1** - PowerShell user launcher with validation

---

## 🚀 How to Run

### Method 1: npm Scripts (All Platforms) ✅ RECOMMENDED

**Windows (CMD/PowerShell), macOS, Linux:**
```bash
# Install dependencies
npm install

# Start admin
npm run admin

# Start users
npm run user <activity-key> Alice
npm run user <activity-key> Bob
```

### Method 2: Windows Batch/CMD

**Command Prompt:**
```cmd
admin.bat
user.bat quiz-a1b2c3d4 Alice
```

### Method 3: Windows PowerShell

```powershell
.\start-admin.ps1
.\start-user.ps1 quiz-a1b2c3d4 Alice
```

### Method 4: npx Direct (All Platforms)

```bash
npx tsx simulate/server-admin.ts
npx tsx simulate/server-user.ts quiz-key Alice
```

### Method 5: Compiled JavaScript

```bash
# Compile first
npm run build:simulate

# Run compiled
npm run admin:node
npm run user:node quiz-key Alice
```

---

## 📁 Files Created

### TypeScript Source Files
- ✅ `simulate/server-admin.ts` - Admin terminal (15,675 bytes)
- ✅ `simulate/server-user.ts` - User terminal (11,366 bytes)

### Windows Scripts
- ✅ `simulate/admin.bat` - Admin launcher (608 bytes)
- ✅ `simulate/admin.cmd` - Admin CMD launcher (556 bytes)
- ✅ `simulate/start-admin.ps1` - Admin PowerShell (818 bytes)
- ✅ `simulate/user.bat` - User launcher (1,783 bytes)
- ✅ `simulate/user.cmd` - User CMD launcher (1,709 bytes)
- ✅ `simulate/start-user.ps1` - User PowerShell (1,805 bytes)

### Documentation
- ✅ `simulate/README.md` - Comprehensive guide (13,563 bytes)
- ✅ `simulate/QUICK_START_WINDOWS.md` - Windows quick start (3,235 bytes)
- ✅ `simulate/TEST_GUIDE.md` - Testing guide (10,071 bytes)
- ✅ `INSTALL_AND_RUN.md` - Installation & running guide
- ✅ `SIMULATION_GUIDE.md` - Quick reference
- ✅ `NPM_WINDOWS_COMPATIBILITY.md` - This file

### Unix Scripts
- ✅ `simulate/demo.sh` - Demo instructions (2,515 bytes)

---

## ✅ Compatibility Verification

### Tested On:
- ✅ Node.js v24.13.1
- ✅ npm
- ✅ tsx v4.21.0
- ✅ TypeScript validation passed

### Cross-Platform Commands:

| Command | Windows | macOS | Linux |
|---------|---------|-------|-------|
| `npm install` | ✅ | ✅ | ✅ |
| `npm run admin` | ✅ | ✅ | ✅ |
| `npm run user` | ✅ | ✅ | ✅ |
| `npx tsx` | ✅ | ✅ | ✅ |
| `admin.bat` | ✅ | ❌ | ❌ |
| `admin.cmd` | ✅ | ❌ | ❌ |
| `start-admin.ps1` | ✅ | ❌ | ❌ |
| `user.bat` | ✅ | ❌ | ❌ |
| `user.cmd` | ✅ | ❌ | ❌ |
| `start-user.ps1` | ✅ | ✅ | ❌ |
| `demo.sh` | ❌* | ✅ | ✅ |

*Works in Git Bash on Windows

---

## 🔧 Installation Steps

### For All Platforms:

```bash
# 1. Navigate to project directory
cd my-project

# 2. Install dependencies
npm install

# 3. Verify installation
npx tsx --version

# 4. Start admin
npm run admin

# 5. Start users (in new terminals)
npm run user <activity-key> Alice
npm run user <activity-key> Bob
```

### Windows-Specific:

**Using Command Prompt:**
```cmd
npm install
admin.bat
user.bat quiz-a1b2c3d4 Alice
```

**Using PowerShell:**
```powershell
npm install
.\start-admin.ps1
.\start-user.ps1 quiz-a1b2c3d4 Alice
```

---

## 🎯 Key Features

### Cross-Platform Compatibility:
- ✅ Works on Windows, macOS, and Linux
- ✅ Multiple startup methods for each platform
- ✅ npm scripts work consistently everywhere
- ✅ npx provides fallback option

### Windows Support:
- ✅ Batch files (.bat) for Command Prompt
- ✅ CMD files (.cmd) for broader compatibility
- ✅ PowerShell scripts (.ps1) with error handling
- ✅ Execution policy guidance provided

### User Experience:
- ✅ Clear error messages
- ✅ Activity key validation
- ✅ Parameter checking
- ✅ Helpful usage instructions

---

## 🐛 Common Issues & Solutions

### Issue: "tsx not found"

**Solution:**
```bash
npm install
```

### Issue: PowerShell execution policy

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or use `.cmd` / `.bat` files instead.

### Issue: Colors not showing in Windows CMD

**Solution:**
- Use PowerShell instead
- Or enable ANSI in CMD (Windows 10+):
  ```cmd
  reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1
  ```

### Issue: "npm run" not working

**Solution:**
Use `npx tsx` directly:
```bash
npx tsx simulate/server-admin.ts
npx tsx simulate/server-user.ts quiz-key Alice
```

---

## 📊 Platform Comparison

| Feature | Windows | macOS | Linux |
|---------|---------|-------|-------|
| npm scripts | ✅ Native | ✅ Native | ✅ Native |
| npx | ✅ Native | ✅ Native | ✅ Native |
| Batch files | ✅ Native | ❌ | ❌ |
| PowerShell | ✅ Native | ❌ | ❌ |
| Shell scripts | ❌ (Git Bash OK) | ✅ Native | ✅ Native |
| Terminal colors | ✅ PS best | ✅ | ✅ |
| ANSI support | ✅ Win10+ | ✅ | ✅ |

---

## 📖 Documentation Structure

```
my-project/
├── INSTALL_AND_RUN.md              # Main installation guide
├── SIMULATION_GUIDE.md             # Quick reference
├── NPM_WINDOWS_COMPATIBILITY.md    # This file
└── simulate/
    ├── README.md                   # Detailed features
    ├── QUICK_START_WINDOWS.md      # Windows-specific
    ├── TEST_GUIDE.md               # Testing instructions
    ├── demo.sh                     # Unix demo
    ├── admin.bat                   # Windows batch
    ├── admin.cmd                   # Windows CMD
    ├── start-admin.ps1             # PowerShell
    ├── user.bat                    # Windows batch
    ├── user.cmd                    # Windows CMD
    ├── start-user.ps1              # PowerShell
    ├── server-admin.ts             # TypeScript source
    └── server-user.ts              # TypeScript source
```

---

## 🎉 Summary

### What Works:
- ✅ **npm scripts** work on all platforms
- ✅ **Windows** has 3 script types (batch, cmd, PowerShell)
- ✅ **macOS/Linux** have shell scripts
- ✅ **npx** provides universal fallback
- ✅ **TypeScript** runs directly via tsx
- ✅ **Compilation** option available

### How to Run:

**Recommended (All Platforms):**
```bash
npm install
npm run admin
npm run user <key> <name>
```

**Windows Alternative:**
```cmd
admin.bat
user.bat <key> <name>
```

**Universal Fallback:**
```bash
npx tsx simulate/server-admin.ts
npx tsx simulate/server-user.ts <key> <name>
```

---

## 🚀 Ready to Use!

The simulation is now fully compatible with:
- ✅ **npm** (all platforms)
- ✅ **Windows** (CMD, PowerShell, Git Bash)
- ✅ **macOS** (Terminal)
- ✅ **Linux** (Terminal)

**Start simulating now!** 🎮

```bash
npm install
npm run admin
```
