# Quiz Flow Implementation - Complete Changes

## Overview
Implemented the complete manual quiz flow as specified with new scoring logic, admin controls, and user interface updates.

---

## Scoring Logic ✅

### Formula
```
Correct Answer:
- Base Score: 100 points
- Time Bonus: (10 - timeSpent) × 10 points
- Total = 100 + ((10 - timeSpent) × 10)

Wrong Answer:
- Total = 0 points (regardless of time)
```

### Examples
- Correct + 3 sec → 100 + 70 = **170 points** ✅
- Correct + 5 sec → 100 + 50 = **150 points** ✅
- Correct + 8 sec → 100 + 20 = **120 points** ✅
- Wrong + any time → **0 points** ✅

### Implementation
- Already implemented in `utils/scoring.ts`
- No changes needed - logic matches requirements exactly

---

## Server Changes (party/quiz.ts)

### New Message Types Added
1. **SHOW_LEADERBOARD** - Admin requests to show leaderboard after question
2. **NEXT_QUESTION** - Admin requests to move to next question

### New Quiz States Added
- `QUESTION_COMPLETE` - Question ended, waiting for admin action
- `WAITING_LEADERBOARD` - Waiting for admin to click "Show Leaderboard"

### Flow Changes

#### Before (Automatic):
```
Start Quiz → Q1 (5+5+15) → Show Answer → Leaderboard (5s) → Q2 → ... → End
```

#### After (Manual):
```
Start Quiz → Q1 (5+5+15) → Show Answer → Wait for Admin
              ↓
         Admin clicks "Show Leaderboard"
              ↓
         Leaderboard (indefinite)
              ↓
         Admin clicks "Next Question"
              ↓
         Q2 → ... → End
```

### Key Methods Added/Modified
- `startQuestion()` - Starts a specific question by index
- `handleShowLeaderboard()` - Handles admin's leaderboard request
- `handleNextQuestion()` - Handles admin's next question request
- `showFinalLeaderboard()` - Renamed from `showLeaderboard()` for quiz end
- `updateLeaderboard()` - Removed auto-sleep, now waits for admin

---

## Admin Changes (simulate/server-admin.ts)

### Lobby Menu (Before Quiz Starts)
```
👥 Connected Users: X
  • User1 (😀)
  • User2 (😎)

1. Show Questions
2. Start Quiz
0. Exit
```

### Quiz Menu (After Quiz Starts)
```
Status: [Question Complete / Leaderboard Shown / Quiz in Progress]

1. Show Leaderboard  (or Next Question)
2. Next Question     (or End Quiz)
0. Exit
```

### Key Features
1. ✅ Only shows "Show Questions" and "Start Quiz" in lobby
2. ✅ Shows users joining in real-time in lobby
3. ✅ After question ends, waits for admin to click "Show Leaderboard"
4. ✅ After leaderboard, waits for admin to click "Next Question"
5. ✅ Real-time option selection counts during question
6. ✅ Leaderboard shows cumulative scores

### Question Flow
```
5 sec GET READY message → 5 sec LOADING → 15 sec QUESTION (with live stats)
                                                    ↓
                                              Admin clicks SHOW LEADERBOARD
                                                    ↓
                                              LEADERBOARD (indefinite)
                                                    ↓
                                              Admin clicks NEXT QUESTION
                                                    ↓
                                              Next Question...
```

---

## User Changes (simulate/server-user.ts)

### User Flow
```
1. Join Lobby
   ↓
2. Wait for admin to start quiz
   ↓
3. 5 sec GET READY message
   ↓
4. 5 sec LOADING message
   ↓
5. QUESTION (15 sec)
   - Shows question and options
   - User selects option
   - Shows selected option
   - Real-time stats update
   ↓
6. SHOW ANSWWER
   - Shows correct answer
   - Shows user's score for this question
   ↓
7. Wait for admin to show leaderboard
   ↓
8. LEADERBOARD
   - Shows ONLY user's score (not full leaderboard)
   - Shows user's rank
   ↓
9. Wait for admin's next question
   ↓
Repeat 3-9 for all questions
```

### Key Features
1. ✅ Joins lobby and waits for admin
2. ✅ Shows 5 sec starting message
3. ✅ Shows 5 sec question loading
4. ✅ Shows question with options
5. ✅ Shows selected option when answered
6. ✅ Shows score confirmation
7. ✅ When admin shows leaderboard, shows only user's total score
8. ✅ Waits for admin's next question

---

## Test Files Updated

### test/test-admin.ts
- Copy of simulate/server-admin.ts
- Same manual flow as admin
- Can be used for automated testing

### test/test-user.ts
- Copy of simulate/server-user.ts
- Same manual flow as user
- Can be used for automated testing

---

## Type Changes (types/index.ts)

