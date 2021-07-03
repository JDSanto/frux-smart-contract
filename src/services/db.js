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
      address: address,
      privateKey: privateKey,
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

  return {
    Get: Get,
    insertUser: insertUser,
    findUser: findUser,
  };
};

module.exports = DbConnection();
