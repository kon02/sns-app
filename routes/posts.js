const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { updateOne } = require("../models/User");


//投稿を作成
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        return res.status(200).json(savedPost);
    } catch (err) {
        return res.status(500).json(err);
    }
});

//投稿を編集する
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);//ユーザーの投稿情報
        if(post.userId === req.body.userId){
            await post.updateOne({
                $set: req.body,
            });
            return res.status(200).json("投稿編集に成功しました。")
        } else {
            return res.status(403).json("あなたは他のユーザーの投稿を編集できません。")
        }
    } catch (err) {
        return res.status(403).json(err);
    }
});

//投稿を削除する
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);//ユーザーの投稿情報
        if(post.userId === req.body.userId){
            await post.deleteOne();
            return res.status(200).json("投稿削除に成功しました。")
        } else {
            return res.status(403).json("あなたは他のユーザーの投稿を削除できません。")
        }
    } catch (err) {
        return res.status(403).json(err);
    }
});

//投稿を取得する
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);//ユーザーの投稿情報
        return res.status(200).json(post);
    } catch (err) {
        return res.status(403).json(err);
    }
});

module.exports = router;//継承

//投稿のいいね機能
router.put("/:id/like", async (req, res) => {//この:idは投稿記事のid
        try {
            const post = await Post.findById(req.params.id);//投稿情報
            if(!post.likes.includes(req.body.userId)) {//投稿に自分のいいねがなかったら
                await post.updateOne({
                    $push: {
                        likes: req.body.userId,
                    },
                });
                return res.status(200).json("いいねに成功しました。");
            } else {
                await post.updateOne({
                    $pull: {
                        likes: req.body.userId,
                    }
                });
                return res.status(403).json("いいねを取り消しました。");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    });

    //タイムラインの投稿(自分の投稿&フォローユーザーの投稿)を全て取得
    router.get("/timeline/all", async (req, res) => {
        try{
            const myUser = await User.findById(req.body.userId);//自分の情報
            const userPosts = await Post.find({ userId: myUser._id});//自分の投稿を全て取得
            //自分がフォローしている人の投稿を全て取得
            const friendsPost = await Promise.all(
                myUser.followings.map((firendId) => {
                    return Post.find({ userId: firendId});//フレンドの投稿を1人ずつ全て取得
                })
            );
            return res.status(200).json(userPosts.concat(...friendsPost));
        } catch (err) {
            res.status(500).json(err);
        }
    });