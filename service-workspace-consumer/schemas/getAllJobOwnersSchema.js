module.exports = {
  type: "object",
  required: ["workspace_name", "team"],
  properties: {
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
