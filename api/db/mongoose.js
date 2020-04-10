//this file will handle the connection logic to the mongoDB database

const mongoose = require('mongoose');
//to prevent deprication warnings
mongoose.set('useCreateIndex',true);
mongoose.set('useFindAndModify',false);
mongoose.set('useUnifiedTopology',true);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', {useNewUrlParser : true}).then(()=>{
    console.log("Connected to mongodb successfully");
}).catch((e) => {
    console.log('Error while attempting to connect to MongoDB');
});

module.exports = {
    mongoose
};
