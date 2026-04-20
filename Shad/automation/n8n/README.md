# n8n Automation for Shadhee Website

This folder contains an n8n workflow for health checking your Shadhee website.

## What it does

- Runs every minute using the Cron node
- Calls `http://localhost:5177/health`
- Checks that the returned JSON `status` field equals `healthy`

## How to use

1. Open n8n and import `shadhee-website-health-check.workflow.json`.
2. Update the HTTP Request node URL if your site is deployed elsewhere.
   - Example: `https://your-domain.com/health`
3. Add notification nodes as needed:
   - Slack
   - Email
   - Telegram

## Recommended enhancement

Add a post-check node after `Check Health Status` to notify you when the site is down, for example:

- Slack
- Email
- SMS
- Webhook

## Notes

- Your backend already exposes `/health` in `backend/server.js`.
- If the website is deployed, use the deployed URL instead of `localhost`.
