@echo off
REM ================================================================
REM  Vite + CodeIgniter 4 — Development Mode
REM  Starts both the Vite dev server and CI4's built-in server.
REM
REM  Ports are read from ci.config.ts. Override with env vars:
REM    set CI_PORT=9000 && dev.bat
REM ================================================================

setlocal

REM Default ports (match ci.config.ts)
if not defined CI_PORT set CI_PORT=8080
if not defined VITE_PORT set VITE_PORT=5173

echo.
echo ============================================
echo  Starting development servers...
echo ============================================
echo.
echo  CI4:   http://localhost:%CI_PORT%
echo  Vite:  http://localhost:%VITE_PORT%
echo  API:   http://localhost:%VITE_PORT%/api  -^>  CI4:%CI_PORT%
echo.
echo  Open http://localhost:%CI_PORT% in your browser.
echo  Press Ctrl+C to stop.
echo ============================================
echo.

REM Start Vite dev server in background
start "Vite Dev Server" /B pnpm run dev -- --port=%VITE_PORT%

REM Give Vite a moment to write the hot file
timeout /t 2 /nobreak >nul

REM Start CI4 server in foreground (Ctrl+C stops both)
php spark serve --port=%CI_PORT%

REM Cleanup: kill Vite when CI4 stops
taskkill /FI "WINDOWTITLE eq Vite Dev Server" /F >nul 2>nul

endlocal
