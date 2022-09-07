const Kafka = require("node-rdkafka");

const produceEvents = (topic, event, eventType) => {
  const producer = new Kafka.Producer(
    {
      "metadata.broker.list":
        process.env["NODE_ENV"] === "production"
          ? process.env.KAFKA_BROKERS
          : process.env.KAFKA_BROKERS_DEV,
      "message.send.max.retries": 10,
      "retry.backoff.ms": 1000,
      "log.connection.close": false,
      "request.timeout.ms": 5 * 60 * 1000,
      "compression.codec": "snappy",
      dr_cb: true,
      "enable.idempotence": true,
    },
    { acks: "all" }
  );
  // Connect to the broker manually
  producer.connect(null, (err, data) => {
    if (err) {
      throw err;
    }
    console.log("Config service producer is now connected");
  });

  // Wait for the ready event before proceeding
  producer.on("ready", () => {
    console.log(`Config service producer ready..`);
    try {
      producer.produce(
        // Topic to send the message to
        topic,
        // optionally we can manually specify a partition for the message
        // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
        null,
        // Message to send. Must be a buffer
        // Buffer.from("Awesome message"),
        eventType.toBuffer(event),
        // for keyed messages, we also specify the key - note that this field is optional
        // you can send a timestamp here. If your broker version supports it,
        // it will get added. Otherwise, we default to 0
        Date.now()
        // you can send an opaque token here, which gets passed along
        // to your delivery reports
      );
    } catch (err) {
      console.error(`A problem occurred when sending our message ${err}`);
      throw err;
    }
  });
  // Any errors we encounter, including connection errors
  producer.on("event.error", function (err) {
    producer.disconnect();
    console.error("Error from producer");
    console.error(err);
  });
  producer.on("delivery-report", function (err, report) {
    producer.disconnect();
    console.log(
      `Event delivered. Payload: ${JSON.stringify(
        event,
        null,
        4
      )}\nKafka Ack: ${JSON.stringify(report, null, 4)}`
    );
  });
  // We must either call .poll() manually after sending messages
  // or set the producer to poll on an interval (.setPollInterval).
  // Without this, we do not get delivery events and the queue
  // will eventually fill up.
  producer.setPollInterval(100);
};

module.exports = { produceEvents };
