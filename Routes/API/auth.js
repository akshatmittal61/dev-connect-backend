import express from "express";
const router = express.Router();
import auth from "../../middleware/auth.js";
import User from "../../models/User.js";
import bcrypt from 'bcrypt'
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ message: "Server Error" });
	}
});

router.post(
	"/",
	[
		check("email", "Please include a valid email").isEmail(),
		check("password", "Password is required").exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;
		try {
			let user = await User.findOne({ email });
			if (!user) {
				return res.status(500).json({
					erros: [{ message: "Invalid Credentials" }],
				});
			}
			const payload = {
				user: {
					id: user.id,
				},
			};
            const isMatch=bcrypt.compare(password,user.password)
            if(!isMatch){
				return res.status(500).json({
					erros: [{ message: "Invalid Credentials" }],
				});
            }
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
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjFmYzMyYzIwYWVlNjdlOGI1NTE0OTdhIn0sImlhdCI6MTY0MzkxODAxOCwiZXhwIjoxNjQ0Mjc4MDE4fQ.cQ5YgZZVlnw16Xtyv_NO4gAzjrsMjlTQ_-RcK-4SyGI
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjFmYzMyYzIwYWVlNjdlOGI1NTE0OTdhIn0sImlhdCI6MTY0MzkxODAxOCwiZXhwIjoxNjQ0Mjc4MDE4fQ.cQ5YgZZVlnw16Xtyv_NO4gAzjrsMjlTQ_-RcK-4SyGI
