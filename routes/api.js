/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
function convertObjId(str,res){
  try {str = ObjectId(str)
      return ObjectId(str)
      }
  catch(e){res.json({message: "id is invalid"})}
}
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
mongo.connect(CONNECTION_STRING,(err, client) => {
  if (err){ console.log("Database connection failed")}
  else {
    console.log("connect to database succsessfully");
    
    var collection = client.db("testdb").collection('issuetracker');

    app.route('/api/issues/:project')
  
    .get(function (req, res){//get issue
      var project = req.params.project;
      console.log(project);
      collection.find({project: project}).toArray( (err, doc) =>{
        console.log(doc);
      res.json(doc);
      })
      // res.json({message: "linh"});
    })
    
    .post(function (req, res){//create issue
      var project = req.params.project;
      collection.insertOne({project: project, issue_title: req.body.issue_title, issue_text: req.body.issue_text,
                            created_on: Date.now, updated_on: Date.now, created_by: req.body.created_by || "",
                            assigned_to: req.body.assigned_to || "",open: req.body.open || "true", status_text: req.body.status_text || ""}, 
                           (err, doc) => {
                                  res.json(doc.ops[0]);
                              })
                            })
    
    .put(function (req, res){// update issue
          var project = req.params.project;
          let body = req.body;
          let newBody = {}
          let id = convertObjId(req.body._id,res);
          Object.keys(body).map((key) =>{
            if(key == "open" || body[key] && key != "_id"){
              newBody[key] = body[key];
            }
          })
      
      if (newBody != {}){
        collection.findAndModify(
          {_id: id},
          [['_id', 'asc']],
          {$set:newBody},
          {new: true},(err, doc) => {
            if (err){
              res.json({message: err})
            }
            else if(doc.value == {}){
              res.json({message: "document not found"})
            }
            else{
                res.json(doc.value);
            }
        })
      }
      else{
        res.json({message:"nothing to be modified"})
      }
    })
    app.route('/api/issues/:project/delete')
        .post(function (req, res){// delete issue
              var project = req.params.project;
              let id      = convertObjId(req.body._id, res)
              if(id){
                  collection.deleteOne({_id: id},(err,doc) => {
                  res.json({message: "to linh"})
                })
              }

        });  
      }
  })
};
