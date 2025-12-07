---
sidebar_position: 2
---
# Call

The Call task allows you to make calls to external services.

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| call | `string` | `yes` | The name of the function to call. One of `activity` or `http`.|
| with | `map` | `no` | A name/value mapping of the parameters to call the function with |

## Activity

Call an external [Temporal activity](https://docs.temporal.io/activities) running
on a separate [Task Queue](https://docs.temporal.io/task-queue#task-queue) within
the same namespace.

To use this, the `call` property must equal `activity`.

### Properties {#activity-properties}

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| name | `string` | `yes` | The activity name to call. |
| arguments | `string` | `any[]` | The arguments to pass to the activity. These are interpolated through the state. |
| options | [`ActivityCallWithOptions`](#activitycallwithoptions-properties) | `no` | Options for external activities. |

#### ActivityCallWithOptions Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| taskQueue | `string` | `yes` | The task queue where the activity is running. |
| scheduleToCloseTimeout | [`duration`](../intro#duration) | `no` | Total time that a workflow is willing to wait for an Activity to complete. |
| scheduleToStartTimeout | [`duration`](../intro#duration) | `no` | Time that the Activity Task can stay in the Task Queue before it is picked up by a Worker. Do not specify this timeout unless using host specific Task Queues for Activity Tasks are being used for routing |
| startToCloseTimeout | [`duration`](../intro#duration) | `no` | Maximum time of a single Activity execution attempt. |
| heartbeatTimeout | [`duration`](../intro#duration) | `no` | Heartbeat interval. |
| waitForCancellation | `bool` | `no` | Whether to wait for canceled activity to be completed. Defaults to `false`. |
| activityId | `string` | `no` | Business level activity ID, this is not needed for most of the cases. |
| retryPolicy | [`RetryPolicy`](#retrypolicy-properties) | `no` | Specifies how to retry an Activity if an error occurs. |
| disableEagerExecution | `bool` | `no` | If `true`, eager execution will not be requested, regardless of worker settings. If `false`, eager execution may still be disabled at the worker level or may not be requested due to lack of available slots. Defaults to `false`. |
| summary | `string` | `no` | Add a summary to the Temporal workflow UI |
| priority | [`ActivityPriority`](#activitypriority-properties) | `no` | |

#### ActivityPriority Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| priorityKey | `number` | `no` | PriorityKey is a positive integer from 1 to n, where smaller integers correspond to higher priorities (tasks run sooner). |
| fairnessKey | `string` | `no` | FairnessKey is a short string that's used as a key for a fairness balancing mechanism  |
| fairnessWeight | `number` | `no` | FairnessWeight for a task can come from multiple sources for flexibility |

#### RetryPolicy Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| initialInterval | [`duration`](../intro#duration) | `no` |  Backoff interval for the first retry. If BackoffCoefficient is 1.0 then it is used for all retries |
| backoffCoefficient | `string` | `no` | Coefficient used to calculate the next retry backoff interval. Default is `2.0` |
| maximumInterval | [`duration`](../intro#duration) | `no` | Maximum backoff interval between retries. |
| maximumAttempts | `string` | `no` | Maximum number of attempts. When exceeded the retries stop even if not expired yet |
| nonRetryableErrorTypes | `string[]` | `no` | Temporal server will stop retry if error type matches this list |

### Example {#activity-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: external-activity-call
  version: 0.0.1
do:
  - captureInput:
      set:
        requestedUserId: ${ .input.userId }
        requestId: ${ uuid }
  - fetchProfile:
      call: activity
      export:
        as: profile
      with:
          name: activitycall.FetchProfile
          arguments:
            - ${ .data.requestedUserId }
            - ${ .data.requestId }
          options:
            taskQueue: activity-call-worker
            startToCloseTimeout:
              seconds: 5
```

## HTTP

Call an external resource via HTTP. To use this, the `call` property must equal
`http`.

### Properties {#http-properties}

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| method | `string` | `yes` | The HTTP request method. |
| endpoint | `string`\|[`endpoint`](https://github.com/serverlessworkflow/specification/blob/main/dsl-reference.md#endpoint) | `yes` | An URI or an object that describes the HTTP endpoint to call. |
| headers | `map` | `no` | A name/value mapping of the HTTP headers to use, if any. |
| body | `any` | `no` | The HTTP request body, if any. |
| query | `map[string, any]` | `no` | A name/value mapping of the query parameters to use, if any. |
| output | `string` | `no` | The http call's output format.<br />*Supported values are:*<br />*- `raw`, which output's the base-64 encoded [http response](https://github.com/serverlessworkflow/specification/blob/main/dsl-reference.md#http-response) content, if any.*<br />*- `content`, which outputs the content of [http response](https://github.com/serverlessworkflow/specification/blob/main/dsl-reference.md#http-response), possibly deserialized.*<br />*- `response`, which outputs the [http response](https://github.com/serverlessworkflow/specification/blob/main/dsl-reference.md#http-response).*<br />*Defaults to `content`.* |
| redirect | `boolean` | `no` | Specifies whether redirection status codes (`300–399`) should be treated as errors.<br />*If set to `false`, runtimes must raise an error for response status codes outside the `200–299` range.*<br />*If set to `true`, they must raise an error for status codes outside the `200–399` range.*<br />*Defaults to `false`.* |

### Example {#http-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: call-http
  version: 0.0.1
do:
  - getUser:
      call: http
      with:
        method: get
        endpoint: https://jsonplaceholder.typicode.com/users/2
```
