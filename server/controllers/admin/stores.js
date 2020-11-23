const {User, UserSession} = require('../../models/User');
const {getDbDataByDataTableQuery} = require('./../../utils/general');
const errors = require('./../../utils/error');
const {validateImage} = require('../../utils/validators');
const {uploadImage, uploadImages} = require('../../helpers/uploader');
const {sendSmsAsync} = require('../../helpers/twilio');
const {sendBasicEmail} = require('../../helpers/mailer');
const {sendNotif, NOTIF_ACTIONS} = require('../../services/fcm');

exports.getStores = async (req, res) => {
    const docs = await getDbDataByDataTableQuery(Store, req.query, [
        'title'
    ], {
        path: 'user',
        select: '_id email'
    }, null);

    res.send(docs);
};

exports.deleteStore = async (req, res) => {

    const storeId = req.idParam;
    const storeConds = {store: storeId};

    await Store.deleteOne({_id: storeId});

    res.sendData();
};

exports.getOneStore = async (req, res) => {

    const store = await Store.findOne({_id: req.idParam}).populate({
        path: 'services',
        select: '_id title icon'
    });

    if (!store) return res.sendError(undefined, 404);

    res.sendData(store);
};

exports.updateStore = async (req, res) => {
    const store = await Store
        .findOne({_id: req.idParam});

    if (!store) return res.sendError(undefined, 404);

    if (req.file) {
        if (!validateImage(req.file)) return next(new errors.UnprocessableEntity('Invalid image'));
        req.body.logo = (await uploadImage(req.file)).Location;
    }

    if (!req.body.services) {
        req.body.services = [];
    }

    // storeNumber should be immutable
    delete req.body.storeNumber;
    store.set(req.body);
    await store.save();

    res.sendData();
};

exports.updateStoreVerifStatus = async (req, res) => {

    const store = await Store.findOne({
        _id: req.idParam,
        verifStatus: Store.VERIF_STATUS.PENDING
    }).select('_id user')
        .populate('user', '_id email phoneNumber');

    if (!store) throw new errors.UnprocessableEntity('No such a store');

    store.verifStatus = req.body.verifStatus;
    let messageBody;

    if (req.body.verifStatus === Store.VERIF_STATUS.REJECTED) {
        messageBody = "Your store verification was rejected due to the following reason: " + req.body.rejectReason;

    } else {
        messageBody = "Your store was verified successfully";
    }


    if (store.user.email) {

        await sendBasicEmail(store.user.email, 'Store Verification Update', messageBody);
    } else {
        await sendSmsAsync(store.user.phoneNumber, messageBody)
    }

    await Promise.all([
        store.save(),
        Product.updateMany({store: store._id}, {
            verifStatus: store.verifStatus
        })
    ]);

    sendNotif(
        await User.getUserFcmTokenById(store.user),
        store.user,
        NOTIF_ACTIONS.MY_STORE_VERIF_STATUS_UPDATED,
        {
            verifStatus: store.verifStatus
        }
    );

    res.sendData();
};

/* STORES SERVICES */

exports.getStoreServices = async (req, res) => {
    const docs = await getDbDataByDataTableQuery(StoreService, req.query, [
        'title',
        'color'
    ]);

    res.send(docs);
};

exports.getOneStoreService = async (req, res) => {
    const docs = await StoreService.findOne({_id: req.idParam});

    if (!docs) return res.sendError(undefined, 404);

    res.sendData(docs);
};

exports.createStoreService = async (req, res) => {
    if (req.file) {
        if (!validateImage(req.file)) return next(new errors.UnprocessableEntity('Invalid image'));
        req.body.icon = (await uploadImage(req.file)).Location;
    }

    let storeService = await StoreService.create(req.body);

    res.sendData(storeService);
};

exports.updateStoreServices = async (req, res) => {
    const storeService = await StoreService
        .findOne({_id: req.idParam});

    if (!storeService) return res.sendError(undefined, 404);

    if (req.file) {
        if (!validateImage(req.file)) return next(new errors.UnprocessableEntity('Invalid image'));
        req.body.icon = (await uploadImage(req.file)).Location;
    }

    storeService.set(req.body);
    await storeService.save();

    res.sendData();
};

exports.deleteStoreService = async (req, res) => {
    const storeServiceId = req.idParam;

    await StoreService.deleteOne({_id: storeServiceId});

    res.sendData();
};

/* STORE PRODUCTS */

exports.getProduct = async (req, res) => {
    const docs = await Product
        .findOne({
            _id: req.idParam
        })
        .populate('store', 'title');

    if (!docs) return res.sendError(undefined, 404);

    res.sendData(docs);
};

exports.getStoreProducts = async (req, res) => {
    const storeId = req.idParam;

    const docs = await getDbDataByDataTableQuery(Product, req.query, [
        'name'
    ], null, null, {
        'store': storeId
    });

    res.send(docs);
};

exports.createProduct = async (req, res, next) => {
    const storeId = req.params.id;

    if (!storeId) return next(new errors.NotFound('Store is not found'));

    const store = await Store
        .findOne({_id: storeId})
        .select('verifStatus')
        .lean();

    if (store.verifStatus === Store.VERIF_STATUS.REJECTED)
        return next(new errors.NotFound('You cannot create products as your store\'s verification request was rejected'));

    if (req.files.length > 0) {
        if (!validateImage(req.files)) return next(new errors.UnprocessableEntity('Invalid images'));
        req.body.images = (await uploadImages(req.files)).map(i => i.Location);
    }

    req.body.store = storeId;
    req.body.verifStatus = store.verifStatus;

    const product = await Product.create(req.body);

    res.sendData(product);
};

exports.deleteStoreProduct = async (req, res, next) => {
    const productId = req.idParam;

    await Product.deleteOne({_id: productId});

    res.sendData();
};

exports.updateStoreProduct = async (req, res) => {
    const product = await Product
        .findOne({_id: req.idParam});

    if (!product) return res.sendError(undefined, 404);

    if (!req.body.images) {
        req.body.images = [];
    }

    if (req.files.length > 0) {
        if (!validateImage(req.files)) return next(new errors.UnprocessableEntity('Invalid images'));

        let files = (await uploadImages(req.files)).map(i => i.Location);
        req.body.images = req.body.images.concat(files);
    }

    product.set(req.body);
    await product.save();

    res.sendData();
};
