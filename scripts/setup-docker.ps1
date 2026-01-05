# Setup Docker Containers for Dispatch & Delivery Application
Write-Host "🐳 Checking Docker containers..." -ForegroundColor Cyan

# Check if Docker is running
try {
    $dockerRunning = docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker is not installed or not running. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Function to check if container exists and is running
function Test-ContainerRunning {
    param([string]$containerName)
    
    $running = docker ps --filter "name=$containerName" --filter "status=running" --format "{{.Names}}" 2>$null
    return $running -eq $containerName
}

# Function to check if container exists (but may be stopped)
function Test-ContainerExists {
    param([string]$containerName)
    
    $exists = docker ps -a --filter "name=$containerName" --format "{{.Names}}" 2>$null
    return $exists -eq $containerName
}

# Check PostgreSQL container
Write-Host "📦 Checking PostgreSQL container..." -ForegroundColor Yellow

if (Test-ContainerRunning "postgres-dispatch") {
    Write-Host "✅ PostgreSQL is already running" -ForegroundColor Green
} elseif (Test-ContainerExists "postgres-dispatch") {
    Write-Host "🔄 Starting existing PostgreSQL container..." -ForegroundColor Yellow
    docker start postgres-dispatch | Out-Null
    Write-Host "✅ PostgreSQL started" -ForegroundColor Green
} else {
    Write-Host "🚀 Creating and starting PostgreSQL container..." -ForegroundColor Yellow
    docker run --name postgres-dispatch `
        -e POSTGRES_DB=dispatch_delivery `
        -e POSTGRES_USER=user `
        -e POSTGRES_PASSWORD=password `
        -p 5432:5432 `
        -d postgres:latest | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL created and started" -ForegroundColor Green
        Write-Host "   Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    } else {
        Write-Host "❌ Failed to create PostgreSQL container" -ForegroundColor Red
        exit 1
    }
}

# Check Redis container
Write-Host "📦 Checking Redis container..." -ForegroundColor Yellow

if (Test-ContainerRunning "redis-dispatch") {
    Write-Host "✅ Redis is already running" -ForegroundColor Green
} elseif (Test-ContainerExists "redis-dispatch") {
    Write-Host "🔄 Starting existing Redis container..." -ForegroundColor Yellow
    docker start redis-dispatch | Out-Null
    Write-Host "✅ Redis started" -ForegroundColor Green
} else {
    Write-Host "🚀 Creating and starting Redis container..." -ForegroundColor Yellow
    docker run --name redis-dispatch `
        -p 6379:6379 `
        -d redis:latest | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis created and started" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ Failed to create Redis container" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ All Docker containers are ready!" -ForegroundColor Green
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Gray
Write-Host "   - Redis: localhost:6379" -ForegroundColor Gray
Write-Host ""

exit 0
