const express = require('express')
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser,  } = require('../db');
// getUserById < if we're able to tackle the stretch goals, we'd use this.
const jwt = require('jsonwebtoken');

const { requireUser } = require("./utils");

// jwt.sign({user}, process.env.JWT_SECRET)

// const token = jwt.sign({ id: 3, username: 'joshua' }, 'server secret');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users")
    
    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
})

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        const token = jwt.sign({ 
          id: user.id, 
          username
        }, process.env.JWT_SECRET, {
          expiresIn: '1w'
        });

        res.send({ message: "you're logged in!",
        token
      });
      
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

  usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }
  
      const user = await createUser({
        username,
        password,
        name,
        location,
      });
  
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });
  
      res.send({ 
        message: "thank you for signing up",
        token 
      });
    } catch ({ name, message }) {
      next({ name, message })
    } 
  });

  // usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
  //   try {
  //     console.log(req.params)
  //     const user = await getUserById(req.params.userId);
  
  //     if (user === ) {
  //       const updatedPost = await updatePost(, { active: false });
  
  //       res.send({ post: updatedPost });
  //     } else {
  //       // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
  //       next(post ? { 
  //         name: "UnauthorizedUserError",
  //         message: "You cannot delete a post which is not yours"
  //       } : {
  //         name: "PostNotFoundError",
  //         message: "That post does not exist"
  //       });
  //     }
  
  //   } catch ({ name, message }) {
  //     next({ name, message })
  //   }
  // });




module.exports = usersRouter;