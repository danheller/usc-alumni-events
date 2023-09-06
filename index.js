const http = require('http');
const puppeteer = require('puppeteer');
//const fs = require('fs');
const port = process.env.PORT || 80;
(async () => {
	const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox','--disable-setuid-sandbox']
	});
	const page = await browser.newPage();
	try {
		await page.goto('https://fightonline.usc.edu/s/events');

		// event data, e.g. https://fightonline.usc.edu/s/sfsites/aura?r=6&other.PORTAL_Listing.SERVER_getListings=1

//		const firstResponse = await page.waitForResponse((response) => {
//			return response.url().endsWith('PORTAL_Listing.SERVER_getListings=1') && response.status() === 200;
//		});

//		const responsejson = await firstResponse.json();
//		console.log( "Started." );
//		const eventsjson = responsejson.actions[0].returnValue;
////		fs.writeFileSync('data/events.json', JSON.stringify(eventsjson));
//		console.log( eventsjson.length + " events found.");

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

		// select dropdown item for Asian Pacific Alumni Association
		page.waitForSelector('select[name="selectedtopicInterests"]')
			.then( () => {
				await page.select('select', 'Affinity: Asian Pacific');
				await page.click('button[data-aura-rendered-by="303:2;a"]');		
				const apaajson = false;
				// get a console log beginning with "result:"
				page.on('console', async (msg) => {
					if( msg.indexOf('result: ') == 0 ) {
						apaajson = msg.replace('result: q	test ','');
					}
				});

				http.createServer(function (req, res) {
					if( apaajson ) {
						res.writeHead(200, {'Content-Type': 'text/json'});
						res.end( apaajson );
					} else {
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end( 'false' );
					}
				}).listen( port );
				console.log( "Displayed JSON.");


		});



//		const baa = await page.select('#258:2;a', 'Affinity: Black');

//		const laa = await page.select('#258:2;a', 'Affinity: Latino/x');

//		const lambda = await page.select('#258:2;a', 'Affinity: LGBTQ');


	}  catch(err) {
		console.log(err);
	}

	await browser.close();
})();