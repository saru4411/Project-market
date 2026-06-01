$loginBody = @{ email = "buyer@buyeway.com"; password = "password123" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
$headers = @{ Authorization = "Bearer $token" }

$searchBody = @{ text = "silk"; category = "Textiles & Garments"; location = "Gujarat" } | ConvertTo-Json
$searchRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/beckn/search" -Method Post -Body $searchBody -ContentType "application/json" -Headers $headers
$transactionId = $searchRes.context.transaction_id

Write-Output "Transaction ID: $transactionId"
Write-Output "Waiting 2 seconds for simulated supplier callbacks..."
Start-Sleep -Seconds 2

$resultsRes = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/beckn/results?transaction_id=$transactionId&action=search" -Method Get -Headers $headers
$resultsRes | ConvertTo-Json -Depth 5
