

// routes/posts.route.js

const express = require("express");
const { Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res) => {
    
    const { userId } = res.locals.user
    const { username } = res.locals.user   
    const { title, content } = req.body;



    if ((!title) || (!content)) {
      return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    } 

    const post = await Posts.create({
      
      UserId : userId,
      username : username,
      title,
      content,
    });
    return res.status(201).json({ data: post });
  });


// 게시글 목록 조회
router.get("/posts", async (req, res) => {

    const post = await Posts.findAll({
        attributes: ["title", "username", "content", "createdAt"],
        
  });

    return res.status(200).json({ data: post.sort(function(a,b) {

    return new Date(a.plantingDate) - new Date(b.plantingDate)

  }) });
  
});

// 게시글 상세 조회
router.get("/posts/:postId",authMiddleware,  async (req, res) => {

    const { postId } = req.params;
    const post = await Posts.findOne({
      attributes: ["postId", "title","username", "content", "createdAt", "updatedAt"],
      where: { postId }
    });
  
    return res.status(200).json({ data: post });
  });

const { Op } = require("sequelize");

// 내용 수정
router.put('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { username } = res.locals.user
    const { title, content} = req.body;

    if ((!title) || (!content)) {
      return res.status(412).json({ message: '데이터 형식이 올바르지 않습니다.' });
    } 

    const post = await Posts.findOne({ where: { postId} }); // postId 기준으로 게시글 검색 
    if (!post) {
      return res.status(412).json({ message: '게시글이 존재하지 않습니다.' });
    } 
    if (post.username !==username) {
    
        return res.status(412).json({ message: '수정 권한이 없습니다.' });
    } 
  
    // 모든 조건을 통과하였다면, 
    await Posts.update(
      { title, content },
      {
        where: { postId}

        //where: { // 한번더 postId 및 password를 검증하여 안전하게 게시글을 수정하려고함
        //  [Op.and]: [{ postId }, [{ password }]],
          // 일반적으로 seq.where절은 문자열, 숫자열 기반으로 조건을 설정하여 데이터 검색을 하게 하지만
          // seq.op은 데이터 검증을 할 수 있는 조건을 추가할 수 있게 해준다. 
          // 객체 형태가 아닌 배열 형태로 쓸 경우 : 
        //}
      }
    );
  
    res.status(200).json({ data: "게시글이 수정되었습니다." });
  });


// 내용 삭제 

router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { username } = res.locals.user

    if (!postId) {
      return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    } 


    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }
    if (post.username !==username) {
      
      return res.status(404).json({ message: '삭제 권한이 없습니다.' });
  } 

    await Posts.destroy({ where: { postId, username } });

    res.status(200).json({ data: "게시글이 삭제되었습니다." });

});


module.exports = router;
