var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});
var connector = new builder.ChatConnector({
    //   appId: "",
    // appPassword: ""
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
bot.dialog('/', new builder.IntentDialog()
    .matches(/curl/i, function(session) {
        session.beginDialog('/curl', session);
    })
    .onDefault(function(session) {}));
bot.dialog('/curl', [
    function(session) {
        builder.Prompts.text(session, "Feed me URL NAO!");
    },
    function(session, results) {
        session.sendTyping();
        if (results.response) {
            request({
                method: 'GET',
                uri: results.response,
                time: true
            }, function(error, response, body) {
                var msg = new builder.Message(session)
                    .textFormat(builder.TextFormat.xml)
                    .attachments([
                        new builder.HeroCard(session)
                        .title("Url Stats")
                        .text("Response Code: " + response.statusCode+"\nTime: " + (response.elapsedTime) + "ms")
                    ]);
                session.endDialog(msg);
            });
        }
    }
]);
