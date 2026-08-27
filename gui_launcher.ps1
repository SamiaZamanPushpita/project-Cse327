# Tutor Management System — Windows GUI Launcher & Control Panel (CSE327)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create Main Window Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Tutor Management System - CSE327 Control Panel"
$form.Size = New-Object System.Drawing.Size(540,480)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(15, 23, 42) # Slate-900

# Header Title Label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "Tutor Management System"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.Location = New-Object System.Drawing.Point(30, 20)
$titleLabel.Size = New-Object System.Drawing.Size(460, 35)
$form.Controls.Add($titleLabel)

# Subtitle Label
$subLabel = New-Object System.Windows.Forms.Label
$subLabel.Text = "CSE327 Software Engineering - 8 GoF Design Patterns Integrated"
$subLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$subLabel.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$subLabel.Location = New-Object System.Drawing.Point(30, 55)
$subLabel.Size = New-Object System.Drawing.Size(460, 25)
$form.Controls.Add($subLabel)

# Status Label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Status: Ready to launch backend and frontend..."
$statusLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Italic)
$statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(52, 211, 153) # Emerald-400
$statusLabel.Location = New-Object System.Drawing.Point(30, 85)
$statusLabel.Size = New-Object System.Drawing.Size(460, 25)
$form.Controls.Add($statusLabel)

# Button 1: Launch Full Application (Backend + Frontend)
$btnLaunch = New-Object System.Windows.Forms.Button
$btnLaunch.Text = "1-Click Launch Full App and Browser"
$btnLaunch.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnLaunch.BackColor = [System.Drawing.Color]::FromArgb(79, 70, 229) # Indigo-600
$btnLaunch.ForeColor = [System.Drawing.Color]::White
$btnLaunch.FlatStyle = "Flat"
$btnLaunch.Location = New-Object System.Drawing.Point(30, 125)
$btnLaunch.Size = New-Object System.Drawing.Size(460, 45)
$btnLaunch.Add_Click({
    $statusLabel.Text = "Status: Starting Backend and Frontend servers..."
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    Start-Process cmd.exe -ArgumentList "/c cd /d `"$scriptDir`" & npm run dev" -WindowStyle Minimized
    
    Start-Sleep -Seconds 3
    Start-Process "http://127.0.0.1:3000"
    $statusLabel.Text = "Status: App running on http://127.0.0.1:3000!"
    [System.Windows.Forms.MessageBox]::Show("Tutor Management System is now running!`n`nWeb Portal: http://127.0.0.1:3000`nAPI Server: http://127.0.0.1:5000", "App Started Successfully", "OK", "Information")
})
$form.Controls.Add($btnLaunch)

# Button 2: Seed Database
$btnSeed = New-Object System.Windows.Forms.Button
$btnSeed.Text = "Seed Database with Demo Accounts"
$btnSeed.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnSeed.BackColor = [System.Drawing.Color]::FromArgb(16, 185, 129) # Emerald-600
$btnSeed.ForeColor = [System.Drawing.Color]::White
$btnSeed.FlatStyle = "Flat"
$btnSeed.Location = New-Object System.Drawing.Point(30, 185)
$btnSeed.Size = New-Object System.Drawing.Size(460, 45)
$btnSeed.Add_Click({
    $statusLabel.Text = "Status: Seeding SQLite database..."
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    $p = Start-Process cmd.exe -ArgumentList "/c cd /d `"$scriptDir\backend`" & npm run seed" -NoNewWindow -Wait -PassThru
    
    $statusLabel.Text = "Status: Database seeded successfully!"
    [System.Windows.Forms.MessageBox]::Show("Database seeded with Tutor, Student, and Parent demo accounts!", "Seeding Complete", "OK", "Information")
})
$form.Controls.Add($btnSeed)

# Button 3: Execute 8 GoF Design Patterns Live Proof
$btnPatterns = New-Object System.Windows.Forms.Button
$btnPatterns.Text = "Verify 8 GoF Design Patterns Suite"
$btnPatterns.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnPatterns.BackColor = [System.Drawing.Color]::FromArgb(147, 51, 234) # Purple-600
$btnPatterns.ForeColor = [System.Drawing.Color]::White
$btnPatterns.FlatStyle = "Flat"
$btnPatterns.Location = New-Object System.Drawing.Point(30, 245)
$btnPatterns.Size = New-Object System.Drawing.Size(460, 45)
$btnPatterns.Add_Click({
    $statusLabel.Text = "Status: Executing 8 Design Patterns Test..."
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    Start-Process cmd.exe -ArgumentList "/c cd /d `"$scriptDir`" & npm run test:api & pause"
    $statusLabel.Text = "Status: Design Patterns executed!"
})
$form.Controls.Add($btnPatterns)

# Button 4: Open Browser Directly
$btnBrowser = New-Object System.Windows.Forms.Button
$btnBrowser.Text = "Open Web Browser (http://localhost:3000)"
$btnBrowser.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$btnBrowser.BackColor = [System.Drawing.Color]::FromArgb(30, 41, 59) # Slate-800
$btnBrowser.ForeColor = [System.Drawing.Color]::White
$btnBrowser.FlatStyle = "Flat"
$btnBrowser.Location = New-Object System.Drawing.Point(30, 305)
$btnBrowser.Size = New-Object System.Drawing.Size(460, 45)
$btnBrowser.Add_Click({
    Start-Process "http://localhost:3000"
})
$form.Controls.Add($btnBrowser)

# Footer info
$footer = New-Object System.Windows.Forms.Label
$footer.Text = "Faculty Presentation Credentials:`nTutor: tutor@tms.edu | Student: rahul@student.tms.edu | Parent: mrs.sharma@parent.tms.edu`nPassword for all: password123"
$footer.Font = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Regular)
$footer.ForeColor = [System.Drawing.Color]::FromArgb(148, 163, 184)
$footer.Location = New-Object System.Drawing.Point(30, 370)
$footer.Size = New-Object System.Drawing.Size(460, 50)
$form.Controls.Add($footer)

# Show Form
$form.ShowDialog() | Out-Null
