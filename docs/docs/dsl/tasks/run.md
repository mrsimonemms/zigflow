# Run

Provides the capability to run execute external commands

## Properties

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| run.script | [`script`](#script-process) | `no` | The definition of the script to run.<br />*Required if `shell` and `workflow` have not been set.* |
| run.shell | [`shell`](#shell-process) | `no` | The definition of the shell command to run.<br />*Required if `script` and `workflow` have not been set.* |
| run.workflow | [`workflow`](#workflow-process) | `no` | The definition of the workflow to run.<br />*Required if `script` and `shell` have not been set.* |
| await | `boolean` | `no` | Determines whether or not the process to run should be awaited for.<br />*When set to `false`, the task cannot wait for the process to complete and thus cannot output the process’s result.* Only available for workflows.<br />*Defaults to `true`.* |

## Script Process

Enables the execution of custom scripts or code within a workflow, empowering
workflows to perform specialized logic, data processing, or integration tasks by
executing user-defined scripts written in various programming languages.

### Properties {#script-properties}

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| language | `string` | `yes` | The language of the script to run.<br />*Supported values are: [`js` and `python`](#supported-languages).* |
| code | `string` | `yes` | The script's code. |
| arguments | `string[]` | `no` | A list of the arguments, if any, to the script as argv |
| environment | `map` | `no` | A key/value mapping of the environment variables, if any, to use when running the configured script process |

#### Supported languages

:::warning
The [Docker image](https://github.com/mrsimonemms/zigflow/blob/main/Dockerfile)
is built on the [`node:lts-alpine` image](https://hub.docker.com/_/node/) and
installs the [`python3` Alpine package](https://pkgs.alpinelinux.org/package/edge/main/x86/python3).
For specific versions of these languages, build your own image.
:::

This is a list of available languages and the command that is called.

| Language | Binary Target |
| :--- | :--- |
| `js` | `node` |
| `python` | `python` |

### Examples {#script-examples}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
do:
  - nodejs:
      export:
        as: '${ $context + { nodejs: . } }'
      run:
        script:
          language: js
          code: |
            const http = require('http');

            console.log(`${process.argv[2]} from ${process.env.NAME}`);

            console.log(http.STATUS_CODES);
          arguments:
            - Hello
          environment:
            NAME: js
  - python:
      output:
        as: '${ $context + { python: . } }'
      run:
        script:
          language: python
          code: |
            import os
            import sys

            def main():
                arg = sys.argv[1] if len(sys.argv) > 1 else ""

                name = os.getenv("NAME", "")

                print(f"{arg} from {name}")

            if __name__ == "__main__":
                main()
          arguments:
            - Hello
          environment:
            NAME: python
```

## Shell Process

Enables the execution of shell commands within a workflow, enabling workflows to
interact with the underlying operating system and perform system-level operations,
such as file manipulation, environment configuration, or system administration
tasks.

### Properties {#shell-properties}

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| command | `string` | `yes` | The shell command to run |
| arguments | `string[]` | `no` | A list of the arguments, if any, to the shell command as argv |
| environment | `map` | `no` | A key/value mapping of the environment variables, if any, to use when running the configured process |

### Examples {#shell-examples}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
do:
  - runShell:
      output:
        as: '${ $context + { shell: . } }'
      run:
        shell:
          command: ls
          arguments:
            - -la
            - /
```

## Workflow Process

Enables the invocation and execution of [child workflows](https://docs.temporal.io/child-workflows)
from a parent workflow, facilitating modularization, reusability, and abstraction
of complex logic or business processes by encapsulating them into standalone
workflow units.

### Properties {#workflow-properties}

| Name | Type | Required | Description |
| --- | :---: | :---: | --- |
| name | `string` | `yes` | The name of the workflow to run |
| namespace | `string` | `yes` | This is not used and only exists to maintain compatability with the Serverless Workflow schema |
| version | `string` | `yes` | This is not used and only exists to maintain compatability with the Serverless Workflow schema |
| input | `any` | `no` | The data, if any, to pass as input to the workflow to execute. The value should be validated against the target workflow's input schema, if specified |

### Example {#workflow-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
timeout:
  after:
    minutes: 1
do:
  - parentWorkflow:
      do:
        - wait:
            wait:
              seconds: 5
        - callChildWorkflow1:
            run:
              workflow:
                name: child-workflow1
                namespace: default
                version: 0.0.0
        - wait:
            wait:
              seconds: 5
        - callChildWorkflow2:
            run:
              workflow:
                name: child-workflow2
                namespace: default
                version: 0.0.0
  - child-workflow1:
      do:
        - wait:
            wait:
              seconds: 10
  - child-workflow2:
      do:
        - wait:
            wait:
              seconds: 3
```
