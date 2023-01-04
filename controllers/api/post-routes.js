const router = require('express').Router();
const { Post, User, Comment } = require('../../models/');
const withAuth = require('../../utils/auth');

//route to get blog by id
router.get('/:id', withAuth, async (req, res) => {
  try {
    //find blog by query param
    const postData = await Post.findOne({
      where: { id: req.params.id },
      include: [
        //include comments and user data
        {
          model: User,
          attributes: { exclude: ['password'] },
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: { exclude: ['password'] },
            },
          ],
        },
      ],
    });
    const post = postData.get({ plain: true });
    //respond with the data
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

//new post route uses session data for user_id and request body

//update route for post
router.patch('/:id', withAuth, async (req, res) => {
  try {
    const postData = await Post.update(
      //update contents
      { contents: req.body.contents },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    //respond
    res.status(200).json(postData);
  } catch (error) {
    res.status(500).json(error);
  }
});

//delete post route
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const response = await Post.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(204).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/createPost', withAuth, (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { title, description } = req.body;

    const postObj = {
      title,
      description,
      user_id,
    };

    const postRes = Post.create(postObj);

    if (postRes) return res.status(200).json({ message: 'Post created!' });
    return res.status(400).json({ message: 'Error in post creation' });
  } catch (error) {
    res.status(500).json({ message: 'Error in post creation' });
  }
});

module.exports = router;
