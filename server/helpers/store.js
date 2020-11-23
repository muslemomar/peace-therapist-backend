const {Product} = require('./../models/Product');

exports.getRandomProducts = (conds = {}, limit = 20) => {

    return Product.aggregate([
        {$match: conds},
        {$sample: {size: limit}},
        {$project: {
                deleted: 0,
                verifStatus: 0,
                store: 0,
                desc: 0,
            }}
    ]);

};
