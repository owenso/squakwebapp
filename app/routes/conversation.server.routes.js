var conversations = require('../../app/controllers/conversations.server.controller');

module.exports = function(app) {
    app.route('/api/newRequest')
        .post(conversations.createNewRequest);
};
