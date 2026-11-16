
$ErrorActionPreference = "Stop"

# Read local environment variables without printing values
$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    throw ".env.local not found"
}

$values = @{}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2

        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            $values[$key] = $value
        }
    }
}

$publicVariables = @(
    "NEXT_PUBLIC_CONVEX_URL",
    "NEXT_PUBLIC_CONVEX_SITE_URL",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
    "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
)

$buildArgs = @()

foreach ($key in $publicVariables) {
    if (-not $values.ContainsKey($key) -or
        [string]::IsNullOrWhiteSpace($values[$key])) {
        throw "Missing public configuration: $key"
    }

    # Docker reads the value from the environment
    Set-Item -Path "Env:$key" -Value $values[$key]

    $buildArgs += "--build-arg"
    $buildArgs += $key
}

Write-Host "Building LendLoop Docker image..."

docker build `
    --progress=plain `
    --tag lendloop:local `
    @buildArgs `
    .

if ($LASTEXITCODE -ne 0) {
    throw "Docker build failed"
}

Write-Host "Docker image built successfully."
