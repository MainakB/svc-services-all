const sleep = require("util").promisify(setTimeout);
const Kafka = require("node-rdkafka");

const logger = require("./logger");
const genericUtils = require("./genericUtils");
const { PG_QUERY_EXECUTORS } = require("../models/pg/pgDbService");

const getConsumer = (groupdata) => {
  const consumer = new Kafka.KafkaConsumer(
    {
      "group.id": groupdata.groupname,
      "metadata.broker.list":
        process.env["NODE_ENV"] === "production"
          ? process.env.KAFKA_BROKERS
          : process.env.KAFKA_BROKERS_DEV,
      "security.protocol": "PLAINTEXT",
      "enable.auto.commit": false,
      offset_commit_cb: function (err, topicPartitions) {
        if (err) {
          console.error(`There was an error committing: ${err}`);
        } else {
          // Commit went through. Let's log the topic partitions
          console.log(`Commit successful: ${topicPartitions}`);
        }
      },
    },
    {
      "auto.offset.reset": "earliest", //Read from last offset
    }
  );
  connect(consumer, groupdata);
  return consumer;
};

const connect = (consumer, groupdata) =>
  consumer.connect({ timeout: "1000ms" }, (err) => {
    if (err) {
      console.log(
        `Error connecting to Kafka broker for topic ${groupdata.topicname}: ${err}`
      );
      process.exit(-1);
    }
    console.log(
      `Consumer connected to Kafka broker for topic ${groupdata.topicname}`
    );
  });

const addTeamCiTenant = async (payload) => {
  try {
    const { api_url, team, tenant_name } = payload;
    const ci = "Jenkins";
    // genericUtils.deriveCiName(api_url);

    console.log("11111111111init calls");

    const queries = [
      PG_QUERY_EXECUTORS.findCiByName(ci),
      PG_QUERY_EXECUTORS.findTeamByName(team),
      PG_QUERY_EXECUTORS.checkIfTenantIsExisting(tenant_name),
    ];

    const [ciExist, teamExist, tenantExist] = await Promise.all(queries);

    console.log("init calls", ciExist, teamExist, tenantExist);
    let insertQueries = [];
    if (!ciExist || !ciExist[0].length) {
      insertQueries.push(PG_QUERY_EXECUTORS.insertCiQuery([[ci]]));
    }

    if (!teamExist || !teamExist[0].length) {
      insertQueries.push(PG_QUERY_EXECUTORS.insertTeamsQuery([[team]]));
    }

    if (!tenantExist || !tenantExist[0].length) {
      insertQueries.push(
        PG_QUERY_EXECUTORS.insertTenantQuery([[tenant_name, tenant_name]])
      );
    }

    const querySet = [];
    for (const query of insertQueries) {
      querySet.push({ query });
    }
    await PG_QUERY_EXECUTORS.runTransaction(querySet);
  } catch (err) {
    logger.debug(
      `jobworkers(addTeamCiTenant) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

module.exports = {
  getConsumer,
  addTeamCiTenant,
  connect,
};
