// server.js
const express = require("express");
const server = express();
const db = require("./db");
const cors = require('cors');
server.use(cors({ origin: true }));

const body_parser = require("body-parser");

// parse JSON (application/json content-type)
server.use(body_parser.json());

const port = 4000;

// << db setup >>

const dbName = "luisadb";
const collectionName = "clients";

const MongoClient = require("mongodb").MongoClient;

const dbConnectionUrl ="mongodb+srv://db_user_reto:2evcbXg0eMZz0rHe@cluster0.n5ykm.mongodb.net/luisadb?retryWrites=true&w=majority";


db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
   // get all items
   dbCollection.find().toArray(function (err, result) {
      if (err) throw err;
      console.log(result);

      // << return response to client >>
   });

   // << db CRUD routes >>
   server.post("/items", (request, response) => {
      const item = request.body;
      dbCollection.insertOne(item, (error, result) => { // callback of insertOne
         if (error) throw error;
         // return updated list
         dbCollection.find().toArray((_error, _result) => { // callback of find
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

   server.get("/items/:name", (request, response) => {
      const itemId = request.params.name;

      dbCollection.findOne({ name: itemId }, (error, result) => {
         if (error) throw error;
         // return item
         response.json(result);
      });
   });

   server.get("/items", (request, response) => {
      // return updated list
      dbCollection.find().toArray((error, result) => {
         if (error) throw error;
         response.json(result);
      });
   });

   server.put("/items/:name", (request, response) => {
      const itemId = request.params.name;
      const item = request.body;
      console.log("Editing item: ", itemId, " to be ", item);

      dbCollection.updateOne({ id: itemId }, { $set: item }, (error, result) => {
         if (error) throw error;
         // send back entire updated list, to make sure frontend data is up-to-date
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

   server.delete("/items/:name", (request, response) => {
      const itemId = request.params.name;
      console.log("Delete item with name: ", itemId);

      dbCollection.deleteOne({ name: itemId }, function (error, result) {
         if (error) throw error;
         // send back entire updated list after successful request
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });

}, function (err) { // failureCallback
   throw (err);
});

server.listen(port, () => {
   console.log(`Server listening at ${port}`);
});