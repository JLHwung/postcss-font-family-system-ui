# Security Policy

## Supported versions

Security fixes are released for the latest major version only.

| Version | Supported |
| ------- | --------- |
| 5.x     | Yes       |
| < 5.0   | No        |

## Reporting a vulnerability

Please do not report security vulnerabilities through public GitHub issues, discussions or pull requests.

Report them privately through [GitHub's private vulnerability reporting](https://github.com/JLHwung/postcss-font-family-system-ui/security/advisories/new).

Please include:

- the affected postcss-font-family-system-ui version, and the PostCSS and Node.js versions
- a description of the issue and its impact
- steps to reproduce, ideally the input CSS, the plugin options and your browserslist configuration

You should receive a reply within 21 days. Once the issue is confirmed, a fix is released as soon as possible and the advisory is published with credit to the reporter, unless you prefer to stay anonymous.

## Scope

postcss-font-family-system-ui rewrites `font` and `font-family` declarations using browser support data from [browserslist](https://github.com/browserslist/browserslist) and [caniuse-lite](https://github.com/browserslist/caniuse-lite). Report vulnerabilities in those packages, or in [PostCSS](https://github.com/postcss/postcss) itself, to their projects. If an issue in a dependency affects this plugin, please report it here too.

Output that follows from your own configuration, such as the fallback fonts you pass in the `family` option, is not a vulnerability in this plugin. Neither is inaccurate browser support data; report that to [caniuse](https://github.com/Fyrd/caniuse).

## Verifying releases

Releases after 5.0.0 are built and published from GitHub Actions with npm trusted publishing, and each one carries a provenance attestation. A maintainer approves every release with two-factor authentication before it becomes available. Earlier versions were published manually and have no provenance attestation. You can verify the signatures and provenance of installed packages with:

```bash
npm audit signatures
```
