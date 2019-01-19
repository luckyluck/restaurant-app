const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');

const { catchErrors } = require('../handlers/errorHandlers');

router.get('/search', catchErrors(storeController.searchStores));

router.get('/stores/near', catchErrors(storeController.mapStores));

module.exports = router;
