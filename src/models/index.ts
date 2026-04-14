import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  content: string;
  imageUrl?: string;
  imagePublicId?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  reports: number;
  hidden: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imagePublicId: {
      type: String,
      trim: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      default: 0,
      index: true,
    },
    reports: {
      type: Number,
      default: 0,
      min: 0,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ reports: -1, createdAt: -1 });

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export interface IFeedback extends Document {
  message: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    message: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
