---
sidebar_position: 2
---
# Call

The Call task allows you to make calls to external services.

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| call | `string` | `yes` | The name of the function to call. |
| with | `map` | `no` | A name/value mapping of the parameters to call the function with |

## HTTP

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
