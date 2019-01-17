const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');

const mail = require('../handlers/mail');

const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // First check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carryn on! They are logged in!
    return;
  }
  req.flash('error', 'Oops! You must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // See if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists');
    return res.redirect('/login');
  }
  // Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  // Sending an email with reset URL
  await mail.send({
    user,
    resetURL,
    subject: 'Password Reset',
    filename: 'password-reset'
  });
  req.flash('success', 'You have been emailed a password reset link.');
  // Redirect to login page
  res.redirect('/login');
};

exports.isTokenValid = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // if there is a user, allow next middleware
  next();
};

exports.reset = (req, res) => {
  res.render('reset', { title: 'Reset your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); // keep it going
    return;
  }

  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  await user.setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');
};

