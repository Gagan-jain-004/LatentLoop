# RTU Got Latent

Anonymous posting platform built with Next.js App Router, MongoDB (Mongoose), Tailwind CSS, and Framer Motion.

## Features

- Anonymous text posts (max 500 chars)
- Latest, Trending, and Most Upvoted feed filters
- Infinite scroll feed with skeleton loaders
- Upvote / downvote with abuse prevention (IP + localStorage)
- Report posts with auto-hide threshold
- Auto-expiry after 30 days via MongoDB TTL index
- Content search
- Feedback modal + feedback management
- Admin dashboard with login, stats, post moderation, and feedback moderation
- Dark mode toggle

## Tech Stack

- Next.js 16 (App Router, Route Handlers)
- React 19 + TypeScript
- MongoDB Atlas + Mongoose
- Tailwind CSS v4
- Framer Motion
- React Hot Toast

## Project Structure

```text
src/
	app/
		page.tsx
		admin/
			page.tsx
			dashboard/page.tsx
			posts/page.tsx
			feedback/page.tsx
		api/
			posts/
				route.ts
				vote/route.ts
				report/route.ts
				search/route.ts
			feedback/route.ts
			admin/
				login/route.ts
				logout/route.ts
				session/route.ts
				stats/route.ts
				posts/route.ts
				post/route.ts
				post/[id]/route.ts
				post/hide/route.ts
				feedback/route.ts
				feedback/[id]/route.ts
	components/
	lib/
	models/
	utils/
```

## Environment Variables

Create `.env.local`:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority

ADMIN_USERNAME=admin
ADMIN_PASSWORD=securepassword
JWT_SECRET=replace-with-a-long-random-secret

# Optional
NEXT_PUBLIC_REPORT_THRESHOLD=5
NEXT_PUBLIC_POST_TTL_DAYS=30

# Optional CAPTCHA (reCAPTCHA v2/v3 server verify)
CAPTCHA_SECRET=
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Reference

### Public APIs

- `POST /api/posts`
- `GET /api/posts?sort=latest|trending|top&page=1`
- `POST /api/posts/vote`
- `POST /api/posts/report`
- `GET /api/posts/search?q=<query>&page=1`
- `POST /api/feedback`

### Admin APIs

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`
- `GET /api/admin/stats`
- `GET /api/admin/posts?filter=most-reported|recent|hidden&page=1`
- `DELETE /api/admin/post/:id`
- `PATCH /api/admin/post/hide`
- `GET /api/admin/feedback?page=1`
- `DELETE /api/admin/feedback/:id`

## Database Schema

### Posts

```json
{
	"_id": "ObjectId",
	"content": "string",
	"upvotes": 0,
	"downvotes": 0,
	"score": 0,
	"reports": 0,
	"hidden": false,
	"createdAt": "date",
	"expiresAt": "date"
}
```

### Feedback

```json
{
	"_id": "ObjectId",
	"message": "string",
	"createdAt": "date"
}
```

## Security and Anti-Abuse

- IP-based rate limit on post creation (1 post per 30 seconds)
- IP-based vote/report restriction per post
- localStorage-based vote/report UI lock
- Input validation and sanitization
- Optional CAPTCHA verification via `CAPTCHA_SECRET`
- Admin auth via signed JWT in httpOnly cookie

## Deployment (Vercel + MongoDB Atlas)

1. Create a MongoDB Atlas cluster and copy the connection string.
2. Push this repository to GitHub.
3. Import the repo into Vercel.
4. Add environment variables in Vercel Project Settings:
	 `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, and optional values.
5. Deploy.
6. Verify:
	 - Public app loads and posts can be created.
	 - Admin login works at `/admin`.
	 - Report threshold hides posts.
	 - Old posts expire automatically after TTL period.

## Quality Checks

```bash
npm run lint
npm run build
```

Both commands currently pass.
