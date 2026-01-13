<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14OH9K2M2BNegBBVsGRSC8cXc7fZCkaYl

**Live Demo:** https://tagliala-labs.github.io/stk/

## Run Locally

**Prerequisites:** Node.js and pnpm

1. Install dependencies:
   `pnpm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `pnpm run dev`

## Deploy to GitHub Pages

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

The deployment workflow can also be triggered manually from the Actions tab in GitHub.

**Deployed URL:** https://tagliala-labs.github.io/stk/
