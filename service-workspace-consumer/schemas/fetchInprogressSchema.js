module.exports = {
  type: "object",
  required: ["type", "job_name", "workspace_name", "team"],
  properties: {
    type: {
      type: "string",
    },
    job_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    workspace_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    team: {
      type: "string",
    },
  },
};
