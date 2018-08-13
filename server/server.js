const SocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
const fs = require('fs');
var app = express();

var router = express.Router();
var port = process.env.PORT || 8000;
var server = app.listen(port, function () {
  console.log('node.js static server listening on port: ' + port + ", with websockets listener")
})
const wss = new SocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log("connection ...");

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

  });

  var id = setInterval(function () {
    var obj = [{ stock: "SBI", price: 2000 }, { stock: "Infosys", price: 1000 }, { stock: "Kotak", price: 3000 }, { stock: "Reliance", price: 4000 }];
    var data = [];
    var max = 16;
    var min = 5;
    for (var i = 0; i < obj.length; i++) {
      var random = Math.floor(Math.random() * (max - min) - min);
      const body = { stock: obj[i].stock, price: (obj[i].price * (1 + random * 0.01)) };
      data.push(body);
    }
    ws.send(JSON.stringify(data));
  }, 5000);
  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id); 
  });
});
