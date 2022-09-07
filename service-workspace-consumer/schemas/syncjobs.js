module.exports = {
  type: "object",
  required: ["type", "job_name"],
  properties: {
    type: {
      type: "string",
    },
    job_name: {
      type: "string",
      format: "uri",
      pattern: "^https?://",
    },
  },
};
