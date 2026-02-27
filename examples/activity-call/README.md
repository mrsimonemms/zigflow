# Activity Call

Invoke existing Temporal activities directly from the DSL using the `call: activity`
task type.

## Getting started

You need two workers:

1. **DSL worker** – loads the workflow definition and runs the workflow logic.
2. **Activity worker** – registers the concrete activities that the DSL calls on
   the dedicated `activity-call-worker` task queue.

### 1. Start the DSL worker

```sh
task worker NAME=activity-call
```

### 2. Start the activity worker

```sh
cd examples/activity-call
go run ./worker
```

### 3. Start the workflow

With both workers running, trigger the workflow with any input:

```sh
cd examples/activity-call
go run .
```

You should see structured profile data and the generated welcome message in the
output payload.

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    activity_call__start([Start])
    activity_call__end([End])
    activity_call_captureInput["SET (captureInput)"]
    activity_call__start --> activity_call_captureInput
    activity_call_fetchProfile["CALL_ACTIVITY (fetchProfile)"]
    activity_call_captureInput --> activity_call_fetchProfile
    activity_call_generateWelcome["CALL_ACTIVITY (generateWelcome)"]
    activity_call_fetchProfile --> activity_call_generateWelcome
    activity_call_finalize["SET (finalize)"]
    activity_call_generateWelcome --> activity_call_finalize
    activity_call_finalize --> activity_call__end
```
<!-- ZIGFLOW_GRAPH_END -->
