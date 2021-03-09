require("dotenv").config();

const express = require("express");
const app = express();
const port = 9000;
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

  // session.bind_transceiver(
  //   {
  //     system_id: process.env.SMS_USER,
  //     // password: process.env.SMS_PASSWORD,
  //   },
  //   function (pdu) {
  //     console.log("pdu status", pdu);
  //     if (pdu.command_status == 0) {
  //       console.log("Successfully bound");
  //     }
  //   }
  // );
});

// function connectSMPP() {
//   console.log("smpp reconnecting");
//   session.connect();
// }

// session.on("close", function () {
//   console.log("smpp disconnected");
//   if (didConnect) {
//     connectSMPP();
//   }
// });

session.on("error", function (error) {
  console.log("smpp error", error);
  didConnect = false;
});

app.get("/", (req, res) => {
  res.send("Hello World!" + process.env.SMS_PORT);
});

app.get("/send-sms", (req, res) => {
  // session.submit_sm(
  //   {
  //     // source_addr: from,
  //     destination_addr: "9801033925",
  //     short_message: "text",
  //   },
  //   function (pdu) {
  //     console.log("sms pdu status", pdu);
  //     if (pdu.command_status == 0) {
  //       // Message successfully sent
  //       console.log(pdu.message_id);
  //     }
  //   }
  // );
  session.bind_transceiver(
    {
      system_id: process.env.SMS_USER,
      // password: process.env.SMS_PASSWORD,
    },
    function (pdu) {
      console.log("pdu status", pdu);
      if (pdu.command_status == 0) {
        console.log("Successfully bound");
        session.submit_sm(
          {
            source_addr: "Test_Alert",
            source_addr_ton: 5,
            destination_addr: "+9779849116714",
            short_message: "text",
          },
          function (pdu) {
            console.log("sms pdu status", pdu);
            if (pdu.command_status == 0) {
              // Message successfully sent
              console.log(pdu.message_id);
            }
          }
        );
      }
    }
  );
  res.status(200).json({ message: "ok" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
