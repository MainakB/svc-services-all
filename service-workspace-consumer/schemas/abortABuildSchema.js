module.exports = {
  type: "object",
  required: ["url", "buildId", "workspace", "team", "ciTool"],
  properties: {
    url: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    workspace: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    buildId: {
      type: "string",
    },
    team: {
      type: "string",
    },
    ciTool: {
      type: "string",
    },
  },
};
