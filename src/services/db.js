var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;

var DbConnection = function () {
  var db = null;

  async function DbConnect() {
    try {
      let url = process.env.DATABASE_URL;
      let _db = await MongoClient.connect(url, { reconnectTries: 10, reconnectInterval: 2000 });

      return _db.db("frux-smart-contract");
    } catch (e) {
      return e;
    }
  }

  async function Get() {
    try {
      if (db != null) {
        console.log(`db connection is already alive`);
        return db;
      } else {
        console.log(`getting new db connection`);
        db = await DbConnect();
        return db;
      }
    } catch (e) {
      return e;
    }
  }

  async function insertUser(address, privateKey) {
    let _db = await Get();

    let collection = _db.collection("users");
    let user = await collection.insertOne({
      address,
      privateKey,
    });
    user = user.ops[0];
    user.id = user._id;
    delete user._id;
    return user;
  }

  async function findUser(id) {
    let _db = await Get();

    let collection = _db.collection("users");
    let user = await collection.findOne(new ObjectId(id));
    if (user) {
      user.id = user._id;
      delete user._id;
    }
    return user;
  }

  async function insertProject(txHash, id, stagesCost, ownerAddress, reviewerAddress) {
    let _db = await Get();

    let collection = _db.collection("projects");
    let projects = await collection.insertOne({
      _id: txHash,
      projectId: id,
      stagesCost,
      ownerAddress,
      reviewerAddress
    });
    projects = projects.ops[0];
    projects.txHash = projects._id;
    delete projects._id;
    return projects;
  }

  async function findProject(txHash) {
    let _db = await Get();

    let collection = _db.collection("projects");
    let project = await collection.findOne({_id: txHash});
    if (project) {
      project.txHash = project._id;
      delete project._id;
    }
    return project;
  }


  return {
    Get,
    insertUser,
    findUser,
    insertProject,
    findProject
  };
};

module.exports = DbConnection();
