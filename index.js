require("dotenv").config();

const express = require("express");
const app = express();
const port = 8000;
const smpp = require("smpp");
const session = smpp.connect({
  url: process.env.SMS_URL, //'smpp://example.com:2775',
  auto_enquire_link_period: 10000,
});

app.get("/", (req, res) => {
  res.send("Hello World!" + process.env.SMS_PORT);
});

app.get("/send-sms", (req, res) => {
  console.log("recived");
  session.bind_transceiver(
    {
      system_id: process.env.SMS_USER,
      password: process.env.SMS_PASSWORD,
    },
    function (pdu) {
      console.log(pdu);
      if (pdu.command_status == 0) {
        // Successfully bound
        session.submit_sm(
          {
            destination_addr: "9659287301",
            short_message: "Hello!",
          },
          function (pdu) {
            if (pdu.command_status == 0) {
              // Message successfully sent
              console.log(pdu.message_id);
              res.send(pdu.message_id);
            }
          }
        );
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
