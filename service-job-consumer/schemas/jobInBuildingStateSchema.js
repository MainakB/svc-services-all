module.exports = {
  type: "object",
  required: ["api_url", "workspace_name", "tenant_name", "team", "type"],
  properties: {
    api_url: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    workspace_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    tenant_name: {
      type: "string",
    },
    team: {
      type: "string",
    },
    type: {
      type: ["string", "null"],
    },
  },
};
