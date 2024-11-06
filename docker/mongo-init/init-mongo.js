db = db.getSiblingDB('queria');

db.createUser({
  user: "myuser",
  pwd: "mypassword",
  roles: [
    {
      role: "readWrite",
      db: "queria"
    }
  ]
});

db.createCollection('users');
db.createCollection('questionnaires');
db.createCollection('questions');
