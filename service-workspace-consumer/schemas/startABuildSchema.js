module.exports = {
  type: "object",
  required: ["jobToRun", "workspace", "tenants", "clientName", "ciTool"],
  properties: {
    jobToRun: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    workspace: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    tenants: {
      type: "array",
    },
    clientName: {
      type: "string",
    },
    ciTool: {
      type: "string",
    },
  },
};
