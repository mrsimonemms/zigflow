/*
 * Copyright 2025 - 2026 Zigflow authors <https://github.com/mrsimonemms/zigflow/graphs/contributors>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require("express");

const app = express();

let count = {};

app.get("/:reportId/status", (req, res) => {
  const { reportId } = req.params;
  let reportStatus = "not ready";

  if (!Object.hasOwn(count, reportId)) {
    count[reportId] = 0;
  }

  count[reportId]++;

  if (count[reportId] >= 2) {
    reportStatus = "report.status.available";
    count[reportId] = 0;
  }

  console.log({
    hello: "world",
    reportId,
    count,
    reportStatus,
  });

  res.json({
    hello: "world",
    reportId,
    count,
    reportStatus,
  });
});

app.listen(9998, () => {
  console.log("listening");
});
