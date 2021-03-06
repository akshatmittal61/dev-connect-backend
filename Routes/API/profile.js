import express from "express";
import { check, validationResult } from "express-validator";
import User from "../../models/User.js";
import auth from "../../middleware/auth.js";
import Profile from "../../models/Profile.js";
import request from "request";
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

router.delete("/", auth, async (req, res) => {
	try {
		await Profile.findOneAndRemove({ user: req.user.id });
		await User.findOneAndRemove({ _id: req.user.id });
		res.json({ message: "User deleted" });
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
	}
});

router.put(
	"/experience",
	[
		auth,
		[
			check("title", "Title is required").not().isEmpty(),
			check("company", "Company is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}
		const { title, company, location, from, to, current, description } =
			req.body;
		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};
		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.experince.unshift(newExp);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server Error");
		}
	}
);

router.delete("/experience/:exp_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		const remIndex = profile.experince
			.map((exp) => exp.id)
			.indexOf(req.params.exp_id);
		profile.experince.splice(remIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
	}
});

router.put(
	"/education",
	[
		auth,
		[
			check("school", "school is required").not().isEmpty(),
			check("degree", "degree is required").not().isEmpty(),
			check("fieldOfStudy", "fieldOfStudy is required").not().isEmpty(),
			check("from", "From date is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ error: errors.array() });
		}
		const { school, degree, fieldOfStudy, from, to, current, description } =
			req.body;
		const newEdu = {
			school,
			degree,
			fieldOfStudy,
			from,
			to,
			current,
			description,
		};
		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.education.unshift(newEdu);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server Error");
		}
	}
);

router.delete("/education/:exp_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		const remIndex = profile.education
			.map((exp) => exp.id)
			.indexOf(req.params.exp_id);
		profile.education.splice(remIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
	}
});

router.get("/github/:username", async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`,
			method: "GET",
			headers: { "user-agent": "node.js" },
		};
		request(options, (error, response, body) => {
			if (error) console.error(error);
			if (response.statusCode != 200) {
				return res.status(404).json({
					message: `No github profile found for ${req.params.username}`,
				});
			}
			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.log(err);
		res.status(500).send("Server Error");
	}
});

export default router;
