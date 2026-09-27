# 🚀 Production Deployment Guide: TOPFASTFOOD.LOL

Your project has been fully audited, hardened with security headers, content-filtered, and verified for production deployment.

---

## 1. Quick Deploy via Vercel (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Production release ready"
   git push origin master
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `topfastfood` repository.
   - Framework preset: **Next.js** (detected automatically).
   - Root directory: `./`

3. **Configure Environment Variables in Vercel (Optional)**:
   Under **Settings > Environment Variables**, you can add your Supabase keys (if using real-time database persistence). If none are set, the application operates smoothly with its in-memory initial state.

   | Variable | Value / Description | Sensitive? |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Public |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anonymous key | Public |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(Optional)* Backend admin operations | Secret |

   *(Dodo Payments keys can be added here when integrating).*

4. **Click Deploy**:
   - Vercel will build and serve your app globally on edge CDNs.
   - Point your custom domain `topfastfood.lol` in Vercel's **Domains** tab.

---

## 2. Production Security Audit Summary

✅ **Zero Secret Leakage / No Frontend API Keys**:
- No API keys, secret tokens, or private credentials exist anywhere in the frontend bundle.
- `.env*.local` is strictly ignored by `.gitignore`.

✅ **HTTP Security Headers Enabled** (`next.config.ts`):
- `X-Frame-Options: DENY` (prevents iframe clickjacking)
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

✅ **Dual-Layer Content Moderation**:
- **Automated Gate**: Blocks slurs, hate speech, phone numbers (doxxing), script tags, and scam links before submission.
- **Quarantine Support**: Setting `status: 'hidden'` on any brand or transaction in Supabase immediately hides it from the live UI without requiring a redeploy.

✅ **Built-in SEO & Social Share**:
- Generated `/robots.txt` and `/sitemap.xml`.
- OpenGraph and Twitter Summary cards configured for viral sharing.
