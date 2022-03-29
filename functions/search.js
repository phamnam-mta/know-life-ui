/*
  This is a Netlify Function that proxies our Elasticsearch instance.
*/
import fetch from "node-fetch";
import https from "https";
import http from "http";

// Don't do this in production, this is in place to aid with demo environments which have self-signed certificates.
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const httpAgent = new http.Agent();

exports.handler = function(event, context, callback) {
  const host = 'http://127.0.0.1:5000';
  const agent = host.startsWith("http:") ? httpAgent : httpsAgent;

  //fetch(`${host}/medical_test_suggestion`, {
  fetch(`${host}/semantic_search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: event.body,
    agent
  })
    .then(response => response.text().then(body => [response, body]))
    .then(([response, body]) => {
      callback(null, {
        statusCode: response.status,
        body: body
      });
    })
    .catch(e => {
      console.error(e);
      callback(null, {
        statusCode: 500,
        body: `An error occurred: ${e}`
      });
    });
};
