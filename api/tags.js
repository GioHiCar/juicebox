const express = require('express')
const tagsRouter = express.Router()
const { getAllTags, getPostsByTagName } = require('../db')

tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
      tags
  });
})

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    // read the tagname from the params
    
    const { tagName } = req.params
    try {
      // use our method to get posts by tag name from the db
        const allPosts = await getPostsByTagName(tagName)
        const publicPosts = allPosts.filter(post => {
          return post.active || (req.user && post.author.id === req.user.id);
        });
      // send out an object to the client { posts: // the posts }
      res.send({publicPosts: publicPosts})
    } catch ({ name, message }) {
      next({ name, message });
    }
  });


module.exports = tagsRouter