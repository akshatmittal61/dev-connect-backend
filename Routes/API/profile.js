import express from "express";
import { check, validationResult } from "express-validator";
import User from "../../models/User.js";
import auth from "../../middleware/auth.js";
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

router.post(
	"/",
	[
		auth,
		[
			check("status", "Status is required").not().isEmpty(),
			check("skills", "Skills are required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const {
			company,
			website,
			location,
			bio,
			status,
			githubUsername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubUsername) profileFields.githubUsername = githubUsername;
		if (skills) {
			profileFields.skills = skills
				.split(",")
				.map((skill) => skill.trim());
		}
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;
		try {
			let profile = await Profile.findOne({ user: req.user.id });
			if (profile) {
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err);
			res.status(500).send("Server error");
		}
		res.send("Hello");
	}
);

router.get("/", async (req, res) => {
	try {
		const profiles = await Profile.find().populate("user", [
			"name",
			"avatar",
		]);
		res.json(profiles);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server Error");
	}
});

router.get("/user/:user_id", async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate("user", ["name", "avatar"]);
		if (!profile)
			res.status(400).json({
				message: "Profile not found",
			});
		res.json(profile);
	} catch (err) {
		console.log(err.message);
		if (err.kind === "ObjectId") {
			res.status(400).json({
				message: "Profile not found",
			});
		}
		res.status(500).send("Server Error");
	}
});

export default router;
