const http = require('http');
const puppeteer = require('puppeteer');
//const fs = require('fs');
const port = process.env.PORT || 80;
(async () => {
	const browser = await puppeteer.launch({
//		defaultViewport: {width: 1920, height: 1080},
		headless: true,
		args: ['--no-sandbox','--disable-setuid-sandbox']
	});
	const page = await browser.newPage();
	try {
		await page.goto('https://fightonline.usc.edu/s/events');

		// event data, e.g. https://fightonline.usc.edu/s/sfsites/aura?r=6&other.PORTAL_Listing.SERVER_getListings=1

		const firstResponse = await page.waitForResponse((response) => {
			return response.url().endsWith('PORTAL_Listing.SERVER_getListings=1') && response.status() === 200;
		});

		const responsejson = await firstResponse.json();
		console.log( "Started." );
		var eventsjson = responsejson.actions[0].returnValue;
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
	await browser.close();

})();