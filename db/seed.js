const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createPost,
} = require("./index");

async function dropTables() {
  try {
    console.log("starting to drop tables..");

    await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("starting to create tables...");
    await client.query(`
            CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            active boolean DEFAULT true
            );
            CREATE TABLE posts (
              id SERIAL PRIMARY KEY,
              "authorId" INTEGER REFERENCES users(id),
              title varchar(255) NOT NULL,
              content TEXT NOT NULL,
              active boolean DEFAULT true
            );
            CREATE TABLE tags (
              id SERIAL PRIMARY KEY,
              name varchar(255) UNIQUE NOT NULL
            )
            CREATE TABLE post_tags (
              "postId" INTEGER REFERENCES posts(id),
              "tagId" INTEGER REFERENCES tags(id),
              UNIQUE ("postId", "tagId")
            )`);

    console.log("Finishing building tables");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "Albert First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them.",
    });

    await createPost({
      authorId: sandra.id,
      title: "Sandra First Post",
      content: "Hi my name is Sandra. I love icecream. I eat it all the time.",
    });

    await createPost({
      authorId: glamgal.id,
      title: "Glamgal First Post",
      content: "Heloo my friends.",
    });
  } catch (error) {
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({
      username: "albert",
      password: "bertie99",
      name: "Al Bert",
      location: "Sidney Australia",
    });

    await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "just sandra",
      location: `ain't tellin'`,
    });

    await createUser({
      username: "glamgal",
      password: "soglam",
      name: "ruby",
      location: "texas",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}


rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
