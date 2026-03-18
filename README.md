# RcmPlan — Portfolio Management Dashboard

A browser-based program/portfolio management tool for tracking features across programs, initiatives, iterations, and teams. No backend, no login — just load a CSV and go.

## What it does

- Import a CSV of Jira-style tickets (or use the built-in sample data)
- View work across 8 tabs: Overview, Program Board, Timeline, Multi-PI Roadmap, Team Load, Hierarchy, Change Log, Risks
- Drag and drop features between iterations or statuses
- Track team capacity and load by iteration
- Export updated data back to CSV

## Running locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

```bash
npm run build      # production build → dist/
npm run lint       # run ESLint
npm run preview    # preview the production build locally
```

## CSV Format

The app auto-detects column names. Supported variations:

| Field | Accepted column names |
|---|---|
| ID | `Issue key`, `Key`, `ID` |
| Title | `Summary`, `Title`, `Name` |
| Team | `Team`, `Delivery Team` |
| Iteration | `Iteration`, `Sprint`, `Iter` |
| Points | `Story Points`, `Points`, `SP` |
| Status | `Status` |
| Parent | `Parent`, `Parent Key`, `Epic Link` |
| Program | `Program`, `Programme` |
| PI | `PI`, `Program Increment` |
| Assignee | `Assignee`, `Member`, `Owner` |

All other columns are preserved and visible in the Ticket Details modal.

## Deploying to AWS (S3 + CloudFront via GitHub Actions)

Deployments are automated — every push to `main` builds and deploys the app.

### GitHub Secrets required

Add these in your GitHub repo under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | ARN of the IAM role GitHub Actions will assume |
| `AWS_REGION` | AWS region of your S3 bucket (e.g. `us-east-1`) |
| `S3_BUCKET` | Name of the S3 bucket |
| `CF_DIST_ID` | CloudFront distribution ID (for cache invalidation) |

### AWS resources needed (one-time setup)

1. **S3 bucket** — private, with CloudFront OAC enabled
2. **CloudFront distribution** — pointing to the S3 bucket, default root object: `index.html`, custom error response: 404 → `/index.html` (200)
3. **IAM OIDC provider** for `token.actions.githubusercontent.com`
4. **IAM deploy role** — trusted by the GitHub OIDC provider, scoped to this repo, with the following permissions:
   - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the S3 bucket
   - `cloudfront:CreateInvalidation` on the CloudFront distribution

Once those are in place and the secrets are set, push to `main` — the GitHub Actions workflow handles the rest.

### Manual deploy (no GitHub Actions)

```bash
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id YOUR_CF_DIST_ID --paths "/*"
```
