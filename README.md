# POC | Digital

Source for [pocdigital.org](https://pocdigital.org), a static business website deployed from GitHub to Cloudflare Workers Static Assets.

## Requirements

No application server, database, package installation, or build step is required. The site consists of HTML, CSS, JavaScript, and images. A browser needs internet access for externally hosted fonts, icons, jQuery, Popper, Google reCAPTCHA, and the contact API.

## Repository layout

- `index.html`: page content, navigation, contact form, and external resource links.
- `assets/css/main.css`: stylesheet currently served by the site.
- `assets/js/script.js`: page interactions and contact form submission.
- `assets/img/`: images.
- Third-party browser libraries load from Cloudflare cdnjs; no bundled library copies are required.
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
| Preview builds | Enabled for all nonproduction branches |
| Cloudflare Access protection | Disabled for the public website |
| Environment variables | None required for static hosting |

Pushes to the connected production branch trigger deployment. Check Cloudflare's build logs and the assigned workers.dev address after changes. For rollback, revert the relevant Git commit and push the revert.

The compatibility date pins runtime behavior and does not need to change for each content update.

See [Cloudflare build settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Branch previews

The root `wrangler.json` defines the Worker name, compatibility date, static asset directory, and empty Preview settings.

Set the Cloudflare **Preview command** to:

```sh
npx wrangler preview --worker-name poc-digital
```

Do not pass `--assets` or `--compatibility-date` to `wrangler preview`; these settings come from the configuration file. The `--name` flag sets the Preview name, not the Worker name; leave it unset so each Git branch gets its own Preview.

Keep the production branch set to `main`. With preview builds enabled, pushes to other branches (including `dev`) create or update their previews without deploying to production. After changing the command, retry the preview build for a commit that includes `wrangler.json`.

Production can continue using the existing deploy command above, or `npx wrangler deploy` once the configuration is merged into main. The contact form still uses the existing AWS endpoint, so preview submissions can send real email.

[Cloudflare Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/)

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

There is no repository-managed automated test suite or asset compilation pipeline. The library upgrade was checked with an external browser harness; results are recorded in docs/UPGRADE_VALIDATION.md. Retain notices in third-party library files. Historical Heroku deployment configuration and unused template assets have been removed; Git history retains them.

## CDN dependencies

Third-party CSS and JavaScript are loaded from https://cdnjs.cloudflare.com with pinned versions and SHA-384 integrity checks in index.html. Custom main.css and script.js stay in this repository and are delivered by Cloudflare with the website. Keep script order intact: jQuery, Bootstrap and remaining plugins, then script.js.

When changing a CDN version or file, update its integrity hash to match the exact response bytes and test page interactions. Lightbox images and Font Awesome fonts resolve relative to their CDN stylesheets. Google fonts, Analytics, and reCAPTCHA remain external services.

Versions: Bootstrap 5.3.8, jQuery 4.0.0 (full build), jQuery Easing 1.4.1, Typed.js 2.1.0, Lightbox2 2.12.0, Font Awesome 5.15.4. Owl Carousel was unused and removed; partner filtering now uses a small function in script.js instead of MixItUp.

Bootstrap 5 uses its native Collapse and ScrollSpy APIs and data-bs attributes. The standalone Popper 1 script has been removed because the site does not use dropdowns, tooltips, or popovers. jQuery remains for custom page effects, partner filtering, contact AJAX, and Lightbox; Bootstrap itself no longer depends on it. Font Awesome stays on 5.x to preserve icon names, and Typed.js stays on the MIT-licensed 2.1.0 release.

The jQuery 4 migration uses the full build because the site needs AJAX, animation, and queues. Keep the exact version and integrity hash together when updating it. Resize and submit handlers use .on(), and hero heights include explicit pixel units.
