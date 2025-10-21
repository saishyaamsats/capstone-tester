# Quick Start: Deploy to Netlify in 5 Minutes

The fastest way to get QuantumChain running on Netlify.

## One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## Manual Quick Deploy (5 Steps)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Step 2: Import to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Select your Git provider and repository

### Step 3: Build Settings (Auto-Detected)

Netlify automatically detects:
- Build command: `npm run build`
- Publish directory: `.next`

Just click **"Deploy site"**!

### Step 4: Add Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**:

```
MEGAETH_RPC_URL = https://testnet.megaeth.systems
MEGAETH_EXPLORER_URL = https://www.megaexplorer.xyz
NEXT_TELEMETRY_DISABLED = 1
```

### Step 5: Trigger Redeploy

After adding variables:
- Go to **Deploys** tab
- Click **"Trigger deploy"** → **"Deploy site"**

## Done! 🎉

Your site will be live at: `https://your-site-name.netlify.app`

## What's Configured Automatically

✅ Next.js API routes work as serverless functions
✅ Automatic HTTPS with SSL certificate
✅ CDN distribution worldwide
✅ Continuous deployment on Git push
✅ Deploy previews for pull requests
✅ Automatic cache optimization

## Common Issues

**Build fails?**
- Check build logs in Netlify dashboard
- Verify all dependencies are installed
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting

**Environment variables not working?**
- Make sure to redeploy after adding variables
- Check variable names match exactly (case-sensitive)

**API routes return 404?**
- Ensure `@netlify/plugin-nextjs` is installed (automatic)
- Check `netlify.toml` is in repository root

## Next Steps

- Read full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Configure custom domain
- Set up deploy notifications
- Enable Netlify Analytics

## Need Help?

- [Full Deployment Guide](./DEPLOYMENT.md)
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Support Forums](https://answers.netlify.com/)
