@echo off
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo Creating backup with timestamp: %TIMESTAMP%
echo.

REM Create backup directory
mkdir "%~dp0backup_%TIMESTAMP%"

REM Backup key files
copy "%~dp0client\src\components\ProfileModal.jsx" "%~dp0backup_%TIMESTAMP%\" /Y
copy "%~dp0server\controllers\userController.js" "%~dp0backup_%TIMESTAMP%\" /Y
copy "%~dp0server\routes\users.js" "%~dp0backup_%TIMESTAMP%\" /Y
copy "%~dp0client\src\components\Navbar.jsx" "%~dp0backup_%TIMESTAMP%\" /Y

echo.
echo Backup created successfully in backup_%TIMESTAMP%
echo To restore, run restore_backup.bat
pause