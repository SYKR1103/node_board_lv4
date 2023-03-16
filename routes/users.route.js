// routes/users.route.js

const express = require("express");
const { Users } = require("../models");
const router = express.Router();
const validator = require('validator');
const jwt = require("jsonwebtoken");

// 회원가입
router.post("/register", async (req, res) => {


    try {

        const { email, username, password, password_check } = req.body;
        const isExistUser = await Users.findOne({ where: { username } });
    
        if (isExistUser) {
            return res.status(412).json({ message: "이미 존재하는 닉네임입니다." });
        }

        // 닉네임 확인
        if ((validator.matches(username , '[^a-zA-Z0-9]')) || (username.length <3)) {
            res.status(412).json({
                errorMessage: "닉네임을 3자 이상, 알파벳 대소문자 및 숫자로만 구성해주세요.",
                });
                return;
                
            } 


        // 비밀번호 확인
        if ((password.includes(username)) || (password.length <4)) {
            res.status(412).json({
                errorMessage: "비밀번호는 최소 4자 이상이어야 하며, 닉네임과 같은 값이 포함되면 안됩니다",
                });
                return;
        } 

        // 비밀번호 재확인
        if (password !== password_check) {
            res.status(412).json({
                errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
            });
            return;
            }

          // Users 테이블에 사용자를 추가합니다.
        const user = await Users.create({ email, password, username });
        // UserInfos 테이블에 사용자 정보를 추가합니다.

        return res.status(201).json({ message: "회원가입이 완료되었습니다." });

        } catch(err) {

            res.status(412).json({
                errorMessage: "요청하신 데이터 형식이 올바르지 않습니다.",
            });
            return;
            }
        })




// 로그인
router.post("/login", async (req, res) => {

    try{
        const { username, password } = req.body;
        const user = await Users.findOne({ where: { username } });
        if (!user) {
            return res.status(412).json({ message: "존재하지 않는 회원입니다." });
        } else if (user.password !== password) {
            return res.status(412).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        const token = jwt.sign({
            userId: user.userId
        }, "customized_secret_key");
        res.cookie("authorization", `Bearer ${token}`);
        return res.status(200).json({ message: "로그인 성공" });
    } catch(err) {

        res.status(412).json({
            errorMessage: "로그인에 실패하였습니다.",
        });
        return;
        }

    });



// 사용자 목록조회
router.get("/users", async (req, res) => {

    const user = await Users.findAll({
      attributes: ["userId", "username", "email", "createdAt", "updatedAt"],
    });
  
    return res.status(200).json({ data: user });
  });



// 사용자 조회
router.get("/users/:userId", async (req, res) => {
    const { userId } = req.params;
  
    const user = await Users.findOne({
      attributes: ["userId", "username", "email", "createdAt", "updatedAt"],
      where: { userId }
    });
  
    return res.status(200).json({ data: user });
  });


module.exports = router;