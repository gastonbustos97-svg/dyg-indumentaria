$root = 'c:\Users\juanb\Downloads\Nueva carpeta (4)\Nueva carpeta (3)'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8787/')
$listener.Start()
Write-Host 'Server OK on http://localhost:8787'
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  $localPath = $req.Url.LocalPath
  if ($localPath -eq '/') { $localPath = '/index.html' }
  $filePath = Join-Path $root $localPath.TrimStart('/')
  $ext = [System.IO.Path]::GetExtension($filePath)
  $mimeMap = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css'
    '.js'   = 'application/javascript'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.webp' = 'image/webp'
    '.svg'  = 'image/svg+xml'
  }
  if (Test-Path $filePath) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    if ($mimeMap.ContainsKey($ext)) {
      $res.ContentType = $mimeMap[$ext]
    } else {
      $res.ContentType = 'text/plain'
    }
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
  }
  $res.Close()
}
