# QuantumChain Deployment Guide for Netlify

This guide provides step-by-step instructions for deploying the QuantumChain application to Netlify.

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v20.x or higher) installed locally
2. **npm** or **yarn** package manager
3. A **GitHub account** (or GitLab/Bitbucket)
4. A **Netlify account** (sign up at https://www.netlify.com)
5. **Git** installed on your machine

## Pre-Deployment Checklist

### 1. Test the Build Locally

Before deploying, verify that the application builds successfully:

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Build the application
npm run build

# Test the production build locally
npm run start
```

If the build completes without errors, you're ready to deploy!

### 2. Prepare Environment Variables

1. Copy the `.env.example` file to create your environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required environment variables in `.env.local`:
   - `MEGAETH_RPC_URL` - MegaETH blockchain RPC endpoint
   - `MEGAETH_EXPLORER_URL` - MegaETH block explorer URL
   - Other optional variables as needed

**Important:** Never commit `.env.local` or `.env` files to Git!

### 3. Commit Your Code

Ensure all changes are committed to your Git repository:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## Deployment Methods

### Method 1: Deploy via Netlify Dashboard (Recommended)

#### Step 1: Connect Your Repository

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the **capstone-tester** repository

#### Step 2: Configure Build Settings

Netlify should auto-detect Next.js settings. Verify the following:

- **Base directory:** Leave empty (or set to root)
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `netlify/functions`

The `netlify.toml` file in the repository will handle these automatically.

#### Step 3: Add Environment Variables

1. In the Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add each variable from `.env.example`:

   ```
   MEGAETH_RPC_URL = https://testnet.megaeth.systems
   MEGAETH_EXPLORER_URL = https://www.megaexplorer.xyz
   NEXT_TELEMETRY_DISABLED = 1
   NODE_VERSION = 20
   ```

3. Add any other required environment variables

#### Step 4: Deploy!

1. Click **"Deploy site"**
2. Netlify will:
   - Clone your repository
   - Install dependencies
   - Run the build command
   - Deploy your application
3. Wait for the deployment to complete (usually 2-5 minutes)

#### Step 5: Verify Deployment

1. Once deployed, Netlify provides a URL (e.g., `https://your-site-name.netlify.app`)
2. Visit the URL and test the application
3. Check that:
   - All pages load correctly
   - Wallet connection works
   - API routes respond
   - Quantum job submission functions properly

### Method 2: Deploy via Netlify CLI

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

This will open a browser window for authentication.

#### Step 3: Initialize Netlify

From the project root (`capstone-tester`):

```bash
netlify init
```

Follow the prompts:
- Choose **"Create & configure a new site"**
- Select your team
- Enter a site name (or let Netlify generate one)
- Use default build settings (from `netlify.toml`)

#### Step 4: Set Environment Variables

```bash
netlify env:set MEGAETH_RPC_URL "https://testnet.megaeth.systems"
netlify env:set MEGAETH_EXPLORER_URL "https://www.megaexplorer.xyz"
netlify env:set NEXT_TELEMETRY_DISABLED "1"
```

Repeat for all required environment variables.

#### Step 5: Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or deploy to a preview URL first
netlify deploy
```

## Post-Deployment Configuration

### Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS settings

### SSL Certificate

Netlify automatically provisions SSL certificates for all sites. Your site will be accessible via HTTPS.

### Continuous Deployment

With the Git integration:
- Pushing to `main` branch triggers a production deployment
- Pull requests create deploy previews automatically

## Troubleshooting

### Build Fails

**Problem:** Build fails with dependency errors

**Solution:**
```bash
# Try cleaning and reinstalling
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

**Problem:** TypeScript errors during build

**Solution:** The `next.config.ts` has `ignoreBuildErrors: true` set, but you can fix TypeScript issues:
```bash
npm run typecheck
```

### Runtime Errors

**Problem:** "Module not found" errors in production

**Solution:** Ensure all dependencies are in `dependencies` (not `devDependencies`) in `package.json`:
```bash
npm install <package-name> --save
```

**Problem:** Environment variables not working

**Solution:**
1. Verify variables are set in Netlify dashboard
2. Variables with `NEXT_PUBLIC_` prefix are exposed to browser
3. Server-side variables (API routes) don't need the prefix
4. Redeploy after adding variables: **Deploys** → **Trigger deploy**

### API Routes Not Working

**Problem:** 404 errors on `/api/*` routes

**Solution:**
- Ensure `@netlify/plugin-nextjs` is in `netlify.toml`
- Verify API routes are in `src/app/api/` directory
- Check function logs: **Functions** tab in Netlify dashboard

### Performance Issues

**Problem:** Slow page loads

**Solution:**
1. Enable caching headers (already in `netlify.toml`)
2. Optimize images using Next.js Image component
3. Check **Analytics** in Netlify dashboard for insights

## Netlify Features to Explore

### Deploy Previews

Every pull request gets a unique preview URL. Perfect for testing before merging!

### Rollbacks

Made a mistake? Roll back to a previous deployment:
1. Go to **Deploys** tab
2. Find the working deployment
3. Click **"Publish deploy"**

### Split Testing

Test different versions of your site:
1. Go to **Split testing** in dashboard
2. Deploy to different branches
3. Netlify splits traffic between versions

### Analytics

Enable Netlify Analytics for:
- Page views
- Unique visitors
- Top pages
- Not found (404) tracking

### Forms (Optional)

Netlify can handle form submissions without backend code. See [Netlify Forms docs](https://docs.netlify.com/forms/setup/).

## Monitoring & Logs

### Build Logs

View build output:
1. Go to **Deploys** tab
2. Click on a deployment
3. View build logs

### Function Logs

Monitor API routes:
1. Go to **Functions** tab
2. Click on a function
3. View execution logs in real-time

### Deploy Notifications

Set up notifications:
1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add notifications for:
   - Deploy succeeded
   - Deploy failed
   - Deploy started

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Use HTTPS** - Enabled by default on Netlify
3. **Enable headers** - Security headers configured in `netlify.toml`
4. **Regular updates** - Keep dependencies updated
5. **Monitor logs** - Check for suspicious activity

## Performance Optimization

1. **Enable caching** - Configured in `netlify.toml`
2. **Use Image Optimization** - Next.js Image component
3. **Code splitting** - Next.js handles automatically
4. **Compression** - Enabled in `next.config.ts`

## Useful Netlify CLI Commands

```bash
# View deployment status
netlify status

# Open site in browser
netlify open

# View site analytics
netlify analytics

# View environment variables
netlify env:list

# View function logs
netlify functions:log

# Link to existing site
netlify link
```

## Additional Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Plugin Next.js](https://github.com/netlify/netlify-plugin-nextjs)
- [Netlify Community Forum](https://answers.netlify.com/)

## Support

If you encounter issues:

1. Check [Netlify Status](https://www.netlifystatus.com/)
2. Review [Netlify Support Forums](https://answers.netlify.com/)
3. Contact Netlify Support (for paid plans)
4. Check GitHub Issues for this repository

## Next Steps After Deployment

1. **Set up monitoring** - Configure alerts for downtime
2. **Enable analytics** - Track user behavior
3. **Configure domain** - Add custom domain if needed
4. **Set up CI/CD** - Automate testing before deployment
5. **Performance testing** - Use Lighthouse or similar tools

---

**Congratulations!** Your QuantumChain application is now live on Netlify! 🎉

For production deployments, consider:
- Using a custom domain
- Setting up monitoring and error tracking
- Implementing proper authentication
- Connecting to production blockchain networks
- Regular security audits
