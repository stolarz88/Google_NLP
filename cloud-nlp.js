'use strict';

const fs = require('fs');
const ndjson = require('ndjson');
const request = require('request');

fs.createReadStream('jan-brady.json') // Newline delimited JSON file
  .pipe(ndjson.parse())
  .on('data', function(obj) {

	  let text = obj.body;

		let nlRequestUri = "https://language.googleapis.com/v1/documents:annotateText?key=AIzaSyAIt1gdOvMBOQ2PderKx1bgFdezH5a69hU";

		let nlReq = {
		  	"document": {
		  		"content": text,
		  		"type": "PLAIN_TEXT"
		  	},
		  	"features": {
		  		"extractSyntax": true,
		  		"extractEntities": true,
		  		"extractDocumentSentiment": true
		  	}
		  }
		let reqOptions = {
			  url: nlRequestUri,
			  method: "POST",
			  body: nlReq,
			  json: true
		  }

		request(reqOptions, function(err, resp, respBody) {
			if (!err && resp.statusCode == 200) {

				if (respBody.language === 'en') {
          
					let row = {
						sentiment_score: respBody.documentSentiment.score,
						magnitude: respBody.documentSentiment.magnitude,
						//entities: respBody.entities,
						//tokens: respBody.tokens,
						text: text,
						comment_score: parseInt(obj.score),
						created: obj.date_posted
					}
          // Newline delimited JSON because that's the format we need to upload to BigQuery
					fs.appendFileSync('jan-brady-compiled.json', JSON.stringify(row) + '\n'); 

				}
			} else {
				console.log('nl api error err', resp);
			}
		});
  });