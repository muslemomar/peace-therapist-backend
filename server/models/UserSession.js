const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const sessionSchema = Schema({
    token: {
        type: String,
        index: true
    },
    userId: {
        type: ObjectId,
        required: true,
        index: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        index: true,
        enum: ['Doctor', 'Patient']
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: false,
    versionKey: false
});

exports.UserSession = mongoose.model('UserSession', sessionSchema, 'userSessions');