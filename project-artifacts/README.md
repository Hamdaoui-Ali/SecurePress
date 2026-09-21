# Supporting project artifacts

This directory contains reference material for explaining and reviewing SecurePress. These files are not required to build or run the local application.

## Contents

| File | Purpose | Size |
|---|---|---:|
| `Rapport-PFE-LNET.pdf` | Source thesis/report document used for project context and defense preparation | 20,982,023 bytes |
| `SecurePress-presentation-kit-backup.zip` | Recoverable backup of the presentation-kit working material | 3,688,358 bytes |

## Integrity checks

Verify a downloaded copy with PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 .\project-artifacts\Rapport-PFE-LNET.pdf
Get-FileHash -Algorithm SHA256 .\project-artifacts\SecurePress-presentation-kit-backup.zip
```

Expected SHA-256 values:

```text
Rapport-PFE-LNET.pdf
DF11BD9778D4C73E969A07ABF8A91CDF26980FFA7C2032101D384EBA2264FB36

SecurePress-presentation-kit-backup.zip
481667BDE6B9888471E4C2B3E3ECFC8D0373A31209631D2AB0AD6ABD2AC64E84
```

## Handling guidance

- Treat the PDF and ZIP as reference and delivery artifacts, not application inputs.
- Do not extract the backup over the working tree without reviewing its contents first.
- Do not place credentials, production exports, or private customer data in this directory.
- The application remains an offline local demonstration; these artifacts do not change its evidence boundary or security claims.
