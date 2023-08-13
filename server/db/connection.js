const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
mongoose.set("strictQuery", false);
const username = encodeURIComponent(process.env.MONGO_DB_USER);
const password = encodeURIComponent(process.env.MONGO_DB_PASS);
const mongoDBURL = `mongodb+srv://${username}:<password>@cluster0.mug6fr1.mongodb.net/?retryWrites=true&w=majority`;
const mongoDBURL_priv = `mongodb+srv://${username}:${password}@cluster0.mug6fr1.mongodb.net/?retryWrites=true&w=majority`;

const debug = require("debug")("server:server");

console.log(process.env.NODE_ENV);
// console.debug ("env is", process.env);

let dbName = process.env.MONGO_DB_NAME
if ("test" === process.env.NODE_ENV)
  dbName = process.env.MONGO_TEST_DB_NAME
if ("dev" === process.env.NODE_ENV)
  dbName = process.env.MONGO_DEV_DB_NAME

console.debug("database name", dbName);
mongoose
  .connect(mongoDBURL_priv, {
    dbName: dbName,
    /* ssl: true,
    sslValidate: true,
    sslCA: `${__dirname}/rootCA.pem`,
    authMechanism: 'MONGODB-X509' */
  })
  .then(() => debug(`Connected to MongoDB at ${mongoDBURL}`))
  .catch((err) => {
    debug(err);
    process.exit(1);
  });

mongoose.connection.on("close", () =>
  debug(`Closed connection to ${mongoDBURL}`)
);

const store = MongoStore.create({
  client: mongoose.connection.getClient(),
  dbName: "mongo_store",
  collectionName: "sessions",
});
/* // FIXME see solution to log even after tests   
  .on('create', () => debug("A session has been created"))
  .on('update', () => debug("A session has been updated"))
  .on('destroy', () => debug("A session has been destroyed")) */

exports.mongoose = mongoose;
exports.MongoStore = store;
