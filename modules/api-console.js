
exports.addRoutesTo = function addRoutesTo(app) {
	app.use('/', function(req, res) {
		res.redirect(basePath(req) + "/api-console/");
	});
};

function basePath(req) {
	var externalPathValue = req.header("hybris-external-path");

	if (externalPathValue) {
		//remove trailing slash, if any
		return externalPathValue.replace(/\/$/, "");
	} else {
		return "";
	}
}