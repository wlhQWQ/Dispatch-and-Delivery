# Verify Setup for Dispatch & Delivery Application
Write-Host "🔍 Verifying application setup..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker containers are running
Write-Host "📦 Checking Docker containers..." -ForegroundColor Yellow

$postgresRunning = docker ps --filter "name=postgres-dispatch" --filter "status=running" --format "{{.Names}}" 2>$null
$redisRunning = docker ps --filter "name=redis-dispatch" --filter "status=running" --format "{{.Names}}" 2>$null

if ($postgresRunning -eq "postgres-dispatch") {
    Write-Host "  ✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "  ❌ PostgreSQL is NOT running" -ForegroundColor Red
    $hasErrors = $true
}

if ($redisRunning -eq "redis-dispatch") {
    Write-Host "  ✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "  ❌ Redis is NOT running" -ForegroundColor Red
    $hasErrors = $true
}

Write-Host ""

# Check PostgreSQL data
if ($postgresRunning -eq "postgres-dispatch") {
    Write-Host "📊 Checking PostgreSQL data..." -ForegroundColor Yellow
    
    # Wait a moment for connection
    Start-Sleep -Seconds 1
    
    $orderCount = docker exec postgres-dispatch psql -U user -d dispatch_delivery -t -c "SELECT COUNT(*) FROM orders;" 2>$null
    
    if ($LASTEXITCODE -eq 0 -and $orderCount) {
        $orderCount = $orderCount.Trim()
        Write-Host "  ✅ Orders table: $orderCount records" -ForegroundColor Green
        
        # Show sample orders
        Write-Host "  📋 Sample orders:" -ForegroundColor Gray
        docker exec postgres-dispatch psql -U user -d dispatch_delivery -c "SELECT id, status, from_address FROM orders LIMIT 5;" 2>$null
    } else {
        Write-Host "  ⚠️  Could not query orders table (may not be initialized yet)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check Redis data
if ($redisRunning -eq "redis-dispatch") {
    Write-Host "📊 Checking Redis data..." -ForegroundColor Yellow
    
    $routeKeys = docker exec redis-dispatch redis-cli KEYS "routes:*" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        if ($routeKeys) {
            $keyCount = ($routeKeys | Measure-Object -Line).Lines
            Write-Host "  ✅ Route cache: $keyCount route(s) stored" -ForegroundColor Green
            
            # Show first few keys
            $routeKeys | Select-Object -First 5 | ForEach-Object {
                Write-Host "    - $_" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ⚠️  No routes cached yet (will be populated when backend starts)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ Could not query Redis" -ForegroundColor Red
        $hasErrors = $true
    }
}

Write-Host ""

# Summary
if ($hasErrors) {
    Write-Host "⚠️  Some issues found. Run 'npm run docker:start' to fix." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ All systems operational!" -ForegroundColor Green
    exit 0
}
