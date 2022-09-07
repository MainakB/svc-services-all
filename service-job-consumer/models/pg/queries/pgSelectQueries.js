module.exports = {
  Q_FETCH_JOB_BY_NAME: {
    DEF_QUERY:
      "SELECT job_id \
      FROM job_details \
      WHERE job_name=%L \
      AND ci_name=%L \
      AND team_name=%L;",
  },

  Q_FETCH_UPSTREAM_JOB_BY_NAME: {
    DEF_QUERY:
      "SELECT upstream_job_id \
      FROM  upstream_job_details \
      WHERE upstream_job_name=%L \
      AND ci_workspace_id= %L \
      AND ci_name=%L \
      AND client_name=%L;",
  },

  Q_FETCH_DOWNSTREAM_JOB_HISTORY_BY_QUEUEID_DETAILS: {
    DEF_QUERY:
      "SELECT downstream_job_id \
      FROM  build_history_downstream \
      WHERE downstream_job_id=%L \
      AND build_url=%L \
      AND build_number = %L \
      AND workspace_name= %L \
      AND ci_type=%L \
      AND client_name=%L;",
  },
  Q_FETCH_UPSTREAM_JOB_HISTORY_BY_QUEUEID_DETAILS: {
    DEF_QUERY:
      "SELECT upstream_job_id \
      FROM  build_history_upstream \
      WHERE upstream_job_id=%L \
      AND build_url=%L \
      AND build_number = %L \
      AND workspace_name= %L \
      AND ci_type=%L \
      AND client_name=%L;",
  },

  Q_FETCH_BUILD_TIMESTAMP_UPSTREAM: {
    DEF_QUERY:
      "SELECT build_history_id, build_timestamp,created_timestamp \
        FROM build_history_upstream \
        WHERE build_url=%L \
        AND workspace_name= %L \
        AND client_name=%L;",
  },

  Q_FETCH_BUILD_TIMESTAMP_DOWNSTREAM: {
    DEF_QUERY:
      "SELECT build_history_id, build_timestamp,created_timestamp \
        FROM build_history_downstream \
        WHERE build_url=%L \
        AND workspace_name= %L \
        AND client_name=%L;",
  },
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
  Q_FETCH_BUILD_AVERAGES: {
    DEF_QUERY:
      "SELECT  bh.tenant_name,bh.browser_name,jd.team_name,\
    CEIL(AVG( (bh.build_result = 'SUCCESS') + (bh.build_result = 'UNSTABLE')) * 100) AS passed_records,\
    FLOOR(AVG( (bh.build_result = 'FAILURE') ) * 100) AS failed_records, \
    CEIL(AVG(bh.build_duration)/1000) as avg_duration \
    FROM skapa_jobs.job_build_history  bh  \
    JOIN skapa_jobs.job_details jd \
    ON bh.job_id=jd.job_name \
    WHERE bh.tenant_name IN (%L) \
    AND bh.build_result IN ( 'SUCCESS', 'FAILURE', 'UNSTABLE') \
  GROUP BY bh.tenant_name,jd.team_name,bh.browser_name",
  },
};
