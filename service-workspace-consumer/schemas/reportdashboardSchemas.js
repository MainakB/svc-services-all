module.exports = {
  appversion: {
    body: {
      type: "object",
      required: [
        // 'start_date',
        // 'end_date',
        "tenant_list",
        "workspace_name",
        "client_name",
      ],
      properties: {
        start_date: {
          type: "string",
        },
        end_date: {
          type: "string",
        },
        tenant_list: {
          type: "array",
          items: {
            type: "string",
          },
        },
        workspace_name: {
          type: "string",
          format: "uri",
          pattern: "^https?://",
        },
        client_name: {
          type: "string",
        },
      },
    },
  },
  appbuild: {
    body: {
      type: "object",
      required: [
        "start_date",
        "end_date",
        "tenant_list",
        "workspace_name",
        "client_name",
      ],
      properties: {
        start_date: {
          type: "string",
        },
        end_date: {
          type: "string",
        },
        tenant_list: {
          type: "array",
          items: {
            type: "string",
          },
        },
        workspace_name: {
          type: "string",
          format: "uri",
          pattern: "^https?://",
        },
        client_name: {
          type: "string",
        },
      },
    },
  },
  dashboardStatsOverview: {
    type: "object",
    required: ["workspace_name", "team", "start_date", "end_date", "statname"],
    properties: {
      workspace_name: {
        type: "string",
        format: "uri",
        pattern: "^https?://",
      },
      team: {
        type: "string",
      },
      start_date: {
        type: "string",
      },
      end_date: {
        type: "string",
      },
      statname: {
        type: "string",
        enum: ["stalejobs", "avgpassfail", "maxbuildtime", "avgduration"],
      },
    },
  },
};
