const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    queryText: {
        type: String,
        required: true
    },
    responseText: {
        type: String,
        required: true
    },
    queryType: {
        type: String,
        enum: ['progress', 'tasks', 'general', 'focus', 'report'],
        default: 'general'
    },
    tableData: {
        type: Object,
        default: null
    },
    chartData: {
        type: Object,
        default: null
    },
    processingTime: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for faster queries
queryHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QueryHistory', queryHistorySchema);