### New Message Types
```typescript
'SHOW_LEADERBOARD'
'QUESTION_COMPLETE'
'WAITING_LEADERBOARD'
```

### New Message Interfaces
```typescript
export interface ShowLeaderboardMessage extends BaseMessage {
  type: 'SHOW_LEADERBOARD';
  payload: {
    activityKey: string;
  };
}

export interface NextQuestionMessage extends BaseMessage {
  type: 'NEXT_QUESTION';
  payload: {
    activityKey: string;
  };
}
```

### New Quiz States
```typescript
export type QuizState =
  | 'LOBBY'
  | 'GET_READY'
  | 'QUESTION_LOADER'
  | 'QUESTION_ACTIVE'
  | 'QUESTION_COMPLETE'       // NEW
  | 'SHOW_ANSWER'
  | 'WAITING_LEADERBOARD'     // NEW
  | 'LEADERBOARD'
  | 'WAITING'
  | 'ENDED';
```

---

## Complete Quiz Flow Example

### Admin Side
```
1. Admin starts → Shows activity key
2. Users join → Shows in lobby
3. Admin clicks "Start Quiz"
4. Quiz flows through:
   - 5 sec "Get Ready"
   - 5 sec "Loading question"
   - 15 sec Question (with live option counts)
   - 3 sec "Answer Revealed"
5. Admin clicks "Show Leaderboard"
6. Leaderboard shown (indefinite)
7. Admin clicks "Next Question"
8. Repeat for all questions
9. Final leaderboard shown
10. Quiz ends
```

### User Side
```
1. User joins lobby
2. Waits for admin to start
3. 5 sec "Get Ready" shown
4. 5 sec "Loading question" shown
5. Question appears with options
6. User selects option
7. "Answer confirmed" with score shown
8. 3 sec "Answer revealed" shown
9. Waits for admin to show leaderboard
10. Leaderboard shows ONLY user's score
11. Waits for admin's next question
12. Repeat for all questions
13. Final score shown
14. Quiz ends
```

---

## Scoring Calculation Details

### Correct Answer Example
```
User answers in 3 seconds:
- Base Score: 100 points
- Time Bonus: (10 - 3) × 10 = 70 points
- Total: 170 points

User answers in 5 seconds:
- Base Score: 100 points
- Time Bonus: (10 - 5) × 10 = 50 points
- Total: 150 points

User answers in 8 seconds:
- Base Score: 100 points
- Time Bonus: (10 - 8) × 10 = 20 points
- Total: 120 points
```

### Wrong Answer Example
```
User answers in any time:
- Total: 0 points
```

### Cumulative Score
- Each question's score is added to total
- Leaderboard shows cumulative scores
- Final leaderboard shows total after all questions

---

## Files Modified

1. ✅ `types/index.ts` - Added new message types and states
2. ✅ `party/quiz.ts` - Implemented manual quiz flow
3. ✅ `simulate/server-admin.ts` - Updated admin with manual controls
4. ✅ `simulate/server-user.ts` - Updated user with new flow
5. ✅ `test/test-admin.ts` - Updated with new admin flow
6. ✅ `test/test-user.ts` - Updated with new user flow

---

## Build Status

✅ **Build Successful** - All files compile without errors

```bash
$ bun run build
$ tsc
# No errors
```

---

## Usage

### Start Dev Server
```bash
bun run dev
```

### Start Admin
```bash
cd simulate
bun run admin
```

### Start User
```bash
cd simulate
bun run user <activity-key> <nickname>

# Example:
bun run user quiz-a1b2c3d4 Alice
```

### Run Tests
```bash
cd test
bun run test-admin.ts
bun run test-user.ts <activity-key> <nickname>
```

---

## Summary

All requirements have been implemented:

✅ Admin creates room and moves to lobby
✅ Admin menu only shows "Show Questions" in lobby
✅ Shows users joining in real-time in lobby
✅ Shows "Start Quiz" option in lobby
✅ 5 sec starting message when quiz starts
✅ 5 sec question loading (5+5 = 10 sec before question)
✅ Question time with options and real-time selection counts
✅ Shows "Show Leaderboard" option after question
✅ Admin manually clicks to show leaderboard
✅ Calculates and updates user scores with new logic
✅ Shows "Next Question" option after leaderboard
✅ Admin manually clicks to move to next question
✅ User joins lobby and waits for admin
✅ User sees 5 sec starting, 5 sec loading, then question
✅ User shows selected option
✅ When admin shows leaderboard, user sees only their total score
✅ User waits for admin's next question
✅ Scoring logic: 100 pts base + 10 pts per second bonus
✅ Wrong answer = 0 pts regardless of time
✅ Cumulative scoring across all questions
✅ All test files updated with same logic
✅ All simulate files updated with same logic

The quiz system is now fully manual with complete admin control! 🎉
