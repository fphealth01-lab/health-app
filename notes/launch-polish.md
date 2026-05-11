# Launch Polish Backlog

Things noticed during build that work "well enough" for MVP but could be improved post-launch.

## Step 8 polish backlog
- [ ] Meal photos: ~80% accurate, ~20% mismatched
  - Edge cases: complex meal names with multiple keywords
  - Solution path: expand keyword map OR use AI to classify meal → category
  - Priority: low (works "well enough" for MVP)

## Pre-launch polish
- [ ] Replace placeholder og-image.png with proper branded design
  - 1200x630px PNG
  - Lyvewell logo + tagline + clean visual
  - Make in Canva/Figma OR generate with AI
  - This appears when site is shared on Twitter/LinkedIn/iMessage

  echo "- [ ] Verify favicon shows L on lyvewell.fit after deploy (quit Chrome to flush cache if needed)" >> ~/Documents/Projects/health-app/notes/launch-polish.md

  cd ~/Documents/Projects/health-app
echo "" >> notes/launch-polish.md
echo "## Dev-only issues to investigate" >> notes/launch-polish.md
echo "- [ ] Red '1 Issue' Next.js DevTools badge appearing intermittently — capture error text next time it shows" >> notes/launch-polish.md