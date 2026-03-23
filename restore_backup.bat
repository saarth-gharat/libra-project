@echo off
echo Restoring LIBRA.ONE backup from %~dp0backup_20260212_192205
echo.

REM Restore ProfileModal.jsx
if exist "%~dp0backup_20260212_192205\ProfileModal.jsx" (
    copy "%~dp0backup_20260212_192205\ProfileModal.jsx" "%~dp0client\src\components\ProfileModal.jsx" /Y
    echo Restored ProfileModal.jsx
) else (
    echo ProfileModal.jsx backup not found
)

REM Restore userController.js
if exist "%~dp0backup_20260212_192205\userController.js" (
    copy "%~dp0backup_20260212_192205\userController.js" "%~dp0server\controllers\userController.js" /Y
    echo Restored userController.js
) else (
    echo userController.js backup not found
)

REM Restore users.js route
if exist "%~dp0backup_20260212_192205\users.js" (
    copy "%~dp0backup_20260212_192205\users.js" "%~dp0server\routes\users.js" /Y
    echo Restored users.js route
) else (
    echo users.js backup not found
)

REM Restore Navbar.jsx
if exist "%~dp0backup_20260212_192205\Navbar.jsx" (
    copy "%~dp0backup_20260212_192205\Navbar.jsx" "%~dp0client\src\components\Navbar.jsx" /Y
    echo Restored Navbar.jsx
) else (
    echo Navbar.jsx backup not found
)

echo.
echo Backup restoration completed!
echo Please restart your servers after restoration.
pause