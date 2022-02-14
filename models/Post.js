import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
	user: {
		type: Schems.types.ObjectId,
		ref: "users",
	},
	text: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
	avatar: {
		type: String,
	},
	likes: [
		{
			user: {
				type: Schema.types.ObjectId,
				ref: "users",
			},
		},
	],
	comments: [
		{
			user: {
				type: Schema.types.ObjectId,
				ref: "users",
			},
			text: {
				type: String,
				required: true,
			},
			name: {
				type: String,
			},
			avatar: {
				type: String,
			},
			date: {
				type: Date,
				default: Date.now,
			},
		},
	],
	date: {
		type: Date,
		default: Date.now,
	},
});

const Post = new mongoose.model("Post", PostSchema);
export default Post;
