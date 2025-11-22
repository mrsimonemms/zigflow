---
sidebar_position: 6
---
# Listen

Provides a mechanism for workflows to await and react to external events, enabling
event-driven behavior within workflow systems. In Temporal, there are
[three methods](https://docs.temporal.io/handling-messages#writing-signal-handlers)
that can be used:

* [Query](#query)
* [Signal](#signal)
* [Update](#update)

## Properties {#listen-properties}

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| listen.to | [`eventConsumptionStrategy`](#event-consumption-strategy) | `yes` | Configures the [event(s)](https://cloudevents.io/) the workflow must listen to. |

### Event Consumption Strategy

Represents the configuration of an event consumption strategy.

#### Properties {#event-consumption-strategy-properties}

| Property | Type | Required | Description |
|----------|:----:|:--------:|-------------|
| all | [`eventFilter[]`](#event-filter) | `no` | Configures the workflow to wait for all defined events before resuming execution.<br />*Required if `any` and `one` have not been set.* |
| any | [`eventFilter[]`](#event-filter) | `no` | Configures the workflow to wait for any of the defined events before resuming execution.<br />*Required if `all` and `one` have not been set.*<br />*If empty, listens to all incoming events* |
| one | [`eventFilter`](#event-filter) | `no` | Configures the workflow to wait for the defined event before resuming execution.<br />*Required if `all` and `any` have not been set.* |

### Event Filter

An event filter is a mechanism used to selectively process or handle events based
on predefined criteria, such as event type, source, or specific attributes.

#### Properties {#event-filter-properties}

| Property | Type | Required | Description |
|----------|:----:|:--------:|-------------|
| with | [`eventProperties`](#event-properties) | `yes` | A name/value mapping of the attributes filtered events must define. Supports both regular expressions and runtime expressions. |

### Event Properties

An event object typically includes details such as the event type, source, timestamp,
 and unique identifier along with any relevant data payload. The
 [Cloud Events specification](https://cloudevents.io/), favoured by Serverless
  Workflow, standardizes this structure to ensure interoperability across different
  systems and services.

#### Properties {#event-properties-properties}

| Property | Type | Required | Description |
|----------|:----:|:--------:|-------------|
| id | `string` | `yes` | This is the name of the Temporal event |
| type | `string` | `yes` | Describes the type of event related to the originating occurrence - either `query`, `signal` or `update`.<br />*Required when emitting an event using `emit.event.with`.* |
| data | `any` | `no` | The event payload. Ignored for `query`. |

## Query

A query is used to perform a read query on a running workflow. This makes no
changes to the workflow and is typically used to return the state, such as
progress

### Example {#query-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: query
  version: 0.0.1
do:
  - queryState:
      listen:
        to:
          one:
            with:
              # ID maps to the query name in Temporal
              id: get_state
              type: query
              # This data will be returned as-is
              data:
                id: ${ .data.id }
                progressPercentage: ${ .data.progressPercentage }
                status: ${ .data.status }
  - createState:
      output:
        as: data
      set:
        id: ${ uuid }
        status: not started
        progress: 0
  - wait:
      wait:
        seconds: 5
  - updateState:
      set:
        progress: 50
        status: running
  - wait:
      wait:
        seconds: 5
  - updateState:
      set:
        progress: 100
        status: finished
```

In this example, the state data will be returned to the query call, with the
`progress` and `status` being updated as the workflow progresses.

## Signal

A signal is used to perform a write query on a running workflow. This receives
no response and is typically used to make fire-and-forget calls to a workflow.

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: signal
  version: 0.0.1
do:
  - approveListener:
      metadata:
        timeout: 10s # Controls the AwaitWithTimeout timeout - defaults to 60s
      listen:
        to:
          one:
            with:
              # ID maps to the signal name in Temporal - this blocks until received
              id: approve
              # Temporal signal - used to make write request
              type: signal
  - outputSignal:
      export:
        as: response
      set:
        # Get the data from the approveListener signal
        signal: ${ .data.approveListener }
  - wait:
      wait:
        seconds: 5
```

The `metadata.timeout` controls the length of time that the timeout waits. If
a signal is received within the time then it's not approved and times out.

### Example {#signal-example}

## Update

An update is used to perform read/writes queries on a running workflow. This
makes a write call, optionally validates the input and then returns a response.

### Example {#update-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: updates
  version: 0.0.1
do:
  - callDoctor:
      metadata:
        timeout: 10s # Controls the AwaitWithTimeout timeout - defaults to 60s
      listen:
        to:
          # Only progress after every update received
          all:
            - with:
                # ID maps to the update name in Temporal
                id: temperature
                # Temporal update - used to make read/write request
                type: update
                data: ${ .data.temperature > 38 }
            - with:
                id: bpm
                type: update
                data: ${ .data.bpm < 60 or .data.bpm > 100 }
  - wait:
      wait:
        seconds: 10
```

As with the [signal](#signal), this has a timeout. This has to receive both a
`temperature` update greater than `38` and a `bpm` update below `60` or above
`100`.
