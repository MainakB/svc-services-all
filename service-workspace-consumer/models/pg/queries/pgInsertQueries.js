module.exports = {
  Q_INSERT_CI: {
    DEF_QUERY:
      "INSERT IGNORE INTO ci_type (ci_tool_name) \
        VALUES (%L);",
  },
  Q_INSERT_TEAMS: {
    DEF_QUERY: "INSERT IGNORE INTO ci_team (ci_team_name) \
        VALUES %L;",
  },
  Q_INSERT_TENANT: {
    DEF_QUERY:
      "INSERT IGNORE INTO tenant_names (tenant_name, tenant_key) \
        VALUES %L;",
  },
  Q_INSERT_RETRY_DATA: {
    DEF_QUERY:
      "INSERT INTO retry_topics ( \
        retry_data, \
        retry_count, \
        topic_name, \
        errored_out, \
        schema_value, \
        error_text \
      ) \
      VALUES (%L,%L,%L,%L,%L,%L);",
  },
};
