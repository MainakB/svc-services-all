module.exports = {
  type: "object",
  required: [
    "startDate",
    "endDate",
    "tenantList",
    "jobStatusFilter",
    "onlyNotRun",
    "workspace_name",
    "ciTool",
    "team",
  ],
  properties: {
    startDate: {
      type: "string",
    },
    endDate: {
      type: "string",
    },
    tenantList: {
      type: "array",
      items: {
        type: "string",
      },
    },
    jobStatusFilter: {
      type: "array",
      items: {
        type: "string",
      },
    },
    onlyNotRun: {
      type: "boolean",
    },
    workspace_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
    team: {
      type: "string",
    },
    ciTool: {
      type: "string",
    },
  },
};
