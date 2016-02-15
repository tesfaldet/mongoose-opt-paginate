module.exports = {
	api: require('./lib/pagination'),
	plugin: require('./lib/mongoosePaginate'),
	koa: require('./koa/pagination')
};
