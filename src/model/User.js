const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
    required: true
  },
  image: {
    type: String,
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.virtual('places', {
  ref: 'Place',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

UserSchema.virtual('images', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
