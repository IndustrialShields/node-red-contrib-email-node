module.exports = function(RED) {
    let nodemailer = require("nodemailer");

    function EmailContribNode(n) {
        RED.nodes.createNode(this, n);

		let node = this;

        node.on("input", function(msg) {
            if (msg.hasOwnProperty("payload")) {
				let smtpOptions = {
					host: msg.server || n.server,
					port: msg.port || n.port,
					secure: msg.hasOwnProperty("secure") ? msg.secure : n.secure,
				}

				let userid = msg.userid || n.userid;
				let password = msg.password || n.password;
				if (userid && password) {
					smtpOptions.auth = {
						user: userid,
						pass: password,
					};
				}
				let smtpTransport = nodemailer.createTransport(smtpOptions);
                if (smtpTransport) {
                    node.status({
						fill:"blue",
						shape:"dot",
						text:"Sending",
					});

					let payload = RED.util.ensureString(msg.payload);
                    let email = { 
						from: msg.from || n.userid,
						to: msg.to || n.to,
						subject: msg.topic || "",
						text: payload,
					};

					if (msg.cc) {
						email.cc = msg.cc;
					}
					if (msg.bcc) {
						email.bcc = msg.bcc;
					}

					if (/<[a-z][\s\S]*>/i.test(payload)) {
						email.html = payload;
					}

					if (msg.attachments) {
						email.attachments = msg.attachments;
					}

                    smtpTransport.sendMail(email, function(error, info) {
                        if (error) {
                            node.error(error, msg);
                            node.status({
								fill:"red",
								shape:"ring",
								text:"Fail",
							});
                        } else {
                            node.status({});
                        }
                    });
				}
			}
        });
    }
    RED.nodes.registerType("email-contrib", EmailContribNode);
};
