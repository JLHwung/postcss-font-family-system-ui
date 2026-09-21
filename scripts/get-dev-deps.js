const fs = require("fs");
const path = require("path");

const key = process.argv[2];
const devDependencies = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"))).devDependencies;
if (Object.prototype.hasOwnProperty.call(devDependencies, key)) {
	process.stdout.write(devDependencies[key]);
}
