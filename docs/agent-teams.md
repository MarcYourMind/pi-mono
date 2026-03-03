# Agent Team Extension

The `agent-team.ts` extension transforms the primary Pi agent into a **Dispatcher-only orchestrator**. Instead of performing tasks directly, the primary agent identifies the best specialist for a given sub-task and delegates it via the `dispatch_agent` tool.

## Key Features

- **Specialist Agents**: Specialist agents are defined using Markdown files with frontmatter. Each agent has its own system prompt, tools, and persistent memory.
- **Team Management**: Organize specialist agents into teams for different types of work (e.g., frontend, backend, security).
- **Grid Dashboard**: A visual dashboard displays the status, current task, progress, and context usage for all agents in the active team.
- **Persistent Sessions**: Each specialist agent maintains its own session, allowing for cross-invocation memory and context awareness.

## Setup

### 1. Define Specialist Agents
Specialist agents are loaded from the following directories (relative to the repository root):
- `agents/*.md`
- `.claude/agents/*.md`
- `.pi/agents/*.md`

Each agent file must have a frontmatter section:

```markdown
---
name: Scout
description: Explores the codebase and gathers information.
tools: read,grep,find,ls
---
You are an expert scout. Your task is to explore the codebase...
```

### 2. Configure Teams
Define teams in `.pi/agents/teams.yaml`. If no teams are defined, a default "all" team containing all loaded agents will be created.

```yaml
frontend:
  - UI Builder
  - CSS Stylist
backend:
  - API Scout
  - Database Architect
```

## How to Use

### Commands
Use these commands to manage your agent teams during a session:

- `/agents-team`: Opens a selection dialog to switch the active team.
- `/agents-list`: Lists all loaded agents and their current status.
- `/agents-grid <N>`: Adjusts the number of columns in the grid dashboard (default is 2).

### The Dispatcher Workflow
1.  **Start a session**: When you start a Pi session with this extension, the primary agent becomes a dispatcher.
2.  **Request a task**: Ask the dispatcher to perform a complex task.
3.  **Automatic delegation**: The dispatcher analyzes the request, selects the appropriate agent(s) from the active team, and uses the `dispatch_agent` tool to delegate work.
4.  **Specialist execution**: The specialist agent executes its sub-task, and the result is returned to the dispatcher.
5.  **Review and continue**: The dispatcher reviews the result and either proceeds with the next sub-task or requests refinements from the user or another agent.

## Dashboard Overview
The grid dashboard provides real-time information about your agent team:
- **Status Icons**:
    - ○ (Idle)
    - ● (Running)
    - ✓ (Done)
    - ✗ (Error)
- **Timer**: Shows how long an agent has been running or took to complete.
- **Context Bar**: Displays the percentage of the agent's context window currently in use.
- **Last Work**: Displays the last few lines of output or the agent's current task description.
