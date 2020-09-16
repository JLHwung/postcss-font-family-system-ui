const fs = require("fs");
const path = require("path");

process.stdout.write(
	JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json")))
		.devDependencies[process.argv[2]]
);
