require("dotenv").config();

const express = require("express");
const app = express();
const port = 8000;
var didConnect = false;
var smpp = require("smpp");
var session = smpp.connect({
  // url: process.env.SMS_URL,
  // auto_enquire_link_period: 10000,
  host: process.env.SMS_IP,
  port: process.env.SMS_PORT,
});

session.on("connect", function () {
  didConnect = true;
  console.log("connecting....");

  session.bind_transceiver(
    {
      system_id: process.env.SMS_USER,
      password: process.env.SMS_PASSWORD,
    },
    function (pdu) {
      console.log("pdu status");
      if (pdu.command_status == 0) {
        console.log("Successfully bound");
      }
    }
  );
});

function connectSMPP() {
  console.log("smpp reconnecting");
  session.connect();
}

session.on("close", function () {
  console.log("smpp disconnected");
  if (didConnect) {
    connectSMPP();
  }
});

session.on("error", function (error) {
  console.log("smpp error", error);
  didConnect = false;
});

app.get("/", (req, res) => {
  res.send("Hello World!" + process.env.SMS_PORT);
});

app.get("/send-sms", (req, res) => {
  session.submit_sm(
    {
      // source_addr: from,
      destination_addr: "+919659287301",
      short_message: "text",
    },
    function (pdu) {
      console.log("sms pdu status");
      if (pdu.command_status == 0) {
        // Message successfully sent
        console.log(pdu.message_id);
      }
    }
  );

  res.status(200).json({ session });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
