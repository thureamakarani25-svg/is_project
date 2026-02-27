 # Bus Ticket System - PowerShell Startup Script

Write-Host "========================================"
Write-Host "Bus Ticket System - Quick Start"
Write-Host "========================================"
Write-Host ""

Write-Host "Starting Django Backend Server..."
Write-Host "Django will run on http://localhost:8000"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\PC\Desktop\thurea\ticketsystemproject'; python manage.py runserver"

Start-Sleep -Seconds 3

Write-Host "Starting React Frontend..."
Write-Host "React will run on http://localhost:3000"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\PC\Desktop\thurea\ticketsystemproject\frontend'; npx react-scripts start"

Write-Host ""
Write-Host "Wait for React to compile and then open your browser:"
Write-Host "http://localhost:3000"
Write-Host ""
Write-Host "To Log In:"
Write-Host "- Regular user: Use a regular account you registered"
Write-Host "- Admin user: Use the account created with 'python manage.py createsuperuser'"
