module.exports = {
  type: "object",
  required: ["api_url", "tenant_name", "browser_name", "type", "team"],
  properties: {
    api_url: {
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
    app_version: {
      type: ["string"],
    },
    browser_name: {
      type: ["string", "null"],
    },
  },
};
