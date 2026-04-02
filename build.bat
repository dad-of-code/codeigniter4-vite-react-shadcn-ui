@echo off
REM ================================================================
REM  Vite + CodeIgniter 4 — Production Build
REM  Compiles React entries into writable\app with access-control
REM  manifest for the AssetController.
REM ================================================================

setlocal

REM Check for pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed. Install it with: npm install -g pnpm
    exit /b 1
)

echo.
echo ============================================
echo  Building Vite assets for production...
echo ============================================
echo.

REM Clean previous build
if exist "writable\app\assets" (
    echo Cleaning previous build...
    rmdir /s /q "writable\app\assets"
)
if exist "writable\app\.vite" (
    rmdir /s /q "writable\app\.vite"
)
if exist "writable\app\ci-manifest.json" (
    del "writable\app\ci-manifest.json"
)

REM Run the build
call pnpm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Vite build failed.
    exit /b 1
)

echo.
echo ============================================
echo  Build complete!
echo ============================================
echo.
echo Output:   writable\app\
echo Manifest: writable\app\ci-manifest.json
echo.

REM Show manifest summary if php is available
where php >nul 2>nul
if %errorlevel% equ 0 (
    php spark vite:manifest
)

endlocal
