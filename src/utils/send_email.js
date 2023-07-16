//Imports

const CustomError = require("./custom_error");

const sgMail = require("@sendgrid/mail");

//Methods

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Function that sends an email using send grid package
 *
 * @param {Object} options - The options for the email to send
 * @param {string} options.to - The email address of the recipient
 * @param {string} options.subject - The subject of the email
 * @param {string} options.text - The text content of the email
 * @param {string} [options.html] - The HTML content of the email (optional)
 * @returns {Promise<Object>} A Promise that resolves with the info object returned by send grid
 * on successful email delivery
 * @throws {CustomError} If something goes wrong trying to send the email
 */
function send_email(options) {
  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(new CustomError(`Failed to send email: ${error}`, 500));
    });
}

//Exports

module.exports = send_email;
