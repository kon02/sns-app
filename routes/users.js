const User = require("../models/User");
const router = require("express").Router();

//CRUD
//ユーザー情報の更新
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("ユーザー情報が更新されました。");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        return res.status(403).json("あなたは自分のアカウントの時だけ情報を更新できます。");
    }
});

//ユーザー情報の削除
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("ユーザー情報が削除されました。");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        return res.status(403).json("あなたは自分のアカウントの時だけ情報を更新できます。");
    }
});

//ユーザー情報の取得
router.get("/:id", async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            const { password, updatedAt, ...other } = user._doc;//パスワードの漏洩防止、分割代入
            res.status(200).json(other);
        } catch (err) {
            return res.status(500).json(err);
        }
    });

//ユーザーのフォロー
router.put("/:id/follow", async (req, res) => {//この:idはフォローされる側のid
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);//相手の情報
            const currentUser = await User.findById(req.body.userId);//自分の情報

            if(!user.followers.includes(req.body.userId)) {//フォロワーに自分がいなかったら追加
                await user.updateOne({
                    $push: {
                        followers: req.body.userId,
                    },
                });
                await currentUser.updateOne({
                    $push: {
                        followings: req.params.id,
                    },
                });
                return res.status(200).json("フォローに成功しました。");
            } else {
                return res.status(403).json("あなたはこのユーザーを既にフォローしています。");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(500).json("自分自身をフォローできません。");
    }
});


//ユーザーのフォロー解除
router.put("/:id/unfollow", async (req, res) => {//この:idはフォローされる側のid
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);//相手の情報
            const currentUser = await User.findById(req.body.userId);//自分の情報

            if(user.followers.includes(req.body.userId)) {//フォロワーに自分がいたら削除
                await user.updateOne({
                    $pull: {
                        followers: req.body.userId,
                    },
                });
                await currentUser.updateOne({
                    $pull: {
                        followings: req.params.id,
                    },
                });
                return res.status(200).json("フォロー解除に成功しました。");
            } else {
                return res.status(403).json("あなたはこのユーザーをフォローしていません。");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(500).json("自分自身をフォロー解除できません。");
    }
});


// router.get("/", (req, res) => {
//     res.send("user router");
// });

module.exports = router;//継承