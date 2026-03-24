---
name: feedback_commit_approval
description: Always explain what changed and why before committing/pushing — user must approve first
type: feedback
---

Always explain what a commit contains and what it does before running git commit/push. Never push directly without telling the user what changed first.

**Why:** User interrupted multiple pushes saying "tell me what changed first" and "always tell whats changed and whats this commit is about"

**How to apply:** Before every git commit+push, summarize the change in plain language and wait for user confirmation.
