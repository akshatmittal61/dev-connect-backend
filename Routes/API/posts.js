import express from "express";
import Post from "../../models/Post.js";
import Profile from "../../models/Profile.js";
import User from "../../models/User.js";
import auth from "../../middleware/auth.js";
import { check, validationResult } from "express-validator";
const router = express.Router();

router.post(
	"/",
	[auth, [check("text", "Text is required").not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const user = await User.findById(req.user.id).select("-password");
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});
			const post = await newPost.save();
			res.json(post);
		} catch (err) {
			console.log(err);
			res.status(500).send("Server Error");
		}
	}
);

router.get("/", auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

router.get("/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ message: "Post Not found" });
		res.json(post);
	} catch (err) {
		console.error(err);
		if (err.kind === "ObjectId")
			return res.status(404).json({ message: "Post Not found" });
		res.status(500).send("Server error");
	}
});

router.delete("/:id", auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ message: "Post Not found" });
		if (post.user.toString() !== req.user.id)
			return res.status(401).send("User not authorized");
		await post.remove();
		res.json({ message: "post removed" });
	} catch (err) {
		console.error(err);
		if (err.kind === "ObjectId")
			return res.status(404).json({ message: "Post Not found" });
		res.status(500).send("Server error");
	}
});

export default router;
