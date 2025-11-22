---
sidebar_position: 4
---
# For

Allows workflows to iterate over a collection of items, executing a defined set
of subtasks for each item in the collection. This task type is instrumental in
handling scenarios such as batch processing, data transformation, and repetitive
operations across datasets.

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| for.each | `string` | `no` | The name of the variable used to store the current item being enumerated.<br />Defaults to `item`. |
| for.in | `string` | `yes` | A [runtime expression](intro#runtime-expressions) used to get the collection to enumerate. |
| for.at | `string` | `no` | The name of the variable used to store the index of the current item being enumerated.<br />Defaults to `index`. |
| while | `string` | `no` | A [runtime expression](intro#runtime-expressions) that represents the condition, if any, that must be met for the iteration to continue. |
| do | [`map[string, task]`](intro) | `yes` | The [task(s)](intro) to perform for each item in the collection. These will be run as a [child workflow](https://docs.temporal.io/child-workflows) |

## Example

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow # Mapped to the task queue
  name: for-loop # Workflow name
  version: 0.0.1
do:
  # Iterate over the map object
  - forTaskMap:
      export:
        as: forMap
      for:
        in: ${ .input.map }
      do:
        - setData:
            export:
              as: response
            set:
              key: "${ \"hello: \" + .data.index }"
              value: ${ .data.item }
        - wait:
            wait:
              seconds: 2
  # Iterate over the data array
  - forTaskArray:
      export:
        as: forArray
      for:
        each: item
        in: ${ .input.data }
        at: index
      while: ${ .data.item.userId != 4 } # If this returns false, it will cut the iteration
      do:
        # Each iteration will run these tasks in order
        - setData:
            export:
              as: response
            set:
              userId: ${ .data.item.userId } # Get the userId for this iteration
              id: ${ .data.index } # Get the key
              processed: true
        - wait:
            wait:
              seconds: 1
  - forTaskNumber:
      export:
        as: forNumber
      for:
        in: ${ 5 } # This will iterate 5 times
      do:
        - setData:
            export:
              as: response
            set:
              number: ${ .data.item }
        - wait:
            wait:
              seconds: 1
```
