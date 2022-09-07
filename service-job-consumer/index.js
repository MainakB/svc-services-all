require("dotenv").config();
const { kfSchema } = require("./kafka/schemas");
const { jobWorkers } = require("./utils");
const { group_names, topicsList } = require("./kafka/topics");

const consumerGroupsData = [
  {
    groupname: group_names.group_jobstatechanges,
    topicname: topicsList.topic_insertMissingJob,
    schema: kfSchema.kfJobCompletedSchema,
    forwardTopic: topicsList.topic_insertJobHistory,
  },
  {
    groupname: group_names.group_jobstatechanges,
    topicname: topicsList.topic_insertJobHistory,
    schema: kfSchema.kfJobCompletedSchema,
    forwardTopic: null,
  },
  {
    groupname: group_names.group_retrytopicx,
    topicname: topicsList.topic_retryTopic,
    schema: kfSchema.kfRetryErrorSchema,
    forwardTopic: null,
  },
];

for (let groupObject of consumerGroupsData) {
  const consumer = jobWorkers.getConsumer(groupObject);
  require("./kafka/consumer")(
    groupObject,
    {
      topics: topicsList,
    },
    consumer
  );
}
