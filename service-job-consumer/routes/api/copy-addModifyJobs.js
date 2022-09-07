// const express = require("express");
// const router = express.Router();
// const { v4: uuidv4 } = require("uuid");

// const { Validator } = require("express-json-validator-middleware");

// const { genericUtils, jobWorkers } = require("../../utils");
// const { PG_QUERY_EXECUTORS } = require("../../models/pg/pgDbService");
// const {
//   jobInBuildingStateSchema,
//   jobCompletedSchema,
//   eventRecordSchema,
//   startABuild,
//   abortABuild,
//   jobanalytics,
//   getAllJobOwners,
//   jobcommentschema,
//   fetchInprogressSchema,
//   syncjobs,
//   listjobs,
//   deleteJobSchema,
//   reportdashboardSchemas,
// } = require("../../schemas");

// const { produceEvents } = require("../../kafka/producer");

// const { validate } = new Validator({ useDefaults: true });

// // router.post(
// //   "/listjobs",
// //   validate({ body: listjobs }),
// //   async (req, res, next) => {
// //     try {
// //       const { workspace_name, client_name, ci_tool } = req.body;

// //       const { upstreamJobList, downstreamJobList } =
// //         await jobWorkers.getDownstreamJobsList(
// //           workspace_name,
// //           client_name,
// //           ci_tool
// //         );

// //       res.status(200).json({
// //         upstreamJobs: upstreamJobList,
// //         // intermediateJobs: upstreamJobsList.upstreamIntermediate,
// //         downstreamJobs: downstreamJobList,
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/building",
// //   validate({ body: jobInBuildingStateSchema }),
// //   async (req, res, next) => {
// //     try {
// //       const { api_url, workspace_name, tenant_name, team, type } = req.body;
// //       if (!api_url.toLowerCase().includes(`/job/others/`)) {
// //         const topic_jobinbuilding =
// //           "ged.jenkinsmonitor.insert.addworkspacefromremotecallbuilding";
// //         await res.status(200).json({ result: "CREATED" });
// //         produceEvents(
// //           topic_jobinbuilding,
// //           { api_url, workspace_name, tenant_name, team, type, retry: 0 },
// //           eventRecordSchema.jobInBuilding
// //         );
// //       } else {
// //         await res.status(200).json({ result: "CREATED" });
// //       }
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/start",
// //   validate({ body: startABuild }),
// //   async (req, res, next) => {
// //     try {
// //       const { jobType } = req.query;
// //       let response_to_send = null;
// //       if (jobType.toLowerCase() === "upstream") {
// //         response_to_send = await jobWorkers.startAbuildUpstream(req.body);
// //       } else if (jobType.toLowerCase() === "downstream") {
// //         response_to_send = await jobWorkers.startAbuildDownstream(req.body);
// //       } else {
// //         throw Error(
// //           "Incorrect request parameter in url. Can either be upstream or downstream."
// //         );
// //       }

