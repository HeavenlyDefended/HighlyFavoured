#!/bin/bash
echo "🤖 NEO STATUS REPORT"
echo "===================="
echo ""
echo "📊 Products Generated:"
echo "   Ebooks: $(ls -1 output/ebooks/ 2>/dev/null | wc -l)"
echo "   Web Tools: $(ls -1 output/web-tools/ 2>/dev/null | wc -l)"
echo "   Prompts: $(ls -1 output/prompts/ 2>/dev/null | wc -l)"
echo "   Checklists: $(ls -1 output/checklists/ 2>/dev/null | wc -l)"
echo ""
echo "💰 Estimated Value:"
TOTAL=$(( $(ls -1 output/ebooks/ 2>/dev/null | wc -l) * 5 + \
          $(ls -1 output/web-tools/ 2>/dev/null | wc -l) * 10 + \
          $(ls -1 output/prompts/ 2>/dev/null | wc -l) * 4 + \
          $(ls -1 output/checklists/ 2>/dev/null | wc -l) * 3 ))
echo "   ~$${TOTAL} potential revenue"
echo ""
echo "🕐 Cron Job: $(crontab -l 2>/dev/null | grep -c generateProduct || echo "0") active"
echo "✅ NEO Core: $(pgrep -f "node dist/index.js" > /dev/null && echo "RUNNING" || echo "STOPPED")"
