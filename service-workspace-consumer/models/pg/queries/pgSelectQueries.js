module.exports = {
  Q_FETCH_CI_BY_NAME: {
    DEF_QUERY:
      "SELECT ci_tool_name FROM ci_type \
      WHERE ci_tool_name= %L;",
  },

  Q_FETCH_TEAM_BY_NAME: {
    DEF_QUERY:
      "SELECT ci_team_name FROM ci_team \
      WHERE ci_team_name = %L;",
  },

  Q_FETCH_TENANT_BY_NAME: {
    DEF_QUERY:
      "SELECT tenant_name, tenant_key \
        FROM tenant_names \
        WHERE tenant_key=%L;",
  },
};
