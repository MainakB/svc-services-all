module.exports = {
  Q_INSERT_MISSING_JOB: {
    DEF_QUERY:
      "INSERT INTO job_details ( \
        job_name, \
          team_name,  \
          job_type, \
          branch_name,  \
          ci_name,  \
          job_owner,  \
          embeddable_url \
        ) \
        VALUES ( %L,%L,%L,%L,%L,%L,%L)",
  },

  Q_INSERT_JOB_BUILD_HISTORY_COMPLETE: {
    DEF_QUERY:
      "INSERT INTO job_build_history ( \
          build_result, \
          build_duration, \
          build_number, \
          job_id,  \
          build_url,  \
          build_timestamp,  \
          tenant_name,  \
          branch_name, \
          app_build_number, \
          app_version, \
          browser_name, \
          build_stages \
        ) \
        VALUES ( %L,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L);",
  },

  Q_INSERT_CI: {
    DEF_QUERY: "INSERT INTO ci_type (ci_tool_name) \
        VALUES (%L);",
  },
  Q_INSERT_TEAMS: {
    DEF_QUERY: "INSERT INTO ci_team (ci_team_name) \
        VALUES %L;",
  },
  Q_INSERT_TENANT: {
    DEF_QUERY:
      "INSERT INTO tenant_names (tenant_name, tenant_key) \
        VALUES %L;",
  },
};
