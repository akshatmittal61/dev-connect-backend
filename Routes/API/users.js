import express from "express";
const router = express.Router();
import { check, validationResult } from "express-validator";
import User from "../../models/User.js";
import gravatar from "gravatar";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

router.post(
	"/",
	[
		check("name", "Name is required").not().isEmpty(),
		check("email", "Please include a valid email").isEmail(),
		check(
			"password",
			"Please enter a password with at least 6 characters"
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, email, password } = req.body;
		try {
			let user = await User.findOne({ email });
			if (user) {
				return res.status(500).json({
					erros: [{ message: "User already exists" }],
				});
			}
			const avatar = gravatar.url(email, {
				s: "200",
				r: "pg",
				d: "mm",
			});
			user = new User({ name, email, avatar, password });
			user.password = await bcrypt.hash(password, 10);
			await user.save();
			const payload = {
				user: {
					id: user.id,
				},
			};
			jwt.sign(
				payload,
				process.env.JWT_SECRET,
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server Error");
		}
	}
);

export default router;
