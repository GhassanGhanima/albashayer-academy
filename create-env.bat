@echo off
echo Creating .env.local file...
(
echo MONGODB_URI=mongodb://localhost:27017/albashayer-academy
echo JWT_SECRET=albashayer_secret_key_2024
echo NODE_ENV=development
) > .env.local
echo.
echo .env.local file created successfully!
echo.
echo Contents:
type .env.local
pause
