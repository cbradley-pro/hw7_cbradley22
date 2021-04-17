const express = require('express');
var unirest = require("unirest");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {

        var req = unirest("POST", "https://neutrinoapi-bad-word-filter.p.rapidapi.com/bad-word-filter");

        req.headers({
            "content-type": "application/x-www-form-urlencoded",
            "x-rapidapi-key": "3f60fdc8e3msh78388fb6837c71ap19d3a9jsn6a7978542c7e",
            "x-rapidapi-host": "neutrinoapi-bad-word-filter.p.rapidapi.com",
            "useQueryString": true
        });

        req.form({
            "censor-character": "*",
            "content": message
        });

        req.end(function (res) {
            if (res.error) throw new Error(res.error);

            io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + res.body["censored-content"]);
            console.log(res.body);
        });
    });

});

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});