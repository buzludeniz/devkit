# Nightly agent

The nightly agent turns a backlog of small engineering items into reviewed pull requests. It runs
on this workstation, not in GitHub Actions, because the agent needs a model session with tool
access and the repository credentials already stored here.

## What runs

`scripts/nightly-agent.ps1` is the orchestrator. A run:

1. Fails fast if the working tree is dirty.
2. Fast-forwards `main` and creates `nightly/agent-<date>`.
3. Runs a diagnostic and planning pass when fewer than the target backlog items are ready.
4. Executes backlog items in an isolated per-item loop with OpenCode and `AGENT_PROMPT.md`.
5. Verifies the branch with `scripts/nightly-verify.ts`.
6. Runs `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
7. Pushes the branch and opens or updates a pull request through the GitHub REST API.

The verifier counts only commits that contain both non-test source under `packages/*/src` or
`scripts/` and a `*.test.ts` file. At least two of those are required (defaults to `-Target 2`,
supporting 2–3 depending on scope). Reports, formatting, and version bumps never count.

## Requirements

- Node.js 20 or newer and pnpm 9.
- An authenticated OpenCode installation (`opencode auth login`).
- A GitHub credential in the Windows Credential Manager for `https://github.com`, with permission to
  push and open pull requests. The runner reads it with `git credential fill` and keeps it in memory.
- The model named in `-Model`, by default `opencode/deepseek-v4.1-flash-free`.

## Run it by hand

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/nightly-agent.ps1
```

Useful switches:

```powershell
# Two items, no push, skip the slow suite while testing the loop
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/nightly-agent.ps1 -Target 2 -NoPush -SkipTests

# A different model
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/nightly-agent.ps1 -Model opencode/glm-5.3-flash-free
```

Every run writes a log to `.nightly/logs/` and a JSON record to `.nightly/runs/`. Both directories
are ignored by git.

## Schedule it

Register the task once, from an elevated PowerShell prompt:

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument '-NoProfile -ExecutionPolicy Bypass -File "C:\Users\ESA\devkit\scripts\nightly-agent.ps1"'
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
  -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 4)
Register-ScheduledTask -TaskName "DevKit Nightly Agent" `
  -Action $action -Trigger $trigger -Settings $settings `
  -Description "Ten verified engineering commits, one pull request, every night." -Force
```

`StartWhenAvailable` runs the task after a missed start, so a sleeping machine catches up when it
wakes. The task runs as the current user and only while that user is signed in, which is what gives
it access to the OpenCode session and the stored git credential.

Check it:

```powershell
Get-ScheduledTask -TaskName "DevKit Nightly Agent" | Get-ScheduledTaskInfo
Start-ScheduledTask -TaskName "DevKit Nightly Agent"
```

Remove it:

```powershell
Unregister-ScheduledTask -TaskName "DevKit Nightly Agent" -Confirm:$false
```

## Backlog format

Each `backlog/NNN-slug.md` file has front matter with `status: ready`, an `area`, acceptance
criteria, a test plan, and the documentation it touches. The agent sorts by id, implements the
lowest ready items, and marks each one `status: done` with a `## Result` section in the same commit.

The planner writes new items when fewer than ten are ready. It is told to propose small,
single-commit improvements and to leave the files untracked so the engineer can commit them with the
first item.

## When a run fails

- **Dirty tree** — commit or discard local changes. The runner will not guess which files are yours.
- **Fewer than ten ready items** — run the planner by hand, or add items. The runner plans once and
  then aborts rather than committing filler.
- **Verification failure** — read `.nightly/logs/<stamp>-verify.txt`. The branch is left in place.
  Inspect it, fix the gaps, and push manually if the work is sound.
- **Test failure** — the branch is not pushed. The log names the failing suite.
- **Pull request failure** — the branch is pushed but no PR exists. Re-run the runner; it updates the
  existing branch and retries the PR.

Delete a failed branch with `git branch -D nightly/agent-<date>` after inspecting it.
