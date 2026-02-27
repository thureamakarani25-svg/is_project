@echo off
echo ========================================
echo Bus Ticket System - Quick Start
echo ========================================
echo.
echo Starting Django Backend Server...
echo.
start cmd /k "cd c:\Users\PC\Desktop\thurea\ticketsystemproject && python manage.py runserver"
echo Django will run on http://localhost:8000
echo.
echo.
echo Starting React Frontend...
echo.
start cmd /k "cd c:\Users\PC\Desktop\thurea\ticketsystemproject\frontend && npx react-scripts start"
echo React will run on http://localhost:3000
echo.
echo Wait for React to compile and then open your browser:
echo http://localhost:3000
echo.
echo To Log In:
echo - Regular user: Use a regular account you registered
echo - Admin user: Use the account created with 'python manage.py createsuperuser'
