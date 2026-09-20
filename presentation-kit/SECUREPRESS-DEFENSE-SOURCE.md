# SecurePress - source brief for the thesis defense

## Source of truth

This brief is derived from `Rapport-PFE-LNET.pdf` (117 pages, scanned) and the local SecurePress demo project in `securepress-demo/`. The PDF remains the authoritative source for the thesis facts. The UI screenshots are evidence of the demo application's local presentation flow, not evidence of a production scan.

## Defense framing

- Presentation language: French.
- Audience: engineering-school jury and professional guests.
- Maximum length: 15 slides; target 13 slides.
- Project title: **Analyse, configuration et sécurisation d'une plateforme WordPress : audit statique et préparation d'un plan de correction des vulnérabilités**.
- Product/demo name: **SecurePress**.
- Academic context: final-year engineering project at LNET Communication SARL, academic year 2025/2026.
- Author: Mohamed Akram BENCHIHEB.
- The real environment is confidential. SecurePress is a local, offline, simulated demonstration using an anonymized/prepared WordPress snapshot.

## Core thesis narrative

The project addresses a modular WordPress platform whose security depends on the CMS core, themes, plugins, custom code, configuration, database, hosting and exposed services. The central question is:

> How can we establish a reliable security diagnosis from an offline copy of a WordPress platform and prepare reproducible remediation measures, while distinguishing confirmed observations, potential risks and controls that still require validation in the target environment?

The contribution is a risk-oriented workflow: collect and qualify evidence; inventory the platform; review configuration, versions, sensitive files and custom code; qualify findings by severity, exposure and confidence; prepare hardening and remediation artifacts; define functional, integrity and counter-audit checks.

## Facts confirmed by the report

### Platform inventory

- WordPress core: 6.4.3.
- Main theme: Astra 4.6.3.
- WooCommerce: 8.4.0.
- Seventeen plugin directories and four themes were identified in the application archive.
- Custom/third-party component: Info Cards 1.0.2, a Gutenberg block implemented through PHP, JSON metadata, JavaScript/React behavior and CSS.
- Database configuration is MySQL-compatible; the archive does not include the SQL export needed to confirm the runtime state.
- The archive includes WordPress files, themes, plugins, uploads/resources, `wp-config.php`, `.htaccess` and component metadata.

### Initial weaknesses identified in the reviewed copy

- Database connection configured with the `root` account and an empty password in the analyzed `wp-config.php`.
- WordPress authentication keys and salts left at example values.
- Missing hardening constants such as `DISALLOW_FILE_EDIT`, `FORCE_SSL_ADMIN` and an explicit update strategy.
- Several component versions require a security review or update: WordPress, Astra, WooCommerce, Depicter, Spectra, Smart Slider 3 and Essential Blocks.
- XML-RPC exposure, backup protection, file permissions and comment moderation require target-side confirmation.
- No confirmed compromise indicator was reported in the reviewed snapshot; this does not prove that production was never compromised.

### Method and references

- The approach is an offline/static review supported by component inventory, configuration review, version comparison, code review and preparation of controlled dynamic tests.
- The method is aligned with OWASP Top 10:2021, OWASP Web Security Testing Guide and NIST SP 800-115.
- Nuclei is described as a reference for detection templates and version comparison; no live Nuclei scan is demonstrated in the available evidence.
- A version in a vulnerable range is not, by itself, proof of exploitability: activation, configuration, roles, exposure and server protections must be checked.

## Remediation deliverables

- Hardened `wp-config.php` prepared with a dedicated application database account, strong secret placeholder, rotated authentication keys/salts, disabled file editor, HTTPS administration requirement and minor core update policy.
- `telco-security-hardening.php` prepared as a WordPress must-use plugin under `wp-content/mu-plugins`.
- The hardening module covers login-attempt throttling (five failed attempts then a simulated 15-minute lockout), user-enumeration reduction, version-information reduction, dangerous upload restriction and file-editor disablement.
- `remediation-runbook.md` prepared with the order of operations, WP-CLI update/integrity-check commands, backup/rollback reminders and target validation steps.
- Planned `.htaccess` hardening covers XML-RPC, sensitive backups, PHP execution in uploads, directory listing and security headers, but the reinforced file is not present in the current archive.

