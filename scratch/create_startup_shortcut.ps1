$sf = [Environment]::GetFolderPath('Startup')
$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut("$sf\Kidilam POS.lnk")
$sc.TargetPath = "wscript.exe"
$sc.Arguments = """C:\Users\dell\Documents\kidilam\startup_kidilam.vbs"""
$sc.WorkingDirectory = "C:\Users\dell\Documents\kidilam"
$sc.Description = "Kidilam POS Auto Startup"
$sc.Save()
Write-Host "Startup shortcut created in: $sf"
