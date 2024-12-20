param (
    [string]$InputFile,
    [string]$OutputFile
)

# Parse build log for warnings
$lines = Get-Content $InputFile | Where-Object { $_ -match "(warning|error).*" }

# Create an array to hold the results
$results = @()

foreach ($line in $lines) {
    $result = @{
        description = $line
        fingerprint = [System.Guid]::NewGuid().ToString("N")  # Generate unique ID
        severity    = "minor"  # Example: Adjust based on your logic
        location    = @{
            path = "example/path/to/file.cs"  # Extract this from the line
            lines = @{
                begin = 1  # Replace with the actual line number
            }
        }
    }
    $results += $result
}

# Convert results to JSON and save to output file
$results | ConvertTo-Json -Depth 2 | Set-Content $OutputFile
Write-Host "Code quality report saved to $OutputFile"