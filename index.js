const http = require('http');
const puppeteer = require('puppeteer');
const url  = require('url');
//const fs = require('fs');
const port = process.env.PORT || 80;

const httpServer = http.createServer((request, response) => {
	// Getting request path
	// by using request.path

	(async () => {
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox','--disable-setuid-sandbox']
		});
		const page = await browser.newPage();
	
		const path = request.url;
		console.log("Request URL: ", path)
		let splitpath = path.split('/');
		let showEvent = false;
		let evId      = false;
	
	//	let keyword    = 'advancement';
	//	let req        = false;
	//	let start      = '1';
	//	let countPages = false;
	//	let showData   = false;
	//	let pageCount  = 0;
	
	//	console.log ( splitpath );
	
		if( splitpath[1] ) {
			if( 'event' == splitpath[1] ) {
				evId = splitpath[2];
			}
		}
	
		if( evId ) {
			try {
				await page.goto('https://fightonline.usc.edu/Alumni/s/listing/' + evId );
		
				// event data, e.g. https://fightonline.usc.edu/s/sfsites/aura?r=6&other.PORTAL_Listing.SERVER_getListings=1
		
				const firstResponse = await page.waitForResponse((response) => {
					return response.text().startsWith('RESULT-->') && response.status() === 200;
				});
		
				const responsejson = await firstResponse.text().replace('RESULT-->','');
				console.log( "Started." );
				const eventsjson = responsejson.json().actions[0].returnValue;
		//		fs.writeFileSync('data/events.json', JSON.stringify(eventsjson));
		//		console.log( eventsjson.length + " events found.");
		
				http.createServer(function (req, res) {
					if( eventsjson && eventsjson.length ) {
						res.writeHead(200, {'Content-Type': 'text/json'});
						res.end( JSON.stringify(eventsjson) );
					} else {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end( 'false' );
					}
				}).listen( port );
				console.log( "Displayed JSON.");
		
			}  catch(err) {
				console.log(err);
			}
		} else {
			try {
				await page.goto('https://fightonline.usc.edu/s/events');
		
				// event data, e.g. https://fightonline.usc.edu/s/sfsites/aura?r=6&other.PORTAL_Listing.SERVER_getListings=1
		
				const firstResponse = await page.waitForResponse((response) => {
					return response.url().endsWith('PORTAL_Listing.SERVER_getListings=1') && response.status() === 200;
				});
		
				const responsejson = await firstResponse.json();
				console.log( "Started." );
				const eventsjson = responsejson.actions[0].returnValue;
		//		fs.writeFileSync('data/events.json', JSON.stringify(eventsjson));
				console.log( eventsjson.length + " events found.");
		
				http.createServer(function (req, res) {
					if( eventsjson && eventsjson.length ) {
						res.writeHead(200, {'Content-Type': 'text/json'});
						res.end( JSON.stringify(eventsjson) );
					} else {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end( 'false' );
					}
				}).listen( port );
				console.log( "Displayed JSON.");
		
			}  catch(err) {
				console.log(err);
			}
		}
	
		await browser.close();
	})();
	
}).listen(port, () => {
	console.log("Server is running at port " + port);
});
