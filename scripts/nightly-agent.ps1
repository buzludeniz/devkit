param(
  [int]$Target = 10,
  [string]$Model = "opencode/deepseek-v4.1-flash-free",
  [switch]$NoPush,
  [switch]$SkipTests
)

$ErrorActionPreference = "Continue"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$LogDir = Join-Path $RepoRoot ".nightly\logs"
$RunDir = Join-Path $RepoRoot ".nightly\runs"
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
New-Item -ItemType Directory -Path $RunDir -Force | Out-Null

$Stamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$Date = Get-Date -Format "yyyy-MM-dd"
$LogFile = Join-Path $LogDir "$Stamp.log"
$AgentLog = Join-Path $LogDir "$Stamp-agent.txt"
$PlannerLog = Join-Path $LogDir "$Stamp-planner.txt"
$VerifyLog = Join-Path $LogDir "$Stamp-verify.txt"
$Branch = "nightly/agent-$Date"
$RepoSlug = "buzludeniz/devkit"
$StatusPath = Join-Path $RunDir "$Stamp.json"

function Write-Log([string]$Message) {
  $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Message
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding utf8
}

function Write-Status([string]$State, [string]$Detail, [int]$Commits, [string]$PrUrl) {
  $status = [ordered]@{
    date      = (Get-Date).ToString("o")
    state     = $State
    detail    = $Detail
    branch    = $Branch
    target    = $Target
    commits   = $Commits
    pr        = $PrUrl
    model     = $Model
    log       = $LogFile
  }
  $status | ConvertTo-Json -Depth 4 | Set-Content -Path $StatusPath -Encoding utf8
}

function Stop-Run([string]$Message, [int]$Commits = 0) {
  Write-Log "FAILED: $Message"
  Write-Status "failed" $Message $Commits ""
  & git checkout main 2>&1 | Out-Null
  exit 1
}

function Invoke-OpenCode([string]$Label, [string]$PromptFile, [string]$Message, [string]$OutFile) {
  Write-Log "Running $Label"
  $output = & opencode run --standalone --auto --model $Model --title "DevKit $Label $Date" --file $PromptFile $Message 2>&1
  $code = $LASTEXITCODE
  $output | Out-File -FilePath $OutFile -Encoding utf8
  $output | Select-Object -Last 40 | ForEach-Object { Write-Host $_ }
  return $code
}

function Get-ReadyCount {
  $files = Get-ChildItem -Path (Join-Path $RepoRoot "backlog") -Filter "*.md" -ErrorAction SilentlyContinue
  if (-not $files) { return 0 }
  $matches = Select-String -Path $files.FullName -Pattern "^status:\s*ready\s*$" -List
  return @($matches).Count
}

function Get-GitHubHeaders {
  $credential = "protocol=https`nhost=github.com`n" | git credential fill
  $token = ($credential | Select-String "^password=(.+)$").Matches.Groups[1].Value
  if (-not $token) {
    throw "No GitHub credential found in the Windows credential store."
  }
  return @{
    Authorization          = "Bearer $token"
    Accept                 = "application/vnd.github+json"
    "User-Agent"           = "devkit-nightly-agent"
    "X-GitHub-Api-Version" = "2022-11-28"
  }
}

Write-Log "Starting DevKit nightly agent. Target: $Target, model: $Model"

$dirty = & git status --porcelain
if ($dirty) {
  Stop-Run "Working tree is dirty before the run. Commit or discard changes first."
}

& git fetch origin --prune 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Stop-Run "git fetch failed" }

& git checkout main 2>&1 | Out-Null
& git pull --ff-only origin main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Stop-Run "Could not fast-forward main" }

& git branch -D $Branch 2>&1 | Out-Null
& git checkout -b $Branch 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Stop-Run "Could not create $Branch" }

$ready = Get-ReadyCount
Write-Log "Ready backlog items: $ready"

if ($ready -lt $Target) {
  Write-Log "Planning pass needed: $ready ready, $Target required."
  $plannerArguments = "Plan new work items. Follow the attached planner prompt exactly. Do not implement anything and do not commit. Leave the backlog files untracked."
  $plannerExit = Invoke-OpenCode "planner" ".nightly\PLANNER_PROMPT.md" $plannerArguments $PlannerLog
  $ready = Get-ReadyCount
  Write-Log "Ready backlog items after planning: $ready (planner exit $plannerExit)"
}

if ($ready -lt $Target) {
  Stop-Run "Only $ready ready backlog items; need $Target."
}

