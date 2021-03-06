/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');

var _messages = JSON.parse(fs.readFileSync('messageLog.txt'));

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders; // eslint-disable-line no-use-before-define

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'JSON';
  if (request.method === 'POST') {
    statusCode = 201;
  }
  var splitURL = request.url.split('?'); 

  if (splitURL[0] !== '/classes/messages/' && splitURL[0] !== '/classes/messages') {
    statusCode = 404;
  }

  var params = splitURL[1] ? splitURL[1].split('&') : '';


  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  if (request.method === 'GET') {
    if (request.url === '/' || request.url.indexOf('username') !== -1) {
      console.log('hello');
      var htmlText = fs.readFileSync('client/client/index.html');
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(htmlText);
      response.end();
    } else if (request.url === '/styles/styles.css'
      || request.url === '/scripts/app.js'
      || request.url === '/bower_components/jquery/dist/jquery.js'
      || request.url === '/images/spiffygif_46x46.gif') {
      request.url = process.cwd() + '/client/client' + request.url; 
      var file = fs.readFileSync(request.url);
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(file); 
      response.end(); 
    // } else if (request.url.indexOf('username') !== -1) {
    //   console.log('in username handler');
    //   response.end(); 
    //   return;
    }


    var reverseOrder = false;
    for (var i = 0; i < params.length; ++i) {
      console.log(params[i]);
      var pair = params[i].split('=');
      if (pair[0] === 'order' && pair[1] === '-createdAt') {
        reverseOrder = true;
      }
    }

    var result = _messages;
    if (reverseOrder) {
      result = _messages.slice(0).reverse();
    }

    response.end(JSON.stringify({results: result}));
    // return data somewhere

  } else if (request.method === 'POST') {

    // save data somewhere
    request.on('data', function(data) {
      var message = JSON.parse(data);
      if (message.message) {
        message.text = message.message;
      }
      if (message.username && message.text) {
        message.objectId = _messages.length + 1;
        message.createdAt = Date.now();
        _messages.push(message);
        console.log(message);
        fs.writeFileSync('messageLog.txt', JSON.stringify(_messages));
      } else {
        response.writeHead(400, headers);
      }
    });
    response.end();
  } else if (request.method === 'OPTIONS') {
    response.end();
  }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end(JSON.stringify({results: [{username: 'sam', text: 'hello', roomname: 'lobby'}]}));
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

