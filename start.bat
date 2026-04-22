@echo off
REM MusicSmell — Εκκίνηση πειράματος
REM Κλείστε αυτό το παράθυρο ή πατήστε Ctrl+C για να σταματήσετε.

cd /d "%~dp0"
set PORT=8000
echo.
echo   MusicSmell
echo   ------------------------------
echo   Ο server ξεκίνησε: http://localhost:%PORT%
echo   Κλείστε αυτό το παράθυρο για να σταματήσει.
echo.

start http://localhost:%PORT%
python -m http.server %PORT%
