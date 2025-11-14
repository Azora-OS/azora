module.exports = {
  welcome: require('./welcome'),
  generic: {
    subject: 'Notification from Azora OS',
    html: (data) => `<p>${data.message}</p>`,
    text: (data) => data.message
  }
};
