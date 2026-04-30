# MusicSmell - Crossmodal Semantic Priming Experiment

## Project Purpose
University research project examining connections between smell (olfaction) and sound (audition) perception. We build the **execution engine** — a web application that runs the experiment in a university lab. Our scope ends at CSV export of results; analysis is done in SPSS.

## Architecture

### Two-screen design
- **Participant screen** (`index.html`): Shows only "Αναμονή..." until experiment starts. Displays stimuli and collects responses during experiment. No setup controls visible.
- **Researcher screen** (`researcher.html`): Opened as popup from participant screen. All setup, monitoring, and control happens here.

### Communication
- Participant → Researcher: `postMessage` (trial updates, status confirmations)
- Researcher → Participant: `postMessage` (load commands, start, new session)
- Audio files loaded once per session in participant window (for playback), persist across sessions.

### File Structure
```
musicsmell/
├── index.html              # Participant screen (entry point)
├── researcher.html         # Researcher screen (popup, all controls)
├── css/styles.css          # Dark theme styling
├── js/
│   ├── app.js              # Main controller & message handler
│   ├── csv-parser.js       # Parse input CSV into trial objects
│   ├── trial-engine.js     # Trial execution with timing
│   ├── audio-manager.js    # Load & play audio (file:// compatible)
│   ├── ui.js               # Participant UI rendering
│   └── export.js           # Results CSV export & localStorage backup
├── audio/                  # .wav files (test tones included, real files from researcher)
└── strategy-brainstorming/ # Original design docs & sample CSVs
```

## Environment
- University lab, single workstation, two monitors
- Participant monitor: shows `index.html` (fullscreen recommended)
- Researcher monitor: shows `researcher.html` popup
- One participant at a time, local only
- Runs via local HTTP server (`python3 -m http.server`) or potentially file://

## Experiment Design

### Stimuli
- **5 sounds**: Lemon blossom.wav, Melon.wav, Vanilla.wav, Bergamot.wav, Truffle.wav
- **5 aromas**: Lemon blossom, Melon, Vanilla, Black pepper, Tobacco
- **6 lexical primes** (Greek): Λιακάδα, Αιχμή, Μάζα, Θαλπωρή, Αύρα, Νέκταρ
- **Controls**: Pink noise (auditory), Distilled water (olfactory)

### 6 Response Dimensions (slider scales)
Displayed in **fixed order** every trial. Participant rates each on a slider (0–100).
Labels are **neutral adjectives** (not the lexical primes):
1. Φωτεινό (Bright)
2. Οξύ (Sharp)
3. Πλήρες (Full)
4. Ζεστό (Warm)
5. Γλυκό (Sweet)
6. Δροσερό (Fresh)

Instruction shown above sliders based on target type:
- Auditory target → "Αξιολογήστε το ηχόχρωμα"
- Olfactory target → "Αξιολογήστε το άρωμα"

- Default: all at **50** (center, deactivated/dimmed)
- Slider ≠ 50: property activates visually (moved away from neutral)
- Range labels: "Καθόλου" (left, 0) — "Πολύ" (right, 100)
- Must activate at least 1 (move away from 50) before confirming
- Numeric values NOT shown to participant
- Returning slider to 50 deactivates it again
- CSV exports raw 0–100 value (researcher subtracts 50 for bipolar analysis)

### Trial Flow
```
[Prime: 7s] → [ISI: 1s blank] → [Target: 7s] → [Response: no time limit] → [Pause: 1s] → next
```

- Prime and target always **equal duration** (7s minimum; audio plays to natural end if longer)
- Response is always about the **target** only
- When TargetType changes between trials → block change pause (researcher must press Continue)

### Stimulus Presentation
| Type | Participant sees | Audio |
|------|-----------------|-------|
| **Auditory** | "Ακούστε τον ήχο" | System plays .wav |
| **Olfactory** | "Μυρίστε" | Researcher delivers scent manually |
| **Lexical** | Word centered on black screen | — |

### Researcher Screen Features
- Setup: audio folder picker, CSV drag & drop, start button
- Live monitoring: current trial, phase badge, action alerts
- Olfactory cues: "Ετοιμάστε: [aroma]", "ΔΩΣΤΕ: [aroma]"
- Next trial preview with olfactory warnings
- Progress bar
- "Νέο Session" button (audio stays loaded, only new CSV needed)

### Input
- Pre-generated CSV per participant per session (drag & drop on researcher screen)
- Format: `ParticipantID,Session,TrialNum,TargetType,Target,PrimeType,Prime,Congruency`
- The system does NOT generate trial sequences

### Output
- Auto-download CSV on session end
- Columns: `ParticipantID,Session,TrialNum,TargetType,Target,PrimeType,Prime,Congruency,Φωτεινό,Οξύ,Πλήρες,Ζεστό,Γλυκό,Δροσερό,ResponseTimeMs`
- Each dimension: integer 0–100 (0 = not selected)
- Filename: `results_P{id}_S{session}.csv`
- localStorage backup after each trial (crash recovery)

### Session Flow
1. Researcher opens `index.html`, clicks "Ρύθμιση" (small button, bottom-right)
2. Researcher popup opens → selects audio folder → drops CSV → clicks "Έναρξη"
3. Participant sees: Ετοιμαστείτε (3s) → trials execute
4. End: "Ευχαριστούμε" on participant, CSV auto-downloads
5. Researcher clicks "Νέο Session" → drops new CSV → repeat

## Technical Decisions
- **PsychoPy**: abandoned (too complex)
- **Technology**: Pure HTML/CSS/JS, no framework, no build step
- **Audio**: FileReader API + `URL.createObjectURL()` for file:// compatibility
- **Timing**: `setTimeout` for phase transitions, `performance.now()` for response time
- **Inter-window**: `postMessage` API (works cross-origin)
- **Distribution**: Zero dependencies; can run via `python3 -m http.server` or potentially file://
- **Demographic data**: collected separately, linked via ParticipantID in SPSS

## Reference Files
- `strategy-brainstorming/Priming protocol.docx` — Full experiment protocol
- `strategy-brainstorming/P01_S1.csv` — Demo input CSV (Participant 1, Session 1, 10 trials)
- `strategy-brainstorming/global_all_sessions.csv` — Master matrix (all participants/sessions)
- `audio/` — Test tone files (real .wav files to be provided by researcher)
