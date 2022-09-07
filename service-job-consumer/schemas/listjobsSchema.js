module.exports = {
  type: "object",
  required: ["workspace_name", "client_name", "ci_tool"],
  properties: {
    workspace_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    client_name: {
      type: "string",
    },
    ci_tool: {
      type: "string",
    },
  },
};
