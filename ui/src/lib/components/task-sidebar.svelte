<!--
  ~ Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~     http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
-->

<script lang="ts">
  // https://svelteflow.dev/examples/interaction/drag-and-drop

  const tasks = {
    set: {
      label: 'Set',
      description: 'Set variables and data',
      color: '#3b82f6',
      icon: '=',
    },
    call: {
      label: 'Call',
      description: 'Call external services (HTTP, gRPC, OpenAPI, etc.)',
      color: '#8b5cf6',
      icon: '📞',
    },
  };

  function onDragStart(event: DragEvent, nodeType: string) {
    console.log({
      event,
      nodeType,
    });
  }
</script>

<aside class="menu m-4">
  <p class="menu-label">Tasks</p>
  <ul class="menu-list">
    {#each Object.entries(tasks).sort() as [key, task] (key)}
      <li class="mb-3">
        <button
          style="border-left: 3px solid {task.color}"
          class="button"
          ondragstart={(event) => onDragStart(event, key)}
          draggable={true}
        >
          <div class="task-wrapper is-flex is-align-items-center">
            <div
              class="task-icon is-flex is-align-items-center is-justify-content-center is-flex-shrink-0 has-text-white"
              style="background-color: {task.color}"
            >
              {task.icon}
            </div>

            <div
              class="task-info is-flex is-flex-direction-column has-text-weight-normal"
            >
              <div class="task-title is-size-6">
                {task.label}
              </div>
              <div class="task-description is-size-7 has-text-weight-light">
                {task.description}
              </div>
            </div>
          </div>
        </button>
      </li>
    {/each}
  </ul>
</aside>

<style lang="scss" scoped>
  .button {
    cursor: grab;

    .task-wrapper {
      gap: 12px;

      .task-icon {
        width: 36px;
        height: 36px;
        border: {
          radius: 6px;
        }
        font: {
          size: 18px;
        }
      }

      .task-info {
        overflow: hidden;

        .task-description {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
