# Library upgrade validation

Validated on 2026-11-08 against cleanup-cloudflare-readme commit 4bada46232d7300bc7223cb9f9255fe76889109e.

## Changes

| Library | Before | After |
| --- | --- | --- |
| Bootstrap CSS and JS | 4.1.1 | 4.6.2 |
| jQuery, full build | 1.11.3 | 3.7.1 |
| Popper | 1.14.3 | 1.16.1 |
| jQuery Easing | 1.3 | 1.4.1 |
| Typed.js | 1.1.7 | 2.1.0 |
| Lightbox2 CSS and JS | 2.8.2 | 2.12.0 |
| Font Awesome CSS/fonts | 5.7.1 | 5.15.4 |
| Owl Carousel | 1.3.3 | Removed: no carousel markup exists |
| MixItUp | 2.1.11 | Removed: small jQuery filter handles the four partner tiles |

The code now uses Typed's constructor API and a load handler compatible with jQuery 3. It handles scripts initializing after the load event, fixes the preloader's loader selector, and recalculates hero height on viewport resize. Partner filter selection updates the existing active class. Contact request data and endpoint remain unchanged.

## Checks performed

Browser: Chrome 156.0.8078.80 via Playwright.

- Downloaded all nine upgraded CSS/JS assets from their exact cdnjs URLs with HTTP 200 and calculated SHA-384 integrity values from their bytes.
- Downloaded and checked required Font Awesome fonts, Lightbox controls, and Google Fonts resources.
- Loaded the exact downloaded CDN bytes in the browser using request interception because direct browser networking was restricted. Integrity attributes remained enabled; downloaded resources were served with CORS headers.
- Compared baseline and upgrade at 1440px desktop and 390px phone widths; tested the upgrade at 768px tablet width.
- Checked initial load, preloader removal, typing animation, fixed navigation styling, smooth section scrolling, and mobile menu open/close.
- Exercised all partner filters and confirmed visible counts: All 4, Cloud 3, Development 2, Automation 3, Security 1.
- Opened the image preview, loaded the image, navigated to the next image, and closed it. Also checked Escape close on the upgraded preview.
- Tested the contact form with intercepted HTTP 200 and HTTP 500 responses. Confirmed POST JSON name/from/subject/message fields and the corresponding success/failure alerts. No request reached AWS and no email was sent.
- Resized the viewport and confirmed hero height updates.
- No page JavaScript errors or missing requested resources occurred in the final page checks.
- Compared section dimensions with real downloaded fonts: desktop dimensions were unchanged except a 3px contact-section increase; phone About height decreased by 1px and Contact increased by 3px. Contact icon glyphs were unchanged.
- Inspected screenshots; ran JavaScript syntax and Git whitespace checks.

## Limits and follow-up

- Real AWS availability, email delivery, backend CORS, Analytics, and reCAPTCHA behavior were not tested. Analytics and reCAPTCHA were stubbed during browser checks.
- This is a Chromium check, not Safari/Firefox or a physical-device certification.
- The pre-existing 12px horizontal overflow at 390px was present in both baseline and upgraded layouts before Google font substitution and was not increased by the upgrade.
- Bootstrap remains on its final 4.x release, which is end of life. Bootstrap 5 requires a deliberate markup/layout migration. jQuery remains on 3.x for Bootstrap 4 compatibility. Font Awesome stays within 5.x to retain icon names. Typed.js 2.1.0 preserves its MIT license.
- Recheck both production domains and actual contact delivery after merging and deployment.

## References

- [jQuery 3 upgrade guide](https://jquery.com/upgrade-guide/3.0/)
- [Bootstrap 4.6 JavaScript requirements](https://getbootstrap.com/docs/4.6/getting-started/javascript/)
- [Bootstrap 5 migration](https://getbootstrap.com/docs/5.3/migration/)
- [Typed.js 2.1.0 cdnjs files and license](https://cdnjs.com/libraries/typed.js/2.1.0)
- [Lightbox documentation](https://lokeshdhakar.com/projects/lightbox2/)
