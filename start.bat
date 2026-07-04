@echo off
echo Starting Ascend MERN Stack...

echo Starting Backend Server...
cd server
start cmd /k "npm run dev"
cd ..

echo Starting Frontend Client...
cd client
start cmd /k "npm start"
cd ..

echo Ascend development environment is running!
