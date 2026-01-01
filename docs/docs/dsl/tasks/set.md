# Set

A task used to set data to the workflow's state.

:::warning
A Temporal workflow **MUST** be [deterministic](https://docs.temporal.io/workflow-definition#deterministic-constraints).

You are strongly advised to use the Set task when setting data, especially generated
data (such as `${ uuid }`), rather than invoking it in a task. For example, the
following [CallHTTP](./call#http) task would return a Non-Determinism Error (NDE)
if it was replayed:

```yaml
# Bad ❌
- updateUser:
    call: http
    output:
      as: '${ { response: . } }'
    with:
      method: put
      headers:
        content-type: application/json
      endpoint: https://echo.free.beeceptor.com
      body:
        id: ${ uuid } # This value is different every time this task is run
        hello: world

```

However, as this one generates the UUID in a Set task, [this is wrapped](https://docs.temporal.io/develop/go/side-effects)
in such a way that it's saved to the Temporal state and is safe to replay.

```yaml
- set:
    export:
      as:
        data: ${ . }
    set:
      id: ${ uuid }
- updateUser:
    call: http
    output:
      as: '${ $context + { response: . } }'
    with:
      method: put
      headers:
        content-type: application/json
      endpoint: https://echo.free.beeceptor.com
      body:
        id: ${ $data.id }
        hello: world

```

**With great power comes great responsibility**
:::

## Properties

| Name | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| set | `map` | `yes` | The data to set. |

## Example

The data is saved to a `state` object and can be retrieved in a later task by
calling `${ $data.<key> }`. Once set, it remains in the state and can be overidden
by a later Set task.

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
do:
  - baseData:
      # Set the output to the context
      export:
        as: ${ . }
      set:
        # This value will be overidden later
        progress: 0
        # Set a variable from an envvar
        envvar: ${ $env.EXAMPLE_ENVVAR }
        # Generate a UUID
        uuid: ${ uuid }
        # Insert something from the input
        inputUserId: ${ $input.userId }
        # Maps can be used
        object:
          hello: world
          uuid: ${ uuid }
        # As can arrays
        array:
          - ${ uuid }
          - hello: world
  - updateProgress:
      # Merge this set with the context and output everything together
      output:
        as: ${ $context + . }
      set:
        # Overidden from above. Everything else remains the same
        progress: 100
```
