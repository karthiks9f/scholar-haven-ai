# Student Hub Central

Build a modern, student-friendly web application called "StudentVault" designed as a unified resource and productivity dashboard for high school students.

### 🎨 Visual Style & Theme

- Aesthetic: Modern, sleek, dark-mode design (slate dark background #0f172a, subtle indigo accents #6366f1, translucent glassmorphism card surfaces with subtle border highlights).

- Tone: High-energy, clean, and organized (like Discord/Notion meets Apple).

- Fonts & UI: Modern rounded typography, clean icons (using Lucide icons), generous padding, and smooth hover effects on interactive elements.

### 📜 Page Layout & Key Components

1. Navigation Bar (Top Header):

   - Display logo: "StudentVault ⚡"

   - Quick Search bar with a keyboard shortcut badge (`Cmd/Ctrl + K`) to quickly filter links or subjects.

   - Profile avatar icon with a "Logged In as Student" indicator.

2. Class Schedule Grid (Main Dashboard):

   - Display a responsive grid of 6 Class Period Cards (e.g., "Period 1: AP European History", "Period 2: Pre-Calculus", "Period 3: Biology", "Period 4: English Literature", "Period 5: Computer Science", "Period 6: Art & Design").

   - Each Class Card must display:

     - Period Badge (e.g., "Period 1" in a glowing indigo pill pill badge).

     - Teacher Name and a clickable Email icon.

     - A list of categorized resource links inside each card (e.g., Google Drive, Quizlet, Canvas, Syllabus) with custom icons and hover transitions.

     - An "+ Add Link" button that opens a modal dialog to paste a new title, URL, and select a category tag.

3. 🤖 AI Assistant Integration ("Study Buddy AI"):

   - Add an interactive floating AI side panel or modal accessible from a floating button in the bottom-right corner titled "Ask AI Study Buddy".

   - Features inside the AI panel:

     - Quick Prompt Action Buttons: "Summarize my notes", "Generate 3 study quiz questions", "Break down an essay assignment into steps".

     - A chat conversation interface where students can paste text, study topics, or assignment details and receive instant structured bullet-point explanations.

     - Pre-populate realistic mock AI response data so it is interactive out of the box.

4. Quick Launch Action Bar:

   - Include a "Start Study Session" button at the top that triggers a 25-minute Pomodoro study timer widget with Play/Pause/Reset controls and ambient background sound toggles.

### 💡 Data & State Rules

- Populate the initial UI with realistic high school subject data, teacher emails, and working external sample links (do NOT use blank placeholders or Lorem Ipsum).

- Make all buttons, modals, and input fields fully interactive in state.

- Ensure the layout is 100% mobile-responsive.

Ask me any questions you need in order to fully understand what I want before writing the code!

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://scholar-haven-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b3fbf41-e5a0-414a-931a-1e7dea73c0e8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
