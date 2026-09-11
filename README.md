# SportsGuessr

A Wordle-inspired sports player guessing game designed for GitHub Pages.

## Included
- Basketball, Football, Soccer, and Baseball modes
- Strict sport-specific player pools
- 10 guesses per game
- Full-name tile board with a black divider for the first/last-name space
- Green / gold / gray Wordle-style feedback
- Team reveal after 5 incorrect guesses
- Timer and end-of-game result screen
- New Game + Menu buttons
- Local statistics and streaks
- Keyboard + on-screen keyboard
- Autocomplete player search
- Official NBA, NFL, MLB and FIFA links on the main menu
- Responsive mobile/desktop layout

## GitHub Pages
Upload `index.html`, `styles.css`, `app.js`, and `players.js` to the root of a GitHub repository. Enable GitHub Pages from **Settings → Pages** and deploy from the main branch/root.

## Expanding to every player
The game intentionally keeps roster data in `players.js`, separated into four arrays. Replace/expand those arrays with your licensed/current roster dataset. The game engine will automatically use the correct sport-only array.

The included data is a starter roster and should not be treated as a complete official league roster.
