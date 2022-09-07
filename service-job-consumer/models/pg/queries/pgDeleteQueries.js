module.exports = {
  Q_DELETE_UPSTREAM_STALE_BUILD: {
    DEF_QUERY:
      "DELETE FROM build_history_upstream \
        WHERE build_history_id=%L;",
  },
  Q_DELETE_DOWNSTREAM_STALE_BUILD: {
    DEF_QUERY:
      "DELETE FROM build_history_downstream \
        WHERE build_history_id=%L;",
  },
};
