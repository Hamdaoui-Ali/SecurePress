# Editable presentation source

The editable presentation source is tracked with Git LFS. It is a delivery
artifact and is not required to build or run `securepress-demo`.

## Source file

| File | Size | SHA-256 |
|---|---:|---|
| `SecurePress-soutenance.pptx` | 16,517,744 bytes | `19A128A772EB949188615580D5799D8B6F79527CFDED39E6DE8ECB76F9C8BA19` |

## Download and verification

Install Git LFS once, then fetch the binary from the repository:

```powershell
git lfs install
git lfs pull
```

Verify the downloaded file with PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 .\presentation-kit\SecurePress-soutenance.pptx
```

The calculated hash should match the value in the table above.
