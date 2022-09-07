module.exports = {
  Q_UPDATE_UPSTREAM_REF_OF_INTERMEDIATE: {
    DEF_QUERY:
      "UPDATE upstream_job_details \
        SET upstream_ref_to_intermediate=%L , \
            upstream_is_intermediate=%L, \
            client_name=%L, \
            ci_workspace_id=%L \
        WHERE upstream_job_name=%L \
        AND ci_name=%L;",
  },
  Q_UPDATE_JOB_ON_COPMPLETE: {
    DEF_QUERY:
      "UPDATE job_details \
        SET branch_name=%L, \
        job_owner=COALESCE(%L, job_owner), \
        team_name=%L, \
        job_type = %L \
        WHERE job_name=%L \
        AND ci_name=%L;",
  },

  Q_UPDATE_HEALTH_REPORT_PNG_LAST_BUILD: {
    DEF_QUERY:
      "UPDATE job_details  \
        SET job_health = %L, \
          job_health_description= %L, \
          last_build_result=%L, \
          last_build_timestamp=%L, \
          last_build_url=%L,\
          last_build_tenant=%L, \
          embeddable_url=%L \
        WHERE job_name = %L \
        AND team_name=%L",
  },

  Q_UPDATE_HEALTH_REPORT_PNG_LAST_BUILD_UPSTREAM: {
    DEF_QUERY:
      "UPDATE upstream_job_details \
        SET job_health = %L, \
        job_health_description= %L, \
        last_build_result=%L, \
        last_build_timestamp=%L, \
        last_build_url=%L, \
        last_build_tenant=%L, \
        embeddable_url=%L \
        WHERE upstream_job_name = %L \
        AND ci_workspace_id = %L \
        AND client_name=%L;",
  },

  Q_UPDATE_DOWNSTREAM_IN_QUEUE_TO_BUILDING: {
    DEF_QUERY:
      "UPDATE build_history_downstream  \
        SET build_result = %L, \
            build_duration= %L, \
            build_number= %L, \
            build_url= %L, \
            build_timestamp= %L, \
            upstream_build_number= %L, \
            tenant_name= %L, \
            branch_name = %L \
        WHERE downstream_job_id = %L \
        AND build_number = %L \
        AND build_url = %L \
        AND ci_workspace_id = %L \
        AND ci_type = %L \
        AND client_name=%L;",
  },

  Q_UPDATE_UPSTREAM_IN_QUEUE_TO_BUILDING: {
    DEF_QUERY:
      "UPDATE build_history_upstream  \
        SET build_result = %L, \
            build_duration= %L, \
            build_number= %L, \
            build_url= %L, \
            build_timestamp= %L, \
            upstream_build_number= %L, \
            tenant_name= %L \
        WHERE upstream_job_id = %L \
        AND build_number = %L \
        AND build_url = %L \
        AND ci_workspace_id = %L \
        AND ci_type = %L \
        AND client_name=%L;",
  },
  Q_UPDATE_BUILD_HISTORY_JOB_UPSTREAM_DANDLING_PROGRESS: {
    DEF_QUERY:
      "UPDATE build_history_upstream \
        SET build_result='ABORTED' \
        WHERE build_url=%L \
        AND workspace_name= %L \
        AND client_name=%L;",
  },
  Q_UPDATE_BUILD_HISTORY_JOB_DOWNSTREAM_DANDLING_PROGRESS: {
    DEF_QUERY:
      "UPDATE build_history_downstream \
        SET build_result='ABORTED' \
        WHERE build_url=%L \
        AND workspace_name= %L \
        AND client_name=%L;",
  },
};
