import express from "express";
import bodyParser from "body-parser";
const app = express();

app.get("/", (req, res) => {
	res.send("Hello world");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server strted at port ${PORT}`));
