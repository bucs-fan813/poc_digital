# POC | Digital

Source for [pocdigital.org](https://pocdigital.org), a static business website deployed from GitHub to Cloudflare Workers Static Assets.

## Requirements

No application server, database, package installation, or build step is required. The site consists of HTML, CSS, JavaScript, and images. A browser needs internet access for externally hosted fonts, icons, jQuery, Popper, Cloudflare Turnstile, and the contact API.

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
| Deploy command | `npx wrangler deploy` |
| Root directory | Repository root (default) |
| Preview builds | Enabled for all nonproduction branches |
| Cloudflare Access protection | Disabled for the public website |
| Environment variables | See Contact form setup below |

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

Production uses `npx wrangler deploy` to read the backend and asset settings from wrangler.json. The contact backend requires explicit hostname, secret, and email configuration. Preview hostnames are excluded by default.

[Cloudflare Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/)

## Domain and DNS

Add `pocdigital.org` and `www.pocdigital.org` under the Worker's **Settings > Domains & Routes > Add > Custom Domain** after the domain is active in Cloudflare DNS.

When migrating nameservers, copy existing mail and other service records before switching. Domain registration, DNS hosting, website hosting, and email are separate services; moving website hosting does not move mailboxes.

## Contact form

The form uses Turnstile site key `0x4AAAAAAF5NsJftdPxYowEF`, action `contact`, and the same-origin `POST /api/contact` Worker handler in `src/worker.mjs`. The retired AWS endpoint and Google reCAPTCHA are removed.

Deployment setup (required before the form can deliver):
1. Add the existing widget's secret directly in Cloudflare Workers > poc-digital > Settings > Variables and Secrets as **TURNSTILE_SECRET**, type Secret. Never commit it or paste it into chat.
2. Keep **TURNSTILE_HOSTNAMES** restricted to `pocdigital.org,www.pocdigital.org` for production. Siteverify must return success, action contact, and the actual request hostname. Keep the widget's existing clearance settings.
3. Onboard a sending domain in Cloudflare Email Service, reviewing its authentication records without replacing existing mailbox MX records. Confirm the recipient inbox, verify it, then add a `send_email` binding named **CONTACT_EMAIL** restricted with `destination_address` to that inbox in wrangler.json. Add **CONTACT_TO** and **CONTACT_FROM** configuration values; the sender must use an onboarded domain. These are intentionally unset until addresses are confirmed.
4. Change the production deploy command to `npx wrangler deploy` so the configuration supplies both backend and static assets. Build command remains `exit 0`. The existing preview command can stay.
5. Test on an approved hostname with a fresh real token, then confirm replay is rejected and the message reaches the inbox. A successful API response means email was accepted by the service, not proof of inbox delivery.

Missing secrets or email configuration fail closed with a 503 response; no success is shown. Verification outages and invalid, expired, reused, wrong-action, or wrong-hostname tokens cannot reach email sending. The backend bounds request size and field lengths. The browser preserves fields on failure and resets the challenge after an attempted submission.

Preview URLs and localhost are deliberately excluded from production's hostname list. For local tests, use mocked verification and email; never use a production secret with test keys or enable real email for all previews. Run `node --test tests/contact.test.mjs`. Serving files with Python previews the page only; it cannot run the Worker API. Worker source and tests are excluded from public assets.

Before public launch, configure an appropriate rate limit for POST /api/contact in Cloudflare; Turnstile alone is not a per-visitor sending quota. No submission bodies, tokens, or secrets are logged by this handler.

[Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) · [Email bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/)

## Editing and verification

1. Edit text in `index.html`, styling in `assets/css/main.css`, and behavior in `assets/js/script.js`.
2. Preview locally and check desktop and mobile navigation, images, partner filtering, and lightbox interactions.
3. Commit changes to a working branch, open a pull request into `main`, and merge after review.
4. Confirm the Cloudflare deployment succeeds and test both domain addresses.
5. Test contact form delivery independently; a successfully loaded page does not establish that email delivery works.

There is no repository-managed automated test suite or asset compilation pipeline. The library upgrade was checked with an external browser harness; results are recorded in docs/UPGRADE_VALIDATION.md. Retain notices in third-party library files. Historical Heroku deployment configuration and unused template assets have been removed; Git history retains them.

## CDN dependencies

Third-party CSS and JavaScript are loaded from https://cdnjs.cloudflare.com with pinned versions and SHA-384 integrity checks in index.html. Custom main.css and script.js stay in this repository and are delivered by Cloudflare with the website. Keep script order intact: jQuery, Bootstrap and remaining plugins, then script.js.

When changing a CDN version or file, update its integrity hash to match the exact response bytes and test page interactions. Lightbox images and Font Awesome fonts resolve relative to their CDN stylesheets. Google Fonts and Cloudflare Turnstile remain external services. Cloudflare Web Analytics uses automatic installation on the production domain.

Versions: Bootstrap 5.3.8, jQuery 4.0.0 (full build), jQuery Easing 1.4.1, Typed.js 2.1.0, Lightbox2 2.12.0, Font Awesome 5.15.4. Owl Carousel was unused and removed; partner filtering now uses a small function in script.js instead of MixItUp.

Bootstrap 5 uses its native Collapse and ScrollSpy APIs and data-bs attributes. The standalone Popper 1 script has been removed because the site does not use dropdowns, tooltips, or popovers. jQuery remains for custom page effects, partner filtering, contact AJAX, and Lightbox; Bootstrap itself no longer depends on it. Font Awesome stays on 5.x to preserve icon names, and Typed.js stays on the MIT-licensed 2.1.0 release.

The jQuery 4 migration uses the full build because the site needs AJAX, animation, and queues. Keep the exact version and integrity hash together when updating it. Resize and submit handlers use .on(), and hero heights include explicit pixel units.

Icons use Font Awesome Free 5.15.4 from cdnjs for service, navigation, contact, and social icons. Google Material Icons has been removed. Decorative icons are hidden from screen readers; icon-only contact links have accessible labels. The custom .service-icon class controls service icon sizing.

## Web Analytics

Cloudflare Web Analytics is enabled for `pocdigital.org` using automatic setup. Cloudflare injects its analytics beacon into eligible HTML responses on the proxied production domain; no tracking token or manual beacon script is stored in this repository. Google Analytics has been removed.

View traffic under **Cloudflare > Observability > Analytics > Web analytics**. Allow time for visits to appear after enabling analytics. Local previews and branch URLs are not configured for this site's analytics. Keep automatic setup enabled, avoid adding a second beacon, and do not add a `Cache-Control: no-transform` response header because it prevents automatic injection.
