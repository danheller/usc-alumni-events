const http = require('http');
const puppeteer = require('puppeteer');
//const fs = require('fs');
const port = process.env.PORT || 8080;
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



//		http.createServer(function (req, res) {
//			if( eventsjson && eventsjson.length ) {
//				res.writeHead(200, {'Content-Type': 'text/json'});
//				res.end( JSON.stringify(eventsjson) );
//			} else {
//				res.writeHead(200, {'Content-Type': 'text/html'});
//				res.end( 'false' );
//			}
//		}).listen( port );
//		console.log( "Displayed JSON.");

		const affinities = ["Affinity: Asian Pacific","Affinity: Black","Affinity: Latino/x","Affinity: LGBTQ"];
		await page.waitForSelector('select[name="selectedtopicInterests"]');
		var mergedeventsjson = eventsjson;
		page
			.on('console', message => {
				const msgtxt = `${message.text()}`;
				if( 0 == msgtxt.indexOf('result: q') ) {
					affinityresults = msgtxt.substring( msgtxt.indexOf('[') );
					affinityresultsjson = JSON.parse( affinityresults );
					console.log( affinityresultsjson.length + " events found.");
//						console.log( apaaresultsjson );

					mergedeventsjson = [
						...affinityresultsjson,
						...mergedeventsjson
					];
					console.log( "Total events: " + mergedeventsjson.length );
				}
			});


		var affinityresults = '';
		var affinityresultsjson = [];
		affinities.forEach( function(aff,index) {
			var delay = 1000 + ( index * 2000 );
			setTimeout( function() {
				// select dropdown item for Asian Pacific Alumni Association
				page.select('select', aff);
				console.log( 'selected '+aff );

				page.waitForSelector('button.slds-button.slds-button_brand.w-full');
				page.click('button.slds-button.slds-button_brand.w-full');

				//setTimeout( function() {
				//	page.screenshot({
				//	  path: 'screenshotafterbutton.jpg'
				//	});
				//}, 5000 );

				console.log( 'clicked Search' );
				// get a console log beginning with "result:"
			}, delay );
		});

		setTimeout(function() {

			http.createServer(function (req, res) {
				if( apaajson ) {
					res.writeHead(200, {'Content-Type': 'text/json'});
					res.end( JSON.stringify(mergedeventsjson) );
				} else {
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.end( 'false' );
				}
			}).listen( port );
			console.log( "Displayed JSON.");
			console.log( mergedeventsjson );
			browser.close();
		}, 10000 );

	}  catch(err) {
		console.log(err);
	}

})();