// //       res.status(201).json(response_to_send);
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post("/abort", validate({ body: abortABuild }), async (req, res) => {
// //   try {
// //     await jobWorkers.abortBuild({
// //       ...req.body,
// //       jobType: req.query.jobType,
// //     });
// //     res.status(201).json({ status: "Created" });
// //   } catch (err) {
// //     next(genericUtils.handleException(req, err, 500));
// //   }
// // });

// // router.post(
// //   "/jobanalytics",
// //   validate({ body: jobanalytics }),
// //   async (req, res, next) => {
// //     const {
// //       startDate,
// //       endDate,
// //       tenantList,
// //       jobStatusFilter,
// //       onlyNotRun,
// //       workspace_name,
// //       ciTool,
// //       team,
// //     } = req.body;
// //     const { limit } = req.query;
// //     const sortData = req.query.sortBy.split(":");
// //     const sortBy = sortData[0];
// //     const sortType = sortData[1].toLowerCase().includes("desc")
// //       ? "DESC"
// //       : "ASC";
// //     // let allDownstreamFilteredJobsNegative = [];
// //     let startDateInUtc = new Date(startDate).valueOf();
// //     let endDateInUtc = new Date(endDate).valueOf();

// //     const tenant_keys_list = await jobWorkers.getTenantKeys(
// //       tenantList,
// //       team,
// //       workspace_name
// //     );
// //     const tenant_keys =
// //       tenant_keys_list !== null
// //         ? tenant_keys_list.tenants.reduce((acc, value) => {
// //             acc.push(value.tenant_key);
// //             return acc;
// //           }, [])
// //         : tenant_keys_list;

// //     try {
// //       let queries = [
// //         jobWorkers.getJobsRunFilteredByTenants(
// //           jobStatusFilter,
// //           startDateInUtc,
// //           endDateInUtc,
// //           tenant_keys,
// //           sortBy,
// //           sortType,
// //           limit,
// //           workspace_name,
// //           ciTool,
// //           team
// //         ),
// //       ];
// //       if (onlyNotRun) {
// //         queries.push(
// //           jobWorkers.getJobsNotRunFilteredByTenants(
// //             jobStatusFilter,
// //             startDateInUtc,
// //             endDateInUtc,
// //             tenant_keys,
// //             team,
// //             workspace_name,
// //             ciTool
// //           )
// //         );
// //       }

// //       const results = await Promise.all(queries);
// //       const consolidatedJobsList =
// //         results.length === 2
// //           ? [...results[0].rows, ...results[1].rows]
// //           : [...results[0].rows];

// //       res.status(201).json({
// //         result: {
// //           jobsList: consolidatedJobsList,
// //         },
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/jobowners",
// //   validate({ body: getAllJobOwners }),
// //   async (req, res, next) => {
// //     try {
// //       const { workspace_name, team } = req.body;
// //       const allJobOwners = await PG_QUERY_EXECUTORS.fetchAllJobOwners(
// //         team,
// //         workspace_name
// //       );
// //       const jobOwners = genericUtils.getJobOwners(allJobOwners.rows);
// //       res.status(200).json({ jobOwners });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/jobcomment",
// //   validate({ body: jobcommentschema }),
// //   async (req, res, next) => {
// //     const { downstream_job_name, comment, workspace_name, client_name } =
// //       req.body;

// //     const commentToWrite = !comment || comment === "" ? null : comment;

// //     try {
// //       const result =
// //         await PG_QUERY_EXECUTORS.updateDownstreamUserCommentByJobName(
// //           commentToWrite,
// //           downstream_job_name,
// //           workspace_name,
// //           client_name
// //         );

// //       const value = await jobWorkers.updateUserCommentsToReports({
// //         comment: commentToWrite,
// //         downstream_job_name,
// //         workspace_name,
// //         client_name,
// //       });

// //       res.status(201).json({
// //         status: result.rows[0].user_comments === value.user_comments,
// //         comment: result.rows[0].user_comments,
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.get("/syncstuckjob", async (req, res, next) => {
// //   try {
// //     await Promise.all([
// //       jobWorkers.getDownstreamJobsInProgress("downstream"),
// //       jobWorkers.getDownstreamJobsInProgress("upstream"),
// //     ]);

// //     res.sendStatus(200);
// //   } catch (err) {
// //     next(genericUtils.handleException(req, err, 500));
// //   }
// // });

// // router.post(
// //   "/syncstuckjob",
// //   validate({ body: syncjobs }),
// //   async (req, res, next) => {
// //     try {
// //       await jobWorkers.getDownstreamJobsInProgress(
// //         req.body.type,
// //         req.body.job_name
// //       );

// //       res.sendStatus(200);
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/inprogress",
// //   validate({ body: fetchInprogressSchema }),
// //   async (req, res, next) => {
// //     try {
// //       const result = await jobWorkers.fetchInprogressBuilds(req.body);
// //       res.status(200).json({ jobs: result.rows });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/delete",
// //   validate({ body: deleteJobSchema.body, query: deleteJobSchema.query }),
// //   async (req, res, next) => {
// //     try {
// //       const { job_type } = req.query;
// //       const { job_name, workspace_name, team, ci_tool } = req.body;

// //       if (job_type === "upstream") {
// //         await jobWorkers.deleteUpstreamJob(
// //           job_name,
// //           workspace_name,
// //           team,
// //           ci_tool,
// //           req.body.check_exist && true
// //         );
// //       } else {
// //         await jobWorkers.deleteDownstreamJob(
// //           job_name,
// //           workspace_name,
// //           team,
// //           ci_tool,
// //           req.body.check_exist && true
// //         );

// //         // Call cucumber queue to delete job references in cucumber tables
// //         const topic_deleteCucumberRecord =
// //           "ged.jenkinsmonitor.delete.deleteCucumberJobsHistory";

// //         produceEvents(
// //           topic_deleteCucumberRecord,
// //           { job_name, workspace_name, team, ci_tool, id: uuidv4(), retry: 0 },
// //           eventRecordSchema.deleteJob
// //         );
// //       }
// //       res.sendStatus(200);
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.get("/auditnonexistentjobs", async (req, res, next) => {
// //   try {
// //     await Promise.all([
// //       jobWorkers.getJobsToDelete("downstream"),
// //       jobWorkers.getJobsToDelete("upstream"),
// //     ]);

// //     res.sendStatus(200);
// //   } catch (err) {
// //     next(genericUtils.handleException(req, err, 500));
// //   }
// // });

// // router.post(
// //   "/appversion",
// //   validate({
// //     body: reportdashboardSchemas.appversion.body,
// //   }),
// //   async (req, res, next) => {
// //     try {
// //       const { workspace_name, client_name, tenant_list, start_date, end_date } =
// //         req.body;

// //       const tenant_keys_list_objs = await jobWorkers.getTenantKeys(
// //         tenant_list,
// //         client_name,
// //         workspace_name
// //       );

// //       const tenant_keys_list =
// //         tenant_keys_list_objs !== null
// //           ? tenant_keys_list_objs.tenants.reduce(
// //               (acc, val) => [...acc, val.tenant_key],
// //               []
// //             )
// //           : tenant_keys_list_objs;

// //       const queryresult = await PG_QUERY_EXECUTORS.getAppVersionHistory(
// //         workspace_name,
// //         client_name,
// //         tenant_keys_list,
// //         start_date,
// //         end_date
// //       );

// //       const records = queryresult.rows;
// //       let result = null;
// //       if (records.length) {
// //         result = records.reduce((acc, val) => {
// //           acc = {
// //             ...acc,
// //             [val.apm_version]: {
// //               ...(acc[val.apm_version] ? acc[val.apm_version] : {}),
// //               [val.tenant_name]: {
// //                 name: val.tenant_name,
// //                 passed_records: Number(val.passed_records),
// //                 failed_records: Number(val.failed_records),
// //               },
// //               data: {
// //                 name:
// //                   acc[val.apm_version] && acc[val.apm_version].data.name
// //                     ? acc[val.apm_version].data.name
// //                     : val.apm_version,
// //                 passed_records:
// //                   (acc[val.apm_version] &&
// //                   acc[val.apm_version].data.passed_records
// //                     ? acc[val.apm_version].data.passed_records
// //                     : 0) + Number(val.passed_records),
// //                 failed_records:
// //                   (acc[val.apm_version] &&
// //                   acc[val.apm_version].data.failed_records
// //                     ? acc[val.apm_version].data.failed_records
// //                     : 0) + Number(val.failed_records),
// //                 passed_count:
// //                   (acc[val.apm_version] &&
// //                   acc[val.apm_version].data.passed_count
// //                     ? acc[val.apm_version].data.passed_count
// //                     : 0) + 1,
// //                 failed_count:
// //                   (acc[val.apm_version] &&
// //                   acc[val.apm_version].data.failed_count
// //                     ? acc[val.apm_version].data.failed_count
// //                     : 0) + 1,
// //               },
// //             },
// //           };
// //           return acc;
// //         }, {});
// //       }
// //       res.status(201).json({
// //         result,
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/appbuild",
// //   validate({
// //     body: reportdashboardSchemas.appbuild.body,
// //   }),
// //   async (req, res, next) => {
// //     try {
// //       const { workspace_name, client_name, tenant_list, start_date, end_date } =
// //         req.body;

// //       const tenant_keys_list_objs = await jobWorkers.getTenantKeys(
// //         tenant_list,
// //         client_name,
// //         workspace_name
// //       );

// //       const tenant_keys_list =
// //         tenant_keys_list_objs !== null
// //           ? tenant_keys_list_objs.tenants.reduce(
// //               (acc, val) => [...acc, val.tenant_key],
// //               []
// //             )
// //           : tenant_keys_list_objs;

// //       let startDateInUtc = new Date(start_date).valueOf();
// //       let endDateInUtc = new Date(end_date).valueOf();

// //       const queryresult = await PG_QUERY_EXECUTORS.getAppBuildHistory(
// //         workspace_name,
// //         client_name,
// //         tenant_keys_list,
// //         startDateInUtc,
// //         endDateInUtc
// //       );

// //       const records = queryresult.rows;
// //       let result = null;
// //       if (records.length) {
// //         result = genericUtils.getAppBuildConsolidated(records);
// //       }
// //       res.status(201).json({
// //         result,
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/dashboardstatsoverview",
// //   validate({
// //     body: reportdashboardSchemas.dashboardStatsOverview,
// //   }),
// //   async (req, res, next) => {
// //     try {
// //       const { workspace_name, team, start_date, end_date, statname } = req.body;

// //       let startDateInUtc = new Date(start_date).valueOf();
// //       let endDateInUtc = new Date(end_date).valueOf();

// //       const result = await jobWorkers.getDashboardStatisticsWidgetData(
// //         workspace_name,
// //         team,
// //         startDateInUtc,
// //         endDateInUtc,
// //         statname
// //       );

// //       const keysNameMapping = {
// //         stalejobs: "Stale Jobs",
// //         avgpassfail: "Avg. Pass/Fail %",
// //         maxbuildtime: "Max. Build Duration",
// //         avgduration: "Avg. Build Duration",
// //       };

// //       res.status(201).json({
// //         name: keysNameMapping[statname],
// //         value: genericUtils.getRoundedNumbers(result.rows[0].queryresult),
// //         additionalValue: genericUtils.getRoundedNumbers(
// //           result.rows[0].additionalqueryresult || 0
// //         ),
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/dashboardhighestdurationlist",
// //   validate({
// //     body: reportdashboardSchemas.appbuild.body,
// //   }),
// //   async (req, res, next) => {
// //     try {
// //       const {
// //         workspace_name,
// //         client_name,
// //         tenant_list,
// //         start_date,
// //         end_date,
// //         statname,
// //       } = req.body;

// //       let startDateInUtc = new Date(start_date).valueOf();
// //       let endDateInUtc = new Date(end_date).valueOf();
// //       const tenant_keys_list_objs = await jobWorkers.getTenantKeys(
// //         tenant_list,
// //         client_name,
// //         workspace_name
// //       );

// //       const tenant_keys_list =
// //         tenant_keys_list_objs !== null
// //           ? tenant_keys_list_objs.tenants.reduce(
// //               (acc, val) => [...acc, val.tenant_key],
// //               []
// //             )
// //           : tenant_keys_list_objs;

// //       const result = await PG_QUERY_EXECUTORS.fetchAvgBuildDurationTop10(
// //         workspace_name,
// //         client_name,
// //         tenant_keys_list,
// //         startDateInUtc,
// //         endDateInUtc,
// //         statname
// //       );

// //       res.status(201).json({
// //         result: result.rows,
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// // router.post(
// //   "/dashboardworstperforming",
// //   validate({
// //     body: reportdashboardSchemas.appbuild.body,
// //   }),
// //   async (req, res, next) => {
// //     try {
// //       const { workspace_name, client_name, tenant_list, start_date, end_date } =
// //         req.body;

// //       const tenant_keys_list_objs = await jobWorkers.getTenantKeys(
// //         tenant_list,
// //         client_name,
// //         workspace_name
// //       );

// //       const tenant_keys_list =
// //         tenant_keys_list_objs !== null
// //           ? tenant_keys_list_objs.tenants.reduce(
// //               (acc, val) => [...acc, val.tenant_key],
// //               []
// //             )
// //           : tenant_keys_list_objs;

// //       let startDateInUtc = new Date(start_date).valueOf();
// //       let endDateInUtc = new Date(end_date).valueOf();

// //       const result = await PG_QUERY_EXECUTORS.fetchWorstPerformingJobs(
// //         workspace_name,
// //         client_name,
// //         tenant_keys_list,
// //         startDateInUtc,
// //         endDateInUtc
// //       );

// //       res.status(201).json({
// //         result: result.rows,
// //       });
// //     } catch (err) {
// //       next(genericUtils.handleException(req, err, 500));
// //     }
// //   }
// // );

// router.post(
//   "/complete",
//   validate({ body: jobCompletedSchema }),
//   async (req, res, next) => {
//     try {
//       const {
//         api_url,
//         workspace_name,
//         tenant_name,
//         apm_version,
//         browser_name,
//         type,
//         team,
//         operating_system,
//       } = req.body;
//       if (!api_url.includes(`/job/OTHERS/`)) {
//         const topic_jobcompleted =
//           "ged.jenkinsmonitor.insert.addworkspacefromremotecallcomplete";
//         await res.status(200).json({ result: "CREATED" });
//         produceEvents(
//           topic_jobcompleted,
//           {
//             api_url,
//             workspace_name,
//             tenant_name,
//             apm_version,
//             browser_name,
//             type,
//             team,
//             operating_system,
//             retry: 0,
//           },
//           eventRecordSchema.jobCompleted
//         );
//       } else {
//         await res.status(200).json({ result: "CREATED" });
//       }
//     } catch (err) {
//       next(genericUtils.handleException(req, err, 500));
//     }
//   }
// );

// router.get("/getpid", async (req, res, next) => {
//   try {
//     const os = require("os");
//     res.status(200).send(`Pid is : ${os.hostname()}`);
//   } catch (err) {
//     next(genericUtils.handleException(req, err, 500));
//   }
// });

// router.post("/*", async (req, res) => {
//   res.status(404).send("The URL you are trying to reach does not exist.");
// });

// router.get("/*", async (req, res) => {
//   res.status(404).send("The URL you are trying to reach does not exist.");
// });

// module.exports = router;
