---
sidebar_position: 10
---
# Switch

Enables conditional branching within workflows, allowing them to dynamically
select different paths based on specified conditions or criteria

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| switch | [`case[]`](#switch-case) | `yes` | A name/value map of the cases to switch on  |

## Example

### Switch Case {#switch-case}

Defines a switch case, encompassing a condition for matching and an associated
action to execute upon a match.

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| when | `string` | `no` | A runtime expression used to determine whether or not the case matches.<br />*If not set, the case will be matched by default if no other case match.*<br />*Note that there can be only one default case, all others **MUST** set a condition.* |
| then | [`flowDirective`](./intro#flow-directive) | `yes` | The flow directive to execute when the case matches. |
