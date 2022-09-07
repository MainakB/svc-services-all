module.exports = {
    body: {
      type: 'object',
      required: ['job_name', 'workspace_name', 'team', 'ci_tool'],
      properties: {
        job_name: {
          type: 'string',
          format: 'uri',
          pattern: '^https?://',
        },
        workspace_name: {
          type: 'string',
          format: 'uri',
          pattern: '^https?://',
        },
        team: {
          type: 'string',
        },
        ci_tool: {
          type: 'string',
        },
        check_exist:{
          type: "boolean",
        }
      },
    },
    query: {
      type: 'object',
      required: ['job_type'],
      properties: {
        job_type: {
          type: 'string',
          enum: ['upstream', 'downstream'],
        },
      },
    },
  };