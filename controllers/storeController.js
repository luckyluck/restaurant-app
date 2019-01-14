const mongoose = require('mongoose');

const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  // Works only with sessions
  req.flash('success', `Successfully created <strong>${store.name}</strong>. Care to leave a review.`);
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // Query the database for a list of stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  // Find the store by ID
  const store = await (Store.findById(req.params.id));
  // Confirm they are the owner of the store
  // TODO confirmation
  // Render out the edit frm so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns new store instead of the old one
    runValidators: true // requires to run all model validators (initially, they run on create only)
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">${store.name}</a>`);
  // Redirect to store and tell them it worked
  res.redirect(`/stores/${store._id}/edit`);
};
