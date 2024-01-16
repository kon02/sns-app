const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const PORT = 3000;
const mongoose = require("mongoose");
require("dotenv").config();

//データベース接続
mongoose
    .connect("mongodb+srv://kon02:abc@cluster0.totaecx.mongodb.net/realsns?retryWrites=true&w=majority")//envがうまくいかない
    .then(() => {
        console.log("DBと接続中・・・");
    })
    .catch((err) => {
        console.log(err);
    });

//ミドルウェアの作成
app.use(express.json());//全てをjson形式で使うよ
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.get("/", (req, res) => {
    res.send("hello express");
});

app.listen(PORT, () => console.log("サーバーが起動しました。"));
