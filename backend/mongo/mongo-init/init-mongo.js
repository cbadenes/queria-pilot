db = db.getSiblingDB('mydatabase');

db.createUser({
  user: "myuser",
  pwd: "mypassword",
  roles: [
    {
      role: "readWrite",
      db: "mydatabase"
    }
  ]
});

db.createCollection('mycollection');
