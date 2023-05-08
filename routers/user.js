const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../database/models/user");

let refreshTokens = [];

router.post('/signup', async (req, res, next) => {
    try {
        const { username, password } = req.body;
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({
          username,
          password: hashedPassword
        });
    
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
    
        res.status(200).send({ accessToken, refreshToken, username: user.username });
      } catch (error) {
        if(error.code === 11000) {
          res.sendStatus(400);
        }
        else{
          next(error);
        }
        
      }
});

router.post("/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
  
      const user = await User.findOne({ username });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.status(200).send({ accessToken, refreshToken, username: user.username });  
      } else res.sendStatus(403);
    } catch (error) {
      next(error);
    }
  });
  
router.post('/token', (req, res, next) => {
    try {
        const refreshToken = req.body.token;
        if(!refreshToken) return res.sendStatus(401);
        if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) res.sendStatus(401);
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
        const newRefreshToken = generateRefreshToken({_id: user.userId })
        const accessToken = generateAccessToken({_id: user.userId });
        res.json({ accessToken, refreshToken: newRefreshToken })
        })
    } catch (error) {
        next(error);
    }
})

router.delete('/logout', (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if(!refreshToken) throw new Error("No token provided");
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
})

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if(err) return res.sendStatus(403);
      req.user = user;
      next();
    })
}

function generateAccessToken(user) {
    return jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
}

function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

module.exports = { userRouter: router, authToken };
