
let express = require('express');
let app = express();
let mongoose = require('mongoose');
let morgan = require('morgan');
let bodyParser = require('body-parser');
const cors = require('cors');
let port = 8081;
let book = require('./app/routes/book');
let config = require('config'); //we load the db location from the JSON files
//db options
let options = {
	useMongoClient: true,
	autoIndex: false, // Don't build indexes
	reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
	reconnectInterval: 500, // Reconnect every 500ms
	poolSize: 10, // Maintain up to 10 socket connections
	// If not connected, return errors immediately rather than waiting for reconnect
	bufferMaxEntries: 0
  };
//db connection      
mongoose.connect(config.DBHost, options, function(err) {
	if (err) {
		console.log('MongoDB connection error: ' + err);
		process.exit(1);
	}
});

mongoose.connection.on('connected', function () {  
	console.log(`Mongoose default connection open to ${config.DBHost}` );
  }); 
  
  // If the connection throws an error
  mongoose.connection.on('error',function (err) {  
	console.log('Mongoose default connection error: ' + err);
  }); 
  
  // When the connection is disconnected
  mongoose.connection.on('disconnected', function () {  
	console.log('Mongoose default connection disconnected'); 
  });
  
  // If the Node process ends, close the Mongoose connection 
  process.on('SIGINT', function() {  
	mongoose.connection.close(function () { 
	  console.log('Mongoose default connection disconnected through app termination'); 
	  process.exit(0); 
	}); 
  }); 


//don't show the log when it is test
if(config.util.getEnv('NODE_ENV') !== 'test') {
	//use morgan to log at command line
	app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

//parse application/json and look for raw text                                        
app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'}));  
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE,PATCH,OPTIONS");
	next();
  });
app.get("/", (req, res) => res.json({message: "Welcome to our Bookstore!"}));

app.route("/book")
	.get(book.getBooks)
	.post(book.postBook);
app.route("/book/:id")
	.get(book.getBook)
	.delete(book.deleteBook)
	.put(book.updateBook);


app.listen(port);
console.log("Listening on port " + port);

module.exports = app; // for testing
