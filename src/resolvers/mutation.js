const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
require('dotenv').config();
const gravatar = require('gravatar');



module.exports = {

  newNote: async (parent, args, { models, user }) => {
    // if there is no user throw an authentication error
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }
    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id)
    });
  },

  deleteNote: async (parent, { id }, { models, user }) => {

    // if no user throw athontication error
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }
    // NOTE: await is should be there. return undefine if is not await becuse js single thread , event loop 
    // is going to next task.
    // find the note
    const note = await models.Note.findById(id);

    // if the note owner and current user don't match, throw a forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to delete the note");
    }


    try {
      // if every thing check out, remove the note
      await note.remove();
      return true;
    } catch (err) {
      // if there's an error along the way, return false
      return false;
    }
  },
  updateNote: async (parent, { id, content }, { models, user }) => {

    // if no user throe authentication error
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }

    // find the note
    const note = await models.Note.findById(id);

    // if the note owner and current user don't match, throw a forbidden error
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permissions to update the note");
    }
    // Update the note in the db and return the updated note

    return await models.Note.findOneAndUpdate(
      {
        _id: id,
      }, {
      $set: { content }
    }, {
      new: true
    }
    );
  },

  signUp: async (parnet, { username, email, password }, { models }) => {



    // normalization email
    email = email.trim().toLowerCase();

    // hash the password
    const hashed = await bcrypt.hash(password, 10);


    // create gravatar url
    const avatar = gravatar.url(email);

    try {

      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed

      });

      // create and return the json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    } catch (err) {
      console.log(err);
      // if there's a problem creating the account, throw an error
      throw new Error('Error creating account');
    }

  },

  signIn: async (parent, { username, email, password }, { models }) => {



    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({ $or: [{ email }, { username }] });

    // if user no found throw authentication error
    if (!user) {
      throw new AuthenticationError("Error signing in");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AuthenticationError("Error singing in");
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  toggleFavorite: async (parent, { id }, { models, user }) => {

    // if no user context is passed, throw auth error
    if (!user) {
      throw new AuthenticationError();
    }
    // check to see if the user has already favorited the note
    let noteCheck = await models.Note.findById(id);

    const hasUser = await noteCheck.favoriteBy.indexOf(user.id);


    // if the user exists in the list
    // pull them from the list and reduce the favoriteCount by 1
    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoriteBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        }, {
        // Set new to true to return the updated doc
        new: true
      }
      );
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoriteBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        }, {
        // Set new to true to return the updated doc
        new: true
      }
      );
    }

  }
}