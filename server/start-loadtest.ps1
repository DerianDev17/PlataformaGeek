$env:LOAD_TEST = 'true'
Write-Output "LOAD_TEST=$env:LOAD_TEST"
npx tsx src/index.ts
