#!/bin/bash
# MusicSmell — Εκκίνηση πειράματος
# Κλείστε αυτό το παράθυρο ή πατήστε Ctrl+C για να σταματήσετε.

PORT=8000
echo ""
echo "  MusicSmell"
echo "  ────────────────────────────"
echo "  Ο server ξεκίνησε: http://localhost:$PORT"
echo "  Κλείστε αυτό το παράθυρο για να σταματήσει."
echo ""

open "http://localhost:$PORT"
python3 -m http.server $PORT