$agentArguments = "Execute the nightly work order in the attached prompt. Complete exactly $Target backlog items, one commit per item. Include any untracked backlog files in your first commit. Do not push. Do not switch branches. Stop after $Target work commits."

$agentExit = Invoke-OpenCode "agent" ".nightly\AGENT_PROMPT.md" $agentArguments $AgentLog
Write-Log "Agent finished with exit code $agentExit"

$dirtyAfter = & git status --porcelain
if ($dirtyAfter) {
  Stop-Run "Agent left uncommitted changes. Inspect $Branch and the agent log."
}

$commits = [int](& git rev-list --count "main..HEAD")
Write-Log "Commits on branch: $commits"

Write-Log "Verifying work commits"
& pnpm exec tsx scripts/nightly-verify.ts --target $Target --base main 2>&1 |
  Tee-Object -FilePath $VerifyLog |
  ForEach-Object { Write-Host $_ }
$verifyExit = $LASTEXITCODE
if ($verifyExit -ne 0) {
  Stop-Run "Verification rejected the run. See $VerifyLog." $commits
}

if (-not $SkipTests) {
  Write-Log "Running lint"
  & pnpm lint 2>&1 | Tee-Object -FilePath (Join-Path $LogDir "$Stamp-lint.txt") | Select-Object -Last 5
  if ($LASTEXITCODE -ne 0) { Stop-Run "pnpm lint failed." $commits }

  Write-Log "Running typecheck"
  & pnpm typecheck 2>&1 | Tee-Object -FilePath (Join-Path $LogDir "$Stamp-typecheck.txt") | Select-Object -Last 10
  if ($LASTEXITCODE -ne 0) { Stop-Run "pnpm typecheck failed." $commits }

  Write-Log "Running full test suite"
  & pnpm test 2>&1 | Tee-Object -FilePath (Join-Path $LogDir "$Stamp-test.txt") | Select-Object -Last 15
  if ($LASTEXITCODE -ne 0) { Stop-Run "pnpm test failed." $commits }
}

$prUrl = ""

if (-not $NoPush) {
  Write-Log "Pushing $Branch"
  $remoteBranch = & git ls-remote --heads origin $Branch
  if ($remoteBranch) {
    & git fetch origin $Branch 2>&1 | Out-Null
    & git push --force-with-lease origin $Branch 2>&1 | Out-Null
  }
  else {
    & git push -u origin $Branch 2>&1 | Out-Null
  }
  if ($LASTEXITCODE -ne 0) { Stop-Run "git push failed." $commits }

  Write-Log "Opening or updating the pull request"
  try {
    $headers = Get-GitHubHeaders
    $bodyLines = & git log --pretty=format:"- %h %s" "main..HEAD"
    $body = @"
## Nightly agent run $Date

$Target verified work commits, each containing source, tests, and documentation.

$($bodyLines -join "`n")

Generated by ``scripts/nightly-agent.ps1`` with ``$Model``.
"@

    $open = Invoke-RestMethod -Method Get -Headers $headers `
      -Uri "https://api.github.com/repos/$RepoSlug/pulls?state=open&head=buzludeniz:$Branch"
    $payload = @{ title = "chore(nightly): agent work $Date"; head = $Branch; base = "main"; body = $body } |
      ConvertTo-Json -Depth 4

    if (@($open).Count -gt 0) {
      $number = @($open)[0].number
      $updated = Invoke-RestMethod -Method Patch -Headers $headers `
        -Uri "https://api.github.com/repos/$RepoSlug/pulls/$number" -Body $payload
      $prUrl = $updated.html_url
    }
    else {
      $created = Invoke-RestMethod -Method Post -Headers $headers `
        -Uri "https://api.github.com/repos/$RepoSlug/pulls" -Body $payload
      $prUrl = $created.html_url
    }
    Write-Log "Pull request: $prUrl"
  }
  catch {
    Stop-Run "Pull request creation failed: $($_.Exception.Message)" $commits
  }
}

Write-Status "success" "Nightly run completed." $commits $prUrl
& git checkout main 2>&1 | Out-Null

$notify = Join-Path $RepoRoot "scripts\agent-notify.mjs"
if (Test-Path $notify) {
  $message = "Nightly agent completed $Target work commits on $Branch. $prUrl"
  & node $notify "devkit - nightly $Date" $message 2>&1 | Out-Null
}

Write-Log "Done. $commits commits, PR: $prUrl"
exit 0
