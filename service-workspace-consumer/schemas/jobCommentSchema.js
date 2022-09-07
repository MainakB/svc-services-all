module.exports = {
  type: "object",
  required: ["downstream_job_name", "workspace_name", "comment", "client_name"],
  properties: {
    downstream_job_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    workspace_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    client_name: {
      type: "string",
    },
    comment: {
      type: "string",
    },
  },
};
