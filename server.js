import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { config } from "dotenv";
import apiUsers from "./Routes/API/users.js";
import apiAuth from "./Routes/API/auth.js";
import apiProfile from "./Routes/API/profile.js";
import apiPosts from "./Routes/API/posts.js";
const app = express();

config();
app.use(bodyParser.json());

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_CONNECTION_STRING, (err) => {
			if (err) console.log(err);
			else console.log("MongoDB Connection successful");
		});
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};
connectDB();

app.get("/", (req, res) => {
	res.send("Hello world");
});

app.use("/api/users", apiUsers);
app.use("/api/auth", apiAuth);
app.use("/api/profile", apiProfile);
app.use("/api/posts", apiPosts);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
