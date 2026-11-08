# Bootstrap 5 migration validation

Validated on 2026-11-08 against the upgrade-bootstrap5 starting commit 2b0aab52f09301a639021087951225678b983b88.

## Migration

- Bootstrap CSS and JavaScript: 4.6.2 to 5.3.8, pinned on Cloudflare cdnjs with SHA-384 integrity checks calculated from the downloaded bytes.
- Collapse attributes use data-bs-toggle and data-bs-target.
- ScrollSpy uses new bootstrap.ScrollSpy with a viewport root margin. The redundant Bootstrap 4 body data attributes were removed.
- Renamed ml-auto, text-left, text-right, and btn-block to ms-auto, text-start, text-end, and w-100.
- Replaced removed form-group usage with a site-specific contact-field class and kept its spacing and input styles.
- Removed standalone Popper 1.16.1. No current page component requires Popper. Add a compatible Bootstrap 5 bundle if dropdowns/tooltips/popovers are introduced later.
- Retained jQuery for custom effects, partner filtering, AJAX, and Lightbox.
- Preserved existing grid gutters, container width at large screens, heading size, link appearance, button text colors, form sizing, navbar spacing, and fixed-footer column spacing in the custom stylesheet.

## Verification

Browser: Chrome 156.0.8078.80 via Playwright.

The harness intercepted browser requests and served exact downloaded CDN files, including Google fonts, Font Awesome fonts, and Lightbox images, because direct browser networking was restricted. Integrity and CORS checks remained enabled. Analytics and reCAPTCHA were stubbed. The AWS contact endpoint was intercepted; no email was sent.

- Bootstrap 5.3.8 CSS and JS URLs downloaded successfully; SRI values verified by browser loading.
- No JavaScript errors or missing requested resources in final page initialization.
- Compared baseline and upgrade at widths 1440, 768, and 390 with a 900px viewport height and actual downloaded fonts.
- All six section heights, service container widths, name-input heights (38px), and submit-button heights (51px) matched the baseline at all three widths before the final navbar/footer-only spacing adjustments. No horizontal overflow was present in those checks.
- Mobile and tablet menu open/close and aria-expanded state passed.
- Smooth services navigation, fixed navbar color, and active services/contact links passed with the new ScrollSpy.
- All partner filters passed: All 4, Cloud 3, Development 2, Automation 3, Security 1.
- Typing animation, Lightbox image load, next-image navigation, and Escape close passed.
- Empty required form fields did not produce an API request.
- Intercepted HTTP 200/500 contact responses produced the expected success/failure alerts and preserved the POST JSON payload.
- Hero resize behavior passed.
- Inspected desktop and mobile screenshots; adjusted mobile navbar and footer column spacing to retain the existing appearance, then rechecked clean initialization and equal footer columns.
- JavaScript syntax and Git whitespace checks passed.

## Limits

Real AWS delivery/CORS, Analytics, and reCAPTCHA validation were not tested. Checks were in Chromium rather than Safari/Firefox or physical devices. Review the Cloudflare branch preview and verify actual contact delivery before promoting to production.

## References

- [Bootstrap 5 migration guide](https://getbootstrap.com/docs/5.3/migration/)
- [Bootstrap 5 ScrollSpy](https://getbootstrap.com/docs/5.3/components/scrollspy/)
- [Bootstrap 5 setup](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
