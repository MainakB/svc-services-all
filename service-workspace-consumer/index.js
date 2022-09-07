require("dotenv").config();
const { kfSchema } = require("./kafka/schemas");
const { jobWorkers } = require("./utils");
const { group_names, topicsList } = require("./kafka/topics");

const consumerGroupsData = [
  {
    groupname: group_names.group_addworkspace,
    topicname: topicsList.topic_updateWorkspace,
    schema: kfSchema.kfJobCompletedSchema,
    forwardTopic: topicsList.topic_insertMissingJob,
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
