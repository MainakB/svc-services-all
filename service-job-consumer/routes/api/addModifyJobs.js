const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const { Validator } = require("express-json-validator-middleware");

const { genericUtils, jobWorkers } = require("../../utils");
const { PG_QUERY_EXECUTORS } = require("../../models/pg/pgDbService");
const { jobCompletedSchema } = require("../../schemas");

const { validate } = new Validator({ useDefaults: true });

router.post(
  "/complete",
  validate({ body: jobCompletedSchema }),
  async (req, res, next) => {
    try {
      const { api_url, tenant_name, app_version, browser_name, type, team } =
        req.body;
      await jobWorkers.addTeamCiTenant({ api_url, team, tenant_name });

      const job_id = await jobWorkers.addJobIfMissingElseUpdate({
        api_url,
        tenant_name,
        team,
        type,
      });

      await jobWorkers.updateBuildHistoryFromComplete({
        api_url,
        tenant_name,
        app_version,
        browser_name,
        team,
        job_id,
        type,
      });

      res.status(200).json({
        api_url,
        tenant_name,
        app_version,
        browser_name,
        type,
        team,
      });
    } catch (err) {
      next(genericUtils.handleException(req, err, 500));
    }
  }
);

router.get("/getBuildAverges", async (req, res, next) => {
  try {
    const result = await jobWorkers.getBuildAverges(["dev", "qa"]);

    res.status(200).json(result);
  } catch (err) {
    next(genericUtils.handleException(req, err, 500));
  }
});

router.get("/getpid", async (req, res, next) => {
  try {
    const os = require("os");
    res.status(200).send(`Pid is : ${os.hostname()}`);
  } catch (err) {
    next(genericUtils.handleException(req, err, 500));
  }
});

router.post("/*", async (req, res) => {
  res.status(404).send("The URL you are trying to reach does not exist.");
});

router.get("/*", async (req, res) => {
  res.status(404).send("The URL you are trying to reach does not exist.");
});

module.exports = router;
