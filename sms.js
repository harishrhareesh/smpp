require("dotenv").config();

var smpp = require("smpp");
var session = smpp.connect({
  url: process.env.SMS_URL,
  auto_enquire_link_period: 10000,
});

session.bind_transceiver(
  {
    system_id: process.env.SMS_USER,
    password: process.env.SMS_PASSWORD,
  },
  function (pdu) {
    if (pdu.command_status == 0) {
      // Successfully bound
      session.submit_sm(
        {
          destination_addr: "DESTINATION NUMBER",
          short_message: "Hello!",
        },
        function (pdu) {
          if (pdu.command_status == 0) {
            // Message successfully sent
            console.log(pdu.message_id);
          }
        }
      );
    }
  }
);

var server = smpp.createServer(function (session) {
  session.on("bind_transceiver", function (pdu) {
    console.log(pdu);
    // we pause the session to prevent further incoming pdu events,
    // untill we authorize the session with some async operation.
    session.pause();
    checkAsyncUserPass(pdu.system_id, pdu.password, function (err) {
      if (err) {
        session.send(
          pdu.response({
            command_status: smpp.ESME_RBINDFAIL,
          })
        );
        session.close();
        return;
      }
      session.send(pdu.response());
      session.resume();
    });
  });
});

server.listen(2775, () => {
  console.log(`Example app listening on port ${2775}!`);
});
