@echo off
REM Wrapper voor geplande (Task Scheduler) en handmatige runs.
REM Logt elke run naar logs\run-<datum>.log en geeft een duidelijke exit code door.

setlocal
cd /d "%~dp0"

if not exist logs mkdir logs

set TIMESTAMP=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGFILE=logs\run-%TIMESTAMP%.log

echo Start run: %date% %time% > "%LOGFILE%"
node index.js >> "%LOGFILE%" 2>&1
set EXITCODE=%ERRORLEVEL%

if %EXITCODE% NEQ 0 (
    echo FOUT: script eindigde met exit code %EXITCODE% >> "%LOGFILE%"
    echo Zie %LOGFILE% voor details.
) else (
    echo OK: run succesvol afgerond >> "%LOGFILE%"
    node scripts/split-sheet.js >> "%LOGFILE%" 2>&1
    echo Excel bijgewerkt: output\uitsluitingen-tabbladen.xlsx >> "%LOGFILE%"
    echo Run succesvol. Zie %LOGFILE% en output\ voor resultaten.
)

exit /b %EXITCODE%
