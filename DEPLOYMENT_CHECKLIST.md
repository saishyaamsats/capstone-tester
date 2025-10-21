# Netlify Deployment Checklist

Use this checklist to ensure your deployment is ready.

## Pre-Deployment

### Code & Configuration

- [x] `netlify.toml` configuration file created
- [x] `.env.example` file with all required environment variables
- [x] `.nvmrc` file specifying Node.js version
- [x] `next.config.ts` optimized for Netlify
- [x] `.gitignore` includes environment files
- [x] All console statements removed from production code
- [x] Error handling implemented throughout
- [x] TypeScript errors addressed (or build errors ignored)

### Testing

- [ ] Local build succeeds: `npm run build`
- [ ] Production build runs locally: `npm start`
- [ ] Type checking passes (or configured to ignore): `npm run typecheck`
- [ ] All pages load correctly
- [ ] API routes respond correctly
- [ ] Wallet connection works
- [ ] Forms submit successfully

### Git Repository

- [ ] All changes committed to Git
- [ ] Pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible
- [ ] Branch is `main` or specified in `netlify.toml`

## During Deployment

### Netlify Setup

- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings verified (auto-detected from `netlify.toml`)
- [ ] Node version set to 20.x

### Environment Variables

Add these in Netlify dashboard:

- [ ] `MEGAETH_RPC_URL`
- [ ] `MEGAETH_EXPLORER_URL`
- [ ] `NEXT_TELEMETRY_DISABLED`
- [ ] `NODE_VERSION` (if not using .nvmrc)
- [ ] Any other custom variables from `.env.example`

### Build Configuration

- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Functions directory: `netlify/functions` (if using)
- [ ] Node bundler: `esbuild` (for functions)

## Post-Deployment

### Verification

- [ ] Site deployed successfully
- [ ] Homepage loads correctly
- [ ] Navigation works (all routes)
- [ ] Authentication system works
- [ ] Wallet connection functional
- [ ] API endpoints respond correctly
- [ ] Images load properly
- [ ] Forms work correctly
- [ ] No console errors in browser
- [ ] Mobile responsive design works

### Performance

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] Images optimized
- [ ] Caching headers working

### Security

- [ ] HTTPS enabled (automatic)
- [ ] Security headers set (from `netlify.toml`)
- [ ] Environment variables not exposed in client
- [ ] No sensitive data in public files

### Monitoring

- [ ] Deploy notifications configured
- [ ] Error tracking set up (optional)
- [ ] Analytics enabled (optional)
- [ ] Custom domain configured (optional)

## Troubleshooting

If deployment fails, check:

1. **Build Logs**
   - View in Netlify dashboard → Deploys → Click on failed deploy
   - Look for error messages

2. **Common Issues**
   - Missing dependencies → Add to `package.json`
   - Environment variables → Check spelling and redeploy
   - API routes 404 → Verify Next.js plugin installed
   - Build timeout → Optimize build process

3. **Getting Help**
   - Check [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Visit [Netlify Forums](https://answers.netlify.com/)
   - Review build logs carefully

## Continuous Deployment

Once deployed:

- [x] Pushes to `main` trigger automatic deploys
- [x] Pull requests create deploy previews
- [x] Failed builds send notifications
- [x] Can rollback to previous deploys

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] Netlify Analytics enabled
- [ ] Split testing configured
- [ ] Form handling set up
- [ ] Serverless functions optimized
- [ ] Edge functions explored (if needed)
- [ ] Deploy previews tested

## Sign-Off

Deployment completed by: ________________

Date: ________________

Site URL: ________________

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

## Maintenance

Set reminders for:

- [ ] Weekly: Check analytics and performance
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] As needed: Review and optimize based on usage

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
