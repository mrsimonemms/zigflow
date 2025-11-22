---
sidebar_position: 11
---
# Try

Serves as a mechanism within workflows to handle errors gracefully, potentially
retrying failed tasks before proceeding with alternate ones.

## Properties {#try-properties}

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| try | [`map[string, task]`](./intro) | `yes` | The task(s) to perform. This will be run as a [child workflow](https://docs.temporal.io/child-workflows). |
| catch | [`catch`](#catch) | `yes` | Configures the errors to catch and how to handle them. |

## Example

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
do:
  - user:
      export:
        as: user
      try:
        - getUser:
            call: http
            export:
              as: user
            with:
              method: get
              endpoint: https://jsonplaceholder.typicode.com/users/2000
      catch:
        do:
          - setError:
              export:
                as: error
              set:
                message: some error
```

This outputs:

```json
{
  "user": {
    "error": {
      "message": "some error"
    }
  }
}
```

## Definitions

### Catch

Defines the configuration of a catch clause, which a concept used to catch
errors.

#### Properties {#catch-properties}

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| do | [`map[string, task]`](./intro) | `yes` | The definition of the task(s) to run when catching an error. This will be run as a [child workflow](https://docs.temporal.io/child-workflows). |
