const sgMail = require('@sendgrid/mail');
const API_KEY = "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";

sgMail.setApiKey(API_KEY);

module.exports.sendAdminEmail = (data) => {
  const {subject = 'Not specified.', html = '', text = ''} = data;

  const msg = {
    to: 'gwyn.artstyle@gmail.com',
    from: 'noreply@ginie.co.uk',
    subject,
    html,
    text,
  };
  sgMail.send(msg);
}


module.exports.sendInitialEmail = (data) => {
  const {email = '', grants, user_id} = data;

  const msg = {
    from: 'noreply@ginie.co.uk',
    to: email,
    subject: 'Welcome | GeNie',
    templateId: 'd-7835950234dc462abf1eb3b77152f37b',
    dynamic_template_data: {
      grants: grants.map(grant => ({...grant, userId: user_id}))
    },
    "personalizations": [
      {
        "to": email,
        "subject": 'Welcome | GeNie'
      }
    ],
    html: `Welcome to GeNie! We will help to keep an eye on new opportunities.`,
    text: `Welcome to GeNie! We will help to keep an eye on new opportunities.`
  };
  console.log('msg: ', msg);

  sgMail.send(msg).catch(err => console.error(JSON.stringify(err)));
}



module.exports.sendRegularUpdate = (data) => {
  const {email = '', grants, user_id} = data;

  const msg = {
    from: 'noreply@ginie.co.uk',
    to: email,
    subject: 'Regular update | GeNie',
    templateId: 'd-3d8201011d5149f89b4055cadf486304',
    dynamic_template_data: {
      grants: grants.map(grant => ({...grant, userId: user_id}))
    },
    "personalizations": [
      {
        "to": email,
        "subject": 'Welcome | GeNie'
      }
    ],
    html: `GeNie regular update.`,
    text: `GeNie regular update.`
  };
  console.log('msg: ', msg);

  sgMail.send(msg).catch(err => console.error(JSON.stringify(err)));
}