## Validation and evidence boundary

The report explicitly separates four levels:

1. **Developed** - the measure exists in a code or configuration artifact.
2. **Prepared** - a configuration or procedure is ready for deployment.
3. **Simulated validated** - a local demonstration scenario treats the control as successful.
4. **Verified on target** - runtime evidence proves it in the evaluated environment.

The available archives confirm the analysis, the findings, the remediation design and the validation protocol. They do not demonstrate production deployment, real WP-CLI execution, final TLS/HTTP-header validation, a post-remediation dynamic scan or a target-side counter-audit.

## SecurePress demo facts (must be labelled as simulated)

- Local/offline demo; no network scan, production connection or production modification.
- Prepared source snapshot: local WordPress package for the TELCO scenario.
- Demo inventory: WordPress 6.4.3, Astra 4.6.3, WooCommerce 8.4.0, 22 indexed components.
- Demo findings: 10 findings: 2 critical, 3 high, 3 medium, 2 low/variable.
- Demo remediation set: 10 actions, with simulated before/after states.
- Demo controls: 10 validation controls, including login throttling, upload policy, file-editor hardening, XML-RPC restriction, integrity and regression checks.
- Demo security posture is pedagogical: simulated baseline 42/100 and projected state 82/100 after guided changes. It is not a normative security score.
- Screenshots show the source verification, discovery, analysis, change-set, control-campaign and final-report states. Use them as product evidence, with a visible “Demo / offline snapshot” label.

## Recommended 13-slide structure

1. **Title** - SecurePress; subtitle; author, LNET, EMSI, 2025/2026; one-line evidence boundary.
2. **Context** - A WordPress platform is modular, useful and exposed through many dependencies; the project operates from an offline copy.
3. **Problem and objectives** - Reliable diagnosis without overclaiming; inventory, qualify, remediate, prepare validation.
4. **The answer: a traceable security workflow** - evidence -> inventory -> static review -> risk qualification -> remediation -> validation -> report.
5. **Conception: evidence before conclusions** - presence != activation != exploitability; each finding carries proof, confidence, exposure and state.
6. **Technical architecture** - client/browser -> presentation/theme -> WordPress core/plugins/custom component -> database; beside it, the SecurePress offline workflow and evidence boundary.
7. **Implementation stack and deliverables** - WordPress/PHP/MySQL side; SecurePress demo in React + TypeScript + Vite, local state/localStorage, simulation engine and local PDF report; `wp-config.php`, mu-plugin, runbook, checks.
8. **Demo 1: establish the source** - select local WordPress path; check existence/access; parse files; detect WordPress, themes and plugins; only then unlock discovery.
9. **Demo 2: discover and analyze** - progressive discovery and finding analysis; 22 components, 10 demo findings; show a critical finding with evidence and limitation.
10. **Demo 3: correct with a change set** - before/after for database account, keys/salts, file editor, uploads; corrections remain local/simulated.
11. **Demo 4: controls and validation** - login throttling, upload policy, hardening, integrity and regression; show pass/fail and pending target checks.
12. **Evaluation and honest result** - report facts from the thesis plus demo counters; delivered artifacts and what remains unproven; risk residual is not zero.
13. **Conclusion and perspectives** - contribution: a reproducible risk-oriented path from snapshot to remediation plan; next steps: preproduction deployment, authorized DAST/counter-audit, continuous maintenance, dependency rationalization and DevSecOps automation.

## Visual direction

Use a distinctive but professional “evidence lab” aesthetic: deep midnight blue background, warm off-white canvas panels, electric cyan as the process accent, restrained amber for pending validation and coral only for critical risk. Use a thin evidence-trace motif (dots/lines, file path fragments, small status chips), not hacker clichés. Prefer one strong diagram or screenshot per slide, short answer-led titles, generous whitespace, and large projector-safe type. Use the real SecurePress screenshots as framed product proof, with small captions and an explicit “local simulation” label.

## Claims to avoid

- Do not say a production scan was executed.
- Do not say a plugin was active only because its directory is present.
- Do not say a version match proves exploitability.
- Do not present 42/100 or 82/100 as a real security measurement.
- Do not say remediation was deployed or verified on the production target.
- Do not expose real passwords, keys, tokens or confidential infrastructure details.
