import express from "express";
import auth from "../../middleware/auth.js";
import User from "../../models/User.js";
import Profile from "../../models/Profile.js";
const router = express.Router();

router.get("/me", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			"user",
			["name", "avatar"]
		);
		if (!profile) {
			return res
				.status(400)
				.json({ message: "There is no profile for this user" });
		}
		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("server error");
	}
});

export default router;
