const { MongoClient } = require("mongodb");

async function main() {
  const uri =
    "mongodb+srv://TravelBuddy:fmtt142bB0hZ9e5T@travelbuddy.rauqxko.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    // Use the 'travel' database
    const db = client.db("travel");

    // Create collections
    await db.createCollection("drivers");
    await db.createCollection("vehicles");

    console.log("Collections created!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
