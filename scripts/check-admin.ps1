# Check if the current process has administrative privileges
$admin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($admin) {
    Write-Host "GitLab Runner has administrative privileges."
    exit 0
} else {
    Write-Error "GitLab Runner does NOT have administrative privileges. Deployment may fail!"
    exit 1
}