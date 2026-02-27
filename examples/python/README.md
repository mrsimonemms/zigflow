# Python

The [basic example](../basic/), but in Python

<!-- toc -->

* [Getting started](#getting-started)
* [Diagram](#diagram)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

```sh
uv sync
uv run python main.py
```

`uv sync` creates a local virtual environment (by default at `.venv/`) and
installs the dependencies declared in `pyproject.toml`. `uv run python main.py`
runs the script inside that environment, triggering the workflow with some
input data and printing everything to the console.

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    basic_python__start([Start])
    basic_python__end([End])
    basic_python_baseData["SET (baseData)"]
    basic_python__start --> basic_python_baseData
    basic_python_wait["WAIT (wait)"]
    basic_python_baseData --> basic_python_wait
    basic_python_getUser["CALL_HTTP (getUser)"]
    basic_python_wait --> basic_python_getUser
    basic_python_raiseAlarm["FORK (raiseAlarm)"]
    basic_python_raiseAlarm__join((" "))
    subgraph fork_basic_python_callNurse["callNurse"]
        direction TB
        basic_python_callNurse__start([ ])
        basic_python_callNurse__end([ ])
        basic_python_callNurse__start --> basic_python_callNurse__end
    end
    basic_python_raiseAlarm --> basic_python_callNurse__start
    basic_python_callNurse__end --> basic_python_raiseAlarm__join
    subgraph fork_basic_python_multiStep["multiStep"]
        direction TB
        basic_python_multiStep__start([ ])
        basic_python_multiStep__end([ ])
        basic_python_multiStep_wait1["WAIT (wait1)"]
        basic_python_multiStep__start --> basic_python_multiStep_wait1
        basic_python_multiStep_wait2["WAIT (wait2)"]
        basic_python_multiStep_wait1 --> basic_python_multiStep_wait2
        basic_python_multiStep_wait2 --> basic_python_multiStep__end
    end
    basic_python_raiseAlarm --> basic_python_multiStep__start
    basic_python_multiStep__end --> basic_python_raiseAlarm__join
    subgraph fork_basic_python_callDoctor["callDoctor"]
        direction TB
        basic_python_callDoctor__start([ ])
        basic_python_callDoctor__end([ ])
        basic_python_callDoctor__start --> basic_python_callDoctor__end
    end
    basic_python_raiseAlarm --> basic_python_callDoctor__start
    basic_python_callDoctor__end --> basic_python_raiseAlarm__join
    basic_python_getUser --> basic_python_raiseAlarm
    basic_python_raiseAlarm__join --> basic_python__end
```
<!-- ZIGFLOW_GRAPH_END -->
