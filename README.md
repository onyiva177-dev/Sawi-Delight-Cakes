# 🎂 Sawi's Delight Cakes — Website

A beautiful bakery website powered by **Supabase** for real-time data storage, and deployable to **Vercel** in minutes.

## 🗂️ Project Files

| File | Purpose |
|---|---|
| `index.html` | Public website (share with customers) |
| `admin.html` | Admin panel (keep private!) |
| `supabase.js` | Supabase config + all DB functions |
| `app.js` | Public site rendering logic |
| `admin.js` | Admin panel logic |
| `images/` | Cake photos folder |
| `vercel.json` | Vercel hosting config |

## 🚀 Deploy to Vercel

### Step 1: Add your cake images
Put your cake photos in the `images/` folder with these names:
```
hero1.jpg, hero2.jpg, hero3.jpg
birthday1.jpg, birthday2.jpg, birthday3.jpg
kids1.jpg, kids2.jpg, kids3.jpg
grad1.jpg, grad2.jpg, grad3.jpg
wedding1.jpg, wedding2.jpg, wedding3.jpg
trad1.jpg, trad2.jpg, trad3.jpg
church1.jpg, church2.jpg, church3.jpg
```

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Launch Sawi's Delight Cakes"
git remote add origin https://github.com/YOUR-USERNAME/sawi-delight-cakes.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com → Sign in with GitHub
2. Click **New Project** → Import your repo
3. Click **Deploy** (no settings needed)
4. Done! ✅

## 🌐 Your Two Links

| Link | Use |
|---|---|
| `https://your-site.vercel.app` | Share with customers ✅ |
| `https://your-site.vercel.app/admin.html` | Admin only 🔒 |

## 🗄️ Supabase Database

This site uses Supabase for all content storage. The database schema is in `database-setup.sql`.

Make sure these tables exist in your Supabase project:
- `business_info`
- `cakes`, `cake_images`, `cake_details`
- `features`
- `ordering_steps`
- `testimonials`
- `about_content`

Also create a **Storage bucket** named `cake-images` (public) for image uploads via the admin panel.

## 📸 Adding Images

**Option A — Upload via Admin Panel:**
1. Open `admin.html` → click **📸 Upload Images** tab
2. Select image files → click Upload
3. Copy the URL → paste into any cake's image field

**Option B — Put in `/images/` folder:**
1. Add files to the `images/` folder
2. Reference them as `images/filename.jpg` in cake image URLs

## 📞 Contact

WhatsApp: +254797486557  
Location: Futro Area, Alego Usonga, Siaya County, Kenya
