const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    const {rows} = await client.query(
        `SELECT id, username, name, location, active 
        FROM users;
        `);

        return rows;
}
async function getAllPosts() {
    const {rows} = await client.query(
        `SELECT id, "authorId", title, content, active 
        FROM posts;
        `);

        return rows;
}

async function createUser({
    username, 
    password,
    name,
    location
}) {
    
    try {
        const { rows: [ user ] } = await client.query(`
            INSERT INTO users(username, password, name, location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
            ;
        `, [username, password, name, location]);
        return user
    } catch (error) {
        throw error;
    } 
}

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
        console.log(setString, 'setString')
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
        console.log(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `)
      const { rows: [user]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function createPost({
    authorId,
    title,
    content
  }) {
    try {
        const { rows: [ posts ] } = await client.query(`
            INSERT INTO posts(authorId, title, content)
            VALUES ($1, $2, $3)
            ON CONFLICT (authorId) DO NOTHING
            RETURNING *;
            ;
        `, [authorId, title, content]);
        return posts
  
    } catch (error) {
      throw error;
    }
  }

  async function updatePost(id, fields = {title, content, active}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
        console.log(setString, ' line 91 setString')
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
        console.log(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `)
      const { rows: [user]} = await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function getPostsByUser(userId) {
    try{
      const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE id=${ userId };
      `);
      console.log("this is the rows from 131", rows)
      return rows
    } catch (error) {
      throw error;
    }
  }

async function getUserById(userId) {
    try {
      const { rows:[user] } = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE id=${userId};
      `);

      if (user.length === 0) {
        return null;
      }
      else {
        delete user.password
        const { posts } = await getPostsByUser(userId)
        console.log("this is the userposts object", posts )

        return user;
      }

    } catch (error) {
      throw error;
    }

}


  
module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getUserById
}