'use strict';

const express = require('express');
const validUrl = require('valid-url');
const mongodb = require('mongodb');
const assert = require('assert');

const port = process.env.PORT || 8080;

const website = process.cwd() + '/public';

var mongoClient = mongodb.MongoClient;
var mongodbUri = process.env.MONGO_URI;

var app = express();


app.use(express.static(process.cwd() + '/views'));
app.use('/public', express.static(process.cwd() + '/public'));

app.get("/new/*", (request, response) => {


  var   query = {number: undefined, url: request.params[0]};

  if (!validUrl.isWebUri(query.url))
    response.json({
      "url": query.url,
      "error": "This url is invalid syntactically.",
    });

  else
      fetchByValue(response, query, newResponse);
});

app.get("/:id([0-9]+)", (request, response) => {


  var   query = {number: Number(request.params.id), url: undefined};

  fetchByKey(response, query, lookupResponse);
});

app.set('json spaces', 2);

app.listen(port,  function () {
  console.log('Node.js listening on port ' + port + '...');
});

// ----

function newResponse (response, query, docs) {
  if (docs.length == 0) {
    query.number = Math.floor((Math.random() * (10000 - 1000)) + 1000);

    fetchByKey(response, query, insertnewUrl);
  }
  else {
    query.number = docs[0].number;

    insertResponse(response, query);
  }
}


function insertnewUrl (response, query, docs) {
  if (docs.length == 0) {
    insertKeyAndValue (response, query, insertResponse);
  }
  else {
    query.number = Math.floor((Math.random() * (10000 - 1000)) + 1000);

    fetchByKey (response, query, insertnewUrl);
  }
}


function lookupResponse (response, query, docs) {
  if (docs.length == 0) {
    response.json({
      "key": query.number,
      "error": "This key is not in the database.",
    });
  }
  else {
    query.url = docs[0].url;

    response.redirect(query.url);
  }
}


function insertResponse (response, query) {
  response.json({
    "original_url": query.url,
    "short_url": "https://url-shortener-microservice-pa.glitch.me/" + query.number,
  });
}

function fetchByKey (response, query, callback) {
  mongoClient.connect(mongodbUri, (err, database) => {
    assert.equal(null, err);

    database.db('shorturls').collection('shorts').find(
      {number: {$eq : query.number}}).toArray((err, docs) => {
        assert.equal(null, err);

        callback(response, query, docs);

        database.close();
      });
  });
}


function fetchByValue (response, query, callback) {
  mongoClient.connect(mongodbUri, (err, database) => {
    assert.equal(null, err);

    database.db('shorturls').collection('shorts').find(
      {url: {$eq : query.url}}).toArray((err, docs) => {
        assert.equal(null, err);

        callback(response, query, docs);

        database.close();
      });
  });
}


function insertKeyAndValue (response, doc, callback) {
  mongoClient.connect(mongodbUri, (err, database) => {
    assert.equal(null, err);

    database.db('shorturls').collection('shorts').insertOne(
      doc, (err, documents) => {
        assert.equal(null, err);

        console.log(JSON.stringify(doc));

        callback(response, doc);

        database.close();
        });
  });
}
