---
sidebar_position: 4
---

# Data and Expressions

## What you will learn

- How data flows through a Zigflow workflow
- The expression syntax
- Available variables
- Built-in functions
- How `set`, `output.as` and `export.as` interact

---

## Expressions

Zigflow uses a jq-style expression syntax wrapped in `${ }`.

```yaml
message: ${ $input.name }
```

The expression inside `${ }` is evaluated as a jq filter against the current
input. The result replaces the expression value.

Expressions can appear in most YAML values: task properties, output
transformations, conditions and export statements.

Bare strings are treated as literal values:

```yaml
message: hello  # literal string "hello"
```

Expressions with string interpolation require quotes:

```yaml
endpoint: ${ "https://api.example.com/users/" + ($data.userId | tostring) }
```

---

## Variables

| Variable | Description |
| --- | --- |
| `$input` | The workflow's input data, as passed by the client |
| `$context` | The accumulated context from previous `export` calls |
| `$data` | The data stored by previous `set` tasks |
| `$env` | Environment variables available to the worker |
| `$output` | The output of the most recent task |

### `$input`

The data passed in when the workflow execution was started. It is set once
and does not change.

```yaml
- greet:
    set:
      name: ${ $input.userName }
```

### `$data`

Data stored by `set` tasks. Each `set` task merges its keys into `$data`.
Values persist for the remainder of the workflow.

```yaml
- captureId:
    set:
      userId: ${ $input.userId }
- callApi:
    call: http
    with:
      method: get
      endpoint: ${ "https://api.example.com/users/" + ($data.userId | tostring) }
```

### `$context`

The accumulated context built up by `export` statements. Use it to carry
structured data forward without polluting `$data`.

```yaml
- step1:
    export:
      as: ${ $context + { step1Result: . } }
    set:
      foo: bar
```

### `$env`

Environment variables available to the worker process. Variables prefixed
with `ZIGGY_` (default prefix) are loaded from the environment and accessible
without the prefix.

```yaml
- readConfig:
    set:
      apiUrl: ${ $env.API_BASE_URL }
```

Set `--env-prefix` to change the prefix (default is `ZIGGY`).

### `$output`

The output of the most recently completed task. Use it to chain task results
without storing them explicitly.

---

## Built-in functions

These functions are available inside `${ }` expressions:

| Function | Returns | Notes |
| --- | --- | --- |
| `uuid` | Random UUID v4 | Must be used inside a `set` task for determinism |
| `timestamp` | Unix timestamp (integer) | Must be used inside a `set` task for determinism |
| `timestamp_iso8601` | ISO 8601 timestamp string | Must be used inside a `set` task for determinism |

### Why must generated values be in a `set` task?

Temporal replays workflow history. If you generate a UUID inside an HTTP
call body, a different UUID is generated on replay. Temporal detects this
as non-determinism and raises an error.

The `set` task wraps generated values in a Temporal side-effect, which
records the value in the history so it is stable across replays.

```yaml
# Bad: UUID differs on replay
- callApi:
    call: http
    with:
      method: post
      body:
        requestId: ${ uuid }  # Different value on replay

# Good: UUID is stable across replays
- generateId:
    set:
      requestId: ${ uuid }
- callApi:
    call: http
    with:
      method: post
      body:
        requestId: ${ $data.requestId }
```

---

## Output and export

Two properties control what a task passes forward:

### `output.as`

Transforms the task's output before it is passed to the next task. The
expression is evaluated against the raw task output.

```yaml
- getUser:
    call: http
    output:
      as:
        userId: ${ .id }
        name: ${ .name }
    with:
      method: get
      endpoint: https://api.example.com/users/1
```

### `export.as`

Saves the task's (optionally transformed) output into `$context`. This is
how you accumulate data across multiple tasks.

```yaml
- step1:
    export:
      as: ${ $context + { result: . } }
    set:
      value: 42
```

### Combining them

`output.as` runs first, then `export.as` runs against the transformed output.

---

## Workflow metadata in expressions

:::tip
For the full list of metadata fields, see the [DSL reference](../dsl/intro).
:::

Inside workflow execution, metadata is accessible via `$data.workflow` and
`$data.activity`:

```yaml
- logAttempt:
    set:
      attempt: ${ $data.workflow.attempt }
      workflowId: ${ $data.workflow.workflow_execution_id }
```

---

## Common mistakes

**Using `uuid` or `timestamp` outside a `set` task.**
This causes a Non-Determinism Error on workflow replay. Always generate
values in a `set` task and reference them via `$data`.

**Accessing `$data.key` before the `set` task that defines it.**
`$data` keys are only available after the `set` task that created them has
run. Access them in a later task.

**Confusing `$output` with `$data`.**
`$output` is the output of the last task only. `$data` accumulates across
`set` tasks.

---

## Related pages

- [Set task](../dsl/tasks/set) — storing data
- [DSL reference](../dsl/intro) — full expression context
- [How Zigflow runs](how-zigflow-runs) — determinism and replay
