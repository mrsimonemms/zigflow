# Heartbeat

:::warning
Each heartbeat is one action. At scale, this may exceed your allocation and cost
extra.

See [Temporal Pricing](https://temporal.io/pricing) for more information.
:::

An Activity Heartbeat is a ping from the Worker that is executing the Activity
to the Temporal Service. Each ping informs the Temporal Service that the Activity
Execution is making progress and the Worker has not crashed.

For more information, see the [Temporal documentation](https://docs.temporal.io/encyclopedia/detecting-activity-failures#activity-heartbeat).

Heartbeats are useful on long-running activities.If a long-running activity fails
early in the process, but the timeout is configured to be much longer, the
Workflow would otherwise need to wait for the full timeout to elapse before
detecting the failure. By using heartbeats, stalled or crashed Activity Executions
can be detected sooner, allowing the Workflow to retry or recover more quickly.

Typically, you should only use a heartbeat for activities that last longer
than a minute. Remember to set your timeout for a time longer than your heartbeat.

Remember to set the [heartbeatTimeout](activity-options/#types-activity-options)
in the Activity Options. If this is not set, heartbeats will be sent, but the
activity will not timeout.

## Location

* Task

## Metadata

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| `heartbeat` | [`duration`](../intro/#duration) | `no` | Heartbeats will be triggered after this time period. |
