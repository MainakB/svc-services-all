const { jobWorkers, genericUtils } = require("../../utils");
const { PG_QUERY_EXECUTORS } = require("../../models/pg/pgDbService");
const { produceEvents } = require("../producer");
const { kfSchema } = require("../schemas");

module.exports = function (groupdata, topicsObj, consumer) {
  consumer.on("ready", () => {
    console.log(`${groupdata.topicname} consumer ready..`);

    try {
      consumer.subscribe([groupdata.topicname]);
      console.log(`Subscribed to topic : ${groupdata.topicname}.`);
    } catch (err) {
      console.log(
        `Error subscribing to topic : ${groupdata.topicname}. ERR: ${err}`
      );
    }

    try {
      setInterval(() => {
        consumer.consume(10);
      }, 1000);
    } catch (err) {
      console.log(
        `Error starting consumer for topic ${groupdata.topicname}. ERR: ${err}`
      );
    }
  });

  consumer.on("data", async (data) => {
    let dataToSend = null;
    let errorThrown = false;
    let errorState = 0;
    let errorData = null;
    try {
      console.log(`Received raw data for ${data}`);
      dataToSend = data
        ? groupdata.schema
          ? groupdata.schema.fromBuffer(data.value)
          : data.value.toString()
        : {};

      console.log(
        `Received data for ${groupdata.topicname} with schema ${groupdata.schema} and data : ${dataToSend}`
      );

      if (groupdata.topicname === topicsObj.topics.topic_insertMissingJob) {
        const dataModified = { ...dataToSend };
        await jobWorkers.addJobIfMissingElseUpdate(dataModified);

        console.log("Job added. Produce next event: ", groupdata.forwardTopic);
        produceEvents(groupdata.forwardTopic, dataModified, groupdata.schema);
      } else if (
        groupdata.topicname === topicsObj.topics.topic_insertJobHistory
      ) {
        const dataModified = { ...dataToSend };
        await jobWorkers.updateBuildHistoryFromComplete(dataModified);
      } else if (groupdata.topicname === topicsObj.topics.topic_retryTopic) {
        let retryData = null;
        if (dataToSend) {
          const dataObj =
            typeof dataToSend === "string"
              ? JSON.parse(dataToSend)
              : dataToSend;
          retryData = dataObj.retryData
            ? typeof dataObj.retryData === "string"
              ? dataObj.retryData
              : JSON.stringify(dataObj.retryData)
            : null;
          await PG_QUERY_EXECUTORS.insertToRetryTable(
            retryData,
            dataObj.retry,
            dataObj.topic,
            dataObj.errorState,
            typeof dataObj.schema === "string"
              ? dataObj.schema
              : JSON.stringify(dataObj.schema),
            dataObj.error
          );
        }

        console.log("retryData is derived as", retryData);
      } else {
        console.error("Invalid topic name: ", groupdata.topicname);
      }
    } catch (err) {
      console.log(`${groupdata.topicname}: Error reading data. ERR: ${err} `);
      if (groupdata.topicname !== topicsObj.topics.topic_retryTopic) {
        errorThrown = true;
        if (
          dataToSend &&
          (err.stack.includes("jobWorkers") ||
            err.stack.includes("@grpc") ||
            err.stack.includes("ETIMEDOUT") ||
            err.stack.includes("FetchError") ||
            err.stack.includes("sorry, too many clients already")) &&
          dataToSend.retry <= 3
        ) {
          let retryValue = dataToSend.retry ? dataToSend.retry + 1 : 1;
          errorState = retryValue === 4 ? 1 : 0;

          errorData = {
            retryData: JSON.stringify({ ...dataToSend }),
            retry: retryValue,
            topic: groupdata.topicname,
            errorState,
            schema: JSON.stringify(groupdata.schema),
            error: err.stack,
          };
        } else {
          errorState = 1;
          errorData = {
            retryData: JSON.stringify({ ...(dataToSend || {}) }),
            retry: dataToSend.retry ? dataToSend.retry + 1 : 1,
            topic: groupdata.topicname,
            errorState,
            schema: JSON.stringify(groupdata.schema),
            error: err.stack,
          };
        }
        produceEvents(
          "varis.papyrus.retry.topic_retryTopic",
          errorData,
          kfSchema.kfRetryErrorSchema
        );
      }
    } finally {
      consumer.commitMessageSync(data);
      consumer.committed(null, 5000, function (err, topicPartitions) {
        console.log(`Commit details:
        Topic: ${topicPartitions.map((val) => val.topic)}
        Partition Length: ${topicPartitions.length}
        Partitions: ${topicPartitions.map((val) => val.partition)}
        Partition Offset: ${topicPartitions.map((val) => val.offset)}
        Data offset : ${data.offset}
        Data Size: ${data.size}
        Data Partition: ${data.partition}
        Timestamp: ${data.timestamp}
        Error thrown: ${errorThrown}
        Error State: ${errorState}
        `);
      });
      jobWorkers.connect(consumer, groupdata);
    }
  });

  consumer.on("disconnected", (arg) => {
    console.log(
      `Consumer for topic ${groupdata.topicname} disconnected. ${JSON.stringify(
        arg
      )}`
    );
    jobWorkers.connect(consumer, groupdata);
  });

  consumer.on("event.error", function (err) {
    consumer.disconnect();
    console.error(
      `Error from consumer for topic ${groupdata.topicname}: ${err}`
    );
  });
};
