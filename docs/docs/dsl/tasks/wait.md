---
sidebar_position: 12
---
# Wait

Allows workflows to pause or delay their execution for a specified period of time.
This converts to a Temporal [Durable Timer](https://docs.temporal.io/workflow-execution/timers-delays).

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| wait | [`duration`](../intro#duration) | `yes` | The amount of time to wait. |

## Example

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
do:
  - wait:
      wait:
        seconds: 5
```
