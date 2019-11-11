var TwitchJs = require('twitch-js').default;

module.exports = function(config) {
    var { api } = new TwitchJs({
        clientId: config.twitchId
    });
    return api;
};