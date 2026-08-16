<#
.SYNOPSIS
    Automated PostgreSQL Database Backup & Retention Script for NETRONiX Portal.
.DESCRIPTION
    Exports the complete Supabase PostgreSQL database (schema + data) to a local timestamped file.
    Enforces an 8-week (56-day) retention policy by purging older backups automatically.
    Designed for standalone execution or Windows Task Scheduler automation.
.EXAMPLE
    .\scripts\backup-db.ps1
#>

[CmdletBinding()]
param (
    [string]$BackupDir = "$PSScriptRoot\..\backups",
    [int]$RetentionDays = 56 # 8 Weeks Retention
)

# 1. Ensure backup directory exists
$ResolvedBackupDir = [System.IO.Path]::GetFullPath($BackupDir)
if (-not (Test-Path $ResolvedBackupDir)) {
    New-Item -ItemType Directory -Path $ResolvedBackupDir -Force | Out-Null
    Write-Host "[INFO] Created backup directory: $ResolvedBackupDir" -ForegroundColor Cyan
}

# 2. Extract database connection string from environment or .env.local
$DbUrl = $env:DIRECT_URL
if ([string]::IsNullOrWhiteSpace($DbUrl)) {
    $DbUrl = $env:DATABASE_URL
}

if ([string]::IsNullOrWhiteSpace($DbUrl)) {
    # Check .env.local in root
    $EnvLocalPath = "$PSScriptRoot\..\.env.local"
    if (Test-Path $EnvLocalPath) {
        Get-Content $EnvLocalPath | ForEach-Object {
            if ($_ -match '^\s*DIRECT_URL\s*=\s*["'']?(.*?)["'']?\s*$') {
                $DbUrl = $matches[1]
            } elseif ([string]::IsNullOrWhiteSpace($DbUrl) -and $_ -match '^\s*DATABASE_URL\s*=\s*["'']?(.*?)["'']?\s*$') {
                $DbUrl = $matches[1]
            }
        }
    }
}

if ([string]::IsNullOrWhiteSpace($DbUrl)) {
    Write-Error "[ERROR] No database URL found. Set DATABASE_URL or DIRECT_URL in environment or .env.local."
    exit 1
}

# 3. Generate timestamped backup filename
$Timestamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$BackupFileName = "netronix_db_backup_$Timestamp.sql"
$BackupFilePath = Join-Path $ResolvedBackupDir $BackupFileName

Write-Host "==========================================" -ForegroundColor Green
Write-Host " NETRONiX Database Backup Operation" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "[INFO] Timestamp: $Timestamp"
Write-Host "[INFO] Destination: $BackupFilePath"

# 4. Check for pg_dump availability
$PgDumpPath = (Get-Command pg_dump -ErrorAction SilentlyContinue)?.Source
if (-not $PgDumpPath) {
    # Common PostgreSQL installation paths on Windows
    $CommonPaths = @(
        "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
        "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe"
    )
    foreach ($p in $CommonPaths) {
        if (Test-Path $p) {
            $PgDumpPath = $p
            break
        }
    }
}

if (-not $PgDumpPath) {
    Write-Error "[ERROR] pg_dump utility not found. Please install PostgreSQL command-line tools or add them to your PATH."
    Write-Host "[HINT] Install PostgreSQL or PostgreSQL CLI on Windows, or use 'winget install PostgreSQL.PostgreSQL'" -ForegroundColor Yellow
    exit 1
}

# 5. Execute pg_dump (schema + data + no-owner flags for clean portability)
Write-Host "[INFO] Executing pg_dump using: $PgDumpPath"
try {
    & $PgDumpPath --dbname="$DbUrl" --no-owner --no-privileges --clean --if-exists -F p -f "$BackupFilePath"
    if ($LASTEXITCODE -eq 0) {
        $FileSize = (Get-Item $BackupFilePath).Length / 1KB
        Write-Host "[SUCCESS] Database dump completed successfully! Size: $([math]::Round($FileSize, 2)) KB" -ForegroundColor Green
    } else {
        Write-Error "[ERROR] pg_dump exited with error code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
} catch {
    Write-Error "[ERROR] Failed to run pg_dump: $_"
    exit 1
}

# 6. Apply 8-Week Retention Policy (Purge backups older than 56 days)
Write-Host "[INFO] Applying $RetentionDays-day retention cleanup..."
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldBackups = Get-ChildItem -Path $ResolvedBackupDir -Filter "netronix_db_backup_*.sql" | Where-Object { $_.CreationTime -lt $CutoffDate }

foreach ($old in $OldBackups) {
    Write-Host "[PURGE] Removing expired backup: $($old.Name) (Created: $($old.CreationTime))" -ForegroundColor Yellow
    Remove-Item $old.FullName -Force
}

Write-Host "[COMPLETED] All backup tasks finished." -ForegroundColor Green
