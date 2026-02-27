# Authorise Change Request

A flow chart to authorise change requests

<!-- toc -->

* [Getting started](#getting-started)
* [Diagram](#diagram)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

```sh
go run .
```

This will trigger the workflow with some input data and print everything to the
console.

There are two prompts at runtime:

1. Should we approve or reject the change? Approve by default.
1. After how long should the response be sent? 15 seconds by default.

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    authoriseChangeRequest__start([Start])
    authoriseChangeRequest__end([End])
    authoriseChangeRequest_queryState["LISTEN (queryState)"]
    authoriseChangeRequest__start --> authoriseChangeRequest_queryState
    authoriseChangeRequest_stateSetup["SET (stateSetup)"]
    authoriseChangeRequest_queryState --> authoriseChangeRequest_stateSetup
    authoriseChangeRequest_startReview["FORK (startReview) 🏁"]
    authoriseChangeRequest_startReview__join((" "))
    subgraph fork_authoriseChangeRequest_autoApproval["autoApproval"]
        direction TB
        authoriseChangeRequest_autoApproval__start([ ])
        authoriseChangeRequest_autoApproval__end([ ])
        authoriseChangeRequest_autoApproval_timeout["WAIT (timeout)"]
        authoriseChangeRequest_autoApproval__start --> authoriseChangeRequest_autoApproval_timeout
        authoriseChangeRequest_autoApproval_autoApprove["SET (autoApprove)"]
        authoriseChangeRequest_autoApproval_timeout --> authoriseChangeRequest_autoApproval_autoApprove
        authoriseChangeRequest_autoApproval_autoApprove --> authoriseChangeRequest_autoApproval__end
    end
    authoriseChangeRequest_startReview --> authoriseChangeRequest_autoApproval__start
    authoriseChangeRequest_autoApproval__end --> authoriseChangeRequest_startReview__join
    subgraph fork_authoriseChangeRequest_remindReviewer["remindReviewer"]
        direction TB
        authoriseChangeRequest_remindReviewer__start([ ])
        authoriseChangeRequest_remindReviewer__end([ ])
        authoriseChangeRequest_remindReviewer_timeout["WAIT (timeout)"]
        authoriseChangeRequest_remindReviewer__start --> authoriseChangeRequest_remindReviewer_timeout
        authoriseChangeRequest_remindReviewer_notifyReviewer["CALL_HTTP (notifyReviewer)"]
        authoriseChangeRequest_remindReviewer_timeout --> authoriseChangeRequest_remindReviewer_notifyReviewer
        authoriseChangeRequest_remindReviewer_timeout_2["WAIT (timeout)"]
        authoriseChangeRequest_remindReviewer_notifyReviewer --> authoriseChangeRequest_remindReviewer_timeout_2
        authoriseChangeRequest_remindReviewer_timeout_2 --> authoriseChangeRequest_remindReviewer__end
    end
    authoriseChangeRequest_startReview --> authoriseChangeRequest_remindReviewer__start
    authoriseChangeRequest_remindReviewer__end --> authoriseChangeRequest_startReview__join
    subgraph fork_authoriseChangeRequest_waitForApproval["waitForApproval"]
        direction TB
        authoriseChangeRequest_waitForApproval__start([ ])
        authoriseChangeRequest_waitForApproval__end([ ])
        authoriseChangeRequest_waitForApproval_notifyReviewer["CALL_HTTP (notifyReviewer)"]
        authoriseChangeRequest_waitForApproval__start --> authoriseChangeRequest_waitForApproval_notifyReviewer
        authoriseChangeRequest_waitForApproval_review["LISTEN (review)"]
        authoriseChangeRequest_waitForApproval_notifyReviewer --> authoriseChangeRequest_waitForApproval_review
        authoriseChangeRequest_waitForApproval_set["SET (set)"]
        authoriseChangeRequest_waitForApproval_review --> authoriseChangeRequest_waitForApproval_set
        authoriseChangeRequest_waitForApproval_set --> authoriseChangeRequest_waitForApproval__end
    end
    authoriseChangeRequest_startReview --> authoriseChangeRequest_waitForApproval__start
    authoriseChangeRequest_waitForApproval__end --> authoriseChangeRequest_startReview__join
    authoriseChangeRequest_stateSetup --> authoriseChangeRequest_startReview
    authoriseChangeRequest_updateState["SET (updateState)"]
    authoriseChangeRequest_startReview__join --> authoriseChangeRequest_updateState
    authoriseChangeRequest_applyChange["CALL_HTTP (applyChange) [?]"]
    authoriseChangeRequest_updateState --> authoriseChangeRequest_applyChange
    authoriseChangeRequest_notifyResult["CALL_HTTP (notifyResult)"]
    authoriseChangeRequest_applyChange --> authoriseChangeRequest_notifyResult
    authoriseChangeRequest_notifyResult --> authoriseChangeRequest__end
```
<!-- ZIGFLOW_GRAPH_END -->
