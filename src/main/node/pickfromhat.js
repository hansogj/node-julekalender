var http = require('http');
var url  = require('url');
var path = require('path');
var util = require('util');
var port =  1880;
var fs   = require('fs');
var filePath = './src/main/resources';
var dev = process.argv[2] === 'dev';



var filePrevWinners = filePath + (dev ? '/prevWinners_dev.txt' : '/prevWinners.txt');
var fileMembers     = filePath + (dev ? '/julekalender_dev.txt' : '/julekalender.txt');


function cleanUp(loosers, todaysWinner) {
    var date = new Date;
    var file = fs.createWriteStream(filePrevWinners, {flags: 'a', encoding: 'ascii',  mode: 0744});

    var tmp =  [date.getDate(), todaysWinner, '\n'].join(' ');
    console.log(tmp);
    file.write(tmp);

    fs.writeFile(fileMembers , loosers.join('\n'), 'ascii',  function(err) {
        if(err) {
            throw err;
        } else {
            console.log("The file was saved!");
        }
    });
}


function jsonRespond(response, data) {
    var members = data.replace(/^\s+|\s+$/g, "").split('\n');
    var no =  Math.floor(Math.random() * members.length);
    var winner =  members.splice(no, 1);
    winner = winner.length ? winner[0] : "Ingen flere lapper i hatten";
    var objToJson = {winner : winner};

    response.writeHead(200, {'Content-Type': 'application/json'});
    response.write(JSON.stringify(objToJson));
    response.end();
    cleanUp(members, winner);
}


http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    if(uri.match(/.json$/)){
        fs.readFile(fileMembers, 'ascii', function (err,data) {
            if(err) {
                console.log(err);
            } else {
                jsonRespond(response, data);
            }
        });
        return;
    }

    path.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += 'src/main/index.html';

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
