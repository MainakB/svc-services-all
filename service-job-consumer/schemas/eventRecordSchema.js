// const avro = require("avsc");

// const jobInBuilding = avro.Type.forSchema({
//   type: "record",
//   fields: [
//     { name: "api_url", type: "string" },
//     { name: "workspace_name", type: "string" },
//     { name: "tenant_name", type: "string" },
//     { name: "team", type: "string" },
//     { name: "type", type: ["string", "null"] },
//     { name: "retry", type: ["null", "int"], default: null },
//   ],
// });

// const jobCompleted = avro.Type.forSchema({
//   type: "record",
//   fields: [
//     { name: "api_url", type: "string" },
//     { name: "workspace_name", type: "string" },
//     { name: "tenant_name", type: "string" },
//     { name: "apm_version", type: ["string", "null"] },
//     { name: "browser_name", type: ["string", "null"] },
//     { name: "type", type: ["string", "null"] },
//     { name: "team", type: "string" },
//     { name: "operating_system", type: ["string", "null"] },
//     { name: "retry", type: ["null", "int"], default: null },
//   ],
// });

// const syncStuckJob = avro.Type.forSchema({
//   type: "record",
//   fields: [
//     {
//       name: "data",
//       type: {
//         type: "record",
//         fields: [
//           { name: "api_url", type: "string" },
//           { name: "workspace_name", type: "string" },
//           { name: "tenant_name", type: "string" },
//           { name: "apm_version", type: ["string", "null"] },
//           { name: "browser_name", type: ["string", "null"] },
//           { name: "team", type: "string" },
//           { name: "type", type: ["string", "null"] },
//           { name: "operating_system", type: ["string", "null"] },
//         ],
//       },
//     },
//     { name: "value", type: "boolean" },
//     { name: "type", type: "string" },
//     { name: "retry", type: ["null", "int"], default: null },
//   ],
// });

// const deleteJob = avro.Type.forSchema({
//   type: "record",
//   fields: [
//     { name: "id", type: "string" },
//     { name: "job_name", type: "string" },
//     { name: "workspace_name", type: "string" },
//     { name: "team", type: "string" },
//     { name: "ci_tool", type: "string" },
//   ],
// });

// module.exports = {
//   jobInBuilding,
//   jobCompleted,
//   syncStuckJob,
//   deleteJob,
// };
