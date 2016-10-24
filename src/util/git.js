var path = require('path'),
	fs = require('fs'),
	shelljs = require('shelljs'),
	GITHUB_PREFIX = 'https://github.com/TOTVSTEC/',
	FILES = ['package.json', 'bower.json'];

class GitRepo {

	constructor(options) {
		this.cwd = options.cwd;	// || path.join(__basedir, 'build', 'release', options.name);
		this.url = options.url; // || GITHUB_PREFIX + this.repo + '.git';
	}

	checkout() {
		var home = process.cwd();

		shelljs.rm('-rf', this.cwd);
		shelljs.mkdir('-p', this.cwd);
		shelljs.cd(this.cwd);

		this.exec('git clone -b master ' + this.url + ' .');
		this.exec('git checkout -B master');

		shelljs.cd(home);
	}

	commit(comment) {
		var home = process.cwd();

		shelljs.cd(this.cwd);

		this.exec('git commit -m "' + comment + '" --all', 'Committed');
		this.exec('git push', 'Pushed to remote');

		shelljs.cd(home);
	}

	tag(tag, comment) {
		var home = process.cwd();

		shelljs.cd(this.cwd);

		this.exec('git tag -a ' + tag + ' -m "' + comment + '"', 'Tag ' + tag + ' created');
		this.exec('git push --tags', 'Pushed new tag ' + tag + ' to remote');

		shelljs.cd(home);
	}

	exec(command, desc) {
		console.log('> ' + command);

		if (desc)
			console.log(desc);

		shelljs.exec(command);
	}

	bump(version) {
		let opts = {encoding: 'utf8'};

		for (let i = 0; i < FILES.length; i++) {
			let target = path.join(this.cwd, FILES[i]);

			if (shelljs.test('-f', target)) {
				let pkg = JSON.parse(fs.readFileSync(target, opts));
				pkg.version = version;

				fs.writeFileSync(target, JSON.stringify(pkg, null, 2) + '\n');
			}
		}
	}


}

module.exports = GitRepo;
