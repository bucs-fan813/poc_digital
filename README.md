# POC | Digital

Source for [pocdigital.org](https://pocdigital.org), a static business website deployed from GitHub to Cloudflare Workers Static Assets.

## Requirements

No application server, database, package installation, or build step is required. The site consists of HTML, CSS, JavaScript, and images. A browser needs internet access for externally hosted fonts, icons, jQuery, Popper, Google reCAPTCHA, and the contact API.

## Repository layout

- `index.html`: page content, navigation, contact form, and external resource links.
- `assets/css/main.css`: stylesheet currently served by the site.
- `assets/js/script.js`: page interactions and contact form submission.
- `assets/img/`: images.
- `assets/bootstrap-4.1.1-dist/` and `assets/js/plugins/`: vendored browser libraries.
- `assets/scss/main.scss`: original template stylesheet source. It differs from the live CSS; there is no configured Sass build. Edit the live CSS for current styling changes.
- Root icons, `site.webmanifest`, and `browserconfig.xml`: browser and device icons.
- `.assetsignore`: excludes documentation and development files from static asset uploads.

## Preview locally

From the repository root, if Python is installed:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Stop the server with Ctrl+C. External services still require connectivity.

## Deploy to Cloudflare

The project uses **Workers Static Assets**, not Cloudflare Pages.

| Setting | Value |
| --- | --- |
| Repository | `bucs-fan813/poc_digital` |
| Production branch | `main` |
| Worker name | `poc-digital` |
| Build command | `exit 0` |
| Deploy command | `npx wrangler deploy --name poc-digital --assets . --compatibility-date 2026-11-04` |
| Root directory | Repository root (default) |
| Preview builds | Disabled in the initial setup |
| Cloudflare Access protection | Disabled for the public website |
| Environment variables | None required for static hosting |

Pushes to the connected production branch trigger deployment. Check Cloudflare's build logs and the assigned workers.dev address after changes. For rollback, revert the relevant Git commit and push the revert.

The compatibility date pins runtime behavior and does not need to change for each content update.

See [Cloudflare build settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Domain and DNS

Add `pocdigital.org` and `www.pocdigital.org` under the Worker's **Settings > Domains & Routes > Add > Custom Domain** after the domain is active in Cloudflare DNS.

When migrating nameservers, copy existing mail and other service records before switching. Domain registration, DNS hosting, website hosting, and email are separate services; moving website hosting does not move mailboxes.

## Contact form

The browser submits JSON to an existing AWS API Gateway endpoint configured in `assets/js/script.js`. Its backend and email service are managed outside this repository and Cloudflare. Verify delivery separately after deployment, including any API CORS restrictions for the production domain.

The page contains a reCAPTCHA widget, but the current JavaScript does not include its response token in the API request. Do not assume the widget enforces server-side spam protection. Backend validation cannot be verified from this repository.

Never add AWS credentials, SMTP passwords, or reCAPTCHA secrets to browser code.

## Editing and verification

1. Edit text in `index.html`, styling in `assets/css/main.css`, and behavior in `assets/js/script.js`.
2. Preview locally and check desktop and mobile navigation, images, partner filtering, and lightbox interactions.
3. Commit changes to a working branch, open a pull request into `main`, and merge after review.
4. Confirm the Cloudflare deployment succeeds and test both domain addresses.
5. Test contact form delivery independently; a successfully loaded page does not establish that email delivery works.

There is no automated test suite or asset compilation pipeline. Retain notices in third-party library files. Historical Heroku deployment configuration and unused template assets have been removed; Git history retains them.
