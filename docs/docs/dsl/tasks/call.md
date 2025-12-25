# Call

The Call task allows you to make calls to external services.

## Properties

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| call | `string` | `yes` | The name of the function to call. One of `activity` or `http`. |
| with | `map` | `no` | A name/value mapping of the parameters to call the function with |

## Activity

Call an external [Temporal activity](https://docs.temporal.io/activities) running
on a separate [Task Queue](https://docs.temporal.io/task-queue#task-queue) within
the same namespace.

To use this, the `call` property must equal `activity`.

### Properties {#activity-properties}

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| name | `string` | `yes` | The activity name to call. |
| arguments | `string` | `any[]` | The arguments to pass to the activity. These are interpolated through the state. |
| taskQueue | `string` | `yes` | The task queue where the activity is running. |

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

## gRPC

Call an external resource via gRPC. To use this, the `call` property must equal
`grpc`.

### Properties {#grpc-properties}

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| proto.endpoint | `string` | `yes` | The proto resource that describes the gRPC service to call.. |
| service.name | `string` | `yes` | The name of the gRPC service to call. |
| service.host | `string` | `yes` | The hostname of the gRPC service to call. |
| service.port | `integer` | `no` | The port number of the gRPC service to call. |
| method | `string` | `yes` | The name of the gRPC service method to call. |
| arguments | `map` | `no` | A name/value mapping of the method call's arguments, if any. |

### Example {#grpc-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: external-activity-call
  version: 0.0.1
do:
  - greet:
      call: grpc
      with:
        proto:
          endpoint: file:///go/app/examples/external-calls/grpc/basic/proto/basic/v1/basic.proto
        service:
          name: providers.v1.BasicService
          host: grpc
          port: 3000
        method: Command1
        arguments:
          input: hello world
```

## HTTP

Call an external resource via HTTP. To use this, the `call` property must equal
`http`.

### Properties {#http-properties}

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
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
