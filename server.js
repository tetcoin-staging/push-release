'use strict';

const Parity = require('@parity/parity.js');
const transport = new Parity.Api.Transport.Http('http://localhost:8545');
const api = new Parity.Api(transport);
var request = require('request');
var express = require('express');
var app = express();

const tracks = {
	stable: {id: 1, branch: 'stable'},
	beta: {id: 2, branch: 'beta'},
	nightly: {id: 3, branch: 'check-updates'}	//<<< change to 'nightly' ASAP
};

let track = 'nightly';
let network = 'ropsten'; //<<< switch to 'mainnet'' when we're ready to deploy.

app.get(`/${track}`, function (req, res) {
	let branch = tracks[track].branch;	// should be same as track, but nightly branch is not yet supported.

	request.get('https://vanity-service.ethcore.io/parity-binaries?version=master', function (error, response, body) {
		let info = JSON.parse(body);

		request.get({headers: { 'User-Agent': 'ethcore/parity' }, url: `https://api.github.com/repos/ethcore/parity/commits/${branch}`}, function (error, response, body) {
			let master = JSON.parse(body);
			let release = master.sha;

			let isCritical = false;		// TODO: should take from Git release notes for stable/beta.

			request.get({headers: { 'User-Agent': 'ethcore/parity' }, url: `https://raw.githubusercontent.com/ethcore/parity/${release}/ethcore/src/ethereum/mod.rs`}, function (error, response, body) {

				let forkSupported = body.match(`pub const FORK_SUPPORTED_${network.toUpperCase()}: u64 = (\\d+);`)[1];

				request.get({headers: { 'User-Agent': 'ethcore/parity' }, url: `https://raw.githubusercontent.com/ethcore/parity/${release}/Cargo.toml`}, function (error, response, body) {
					let version = body.match(/version = "([0-9]+)\.([0-9]+)\.([0-9]+)"/).slice(1);
					let semver = version[0] * 65536 + version[1] * 256 + version[2];
					console.log(`Got version: ${version[0]}.${version[1]}.${version[2]} (semver: ${semver})`);

					console.log(`TODO: Register release: 0x000000000000${release}, ${forkSupported}, ${tracks[track].id}, ${semver}, ${isCritical}`);

					let noteBinary = (platform, url, hash) => {
						console.log(`TODO: Register GithubHint: ${hash}, ${url}`);
						console.log(`TODO: Register platform binary: ${release}, ${platform}, ${hash}`);
					};
					info.forEach(r => {
						let f = r.files.find(f => f.name.match(/^parity(.exe)?$/));
						let p = `${r.architecture}-${r.os}`;
						let u = f.downloadUrl;
						console.log(`Attempting to get hash for URL's content: ${u}`);
						api.parity.hashContent(u).then(h => noteBinary(p, u, h));
					})
				})
			})
		}) 
	})
	res.end("Under way...");
})

var server = app.listen(8000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("push-release service listening at http://%s:%s", host, port);
});

const OperationsABI = [{"constant":false,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_newOwner","type":"address"}],"name":"resetClientOwner","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_release","type":"bytes32"}],"name":"isLatest","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_txid","type":"bytes32"}],"name":"rejectTransaction","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_number","type":"uint32"},{"name":"_name","type":"bytes32"},{"name":"_hard","type":"bool"},{"name":"_spec","type":"bytes32"}],"name":"proposeFork","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_client","type":"bytes32"}],"name":"removeClient","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_release","type":"bytes32"}],"name":"release","outputs":[{"name":"o_forkBlock","type":"uint32"},{"name":"o_track","type":"uint8"},{"name":"o_semver","type":"uint24"},{"name":"o_critical","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_checksum","type":"bytes32"}],"name":"build","outputs":[{"name":"o_release","type":"bytes32"},{"name":"o_platform","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"rejectFork","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"client","outputs":[{"name":"owner","type":"address"},{"name":"required","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"setClientOwner","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint32"}],"name":"fork","outputs":[{"name":"name","type":"bytes32"},{"name":"spec","type":"bytes32"},{"name":"hard","type":"bool"},{"name":"ratified","type":"bool"},{"name":"requiredCount","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_release","type":"bytes32"},{"name":"_platform","type":"bytes32"},{"name":"_checksum","type":"bytes32"}],"name":"addChecksum","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_txid","type":"bytes32"}],"name":"confirmTransaction","outputs":[{"name":"txSuccess","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"proxy","outputs":[{"name":"requiredCount","type":"uint256"},{"name":"to","type":"address"},{"name":"data","type":"bytes"},{"name":"value","type":"uint256"},{"name":"gas","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_owner","type":"address"}],"name":"addClient","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"clientOwner","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_txid","type":"bytes32"},{"name":"_to","type":"address"},{"name":"_data","type":"bytes"},{"name":"_value","type":"uint256"},{"name":"_gas","type":"uint256"}],"name":"proposeTransaction","outputs":[{"name":"txSuccess","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"grandOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_release","type":"bytes32"},{"name":"_forkBlock","type":"uint32"},{"name":"_track","type":"uint8"},{"name":"_semver","type":"uint24"},{"name":"_critical","type":"bool"}],"name":"addRelease","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"acceptFork","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"clientsRequired","outputs":[{"name":"","type":"uint32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_release","type":"bytes32"}],"name":"track","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_r","type":"bool"}],"name":"setClientRequired","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"latestFork","outputs":[{"name":"","type":"uint32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_track","type":"uint8"}],"name":"latestInTrack","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_client","type":"bytes32"},{"name":"_release","type":"bytes32"},{"name":"_platform","type":"bytes32"}],"name":"checksum","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"proposedFork","outputs":[{"name":"","type":"uint32"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Received","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"txid","type":"bytes32"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"data","type":"bytes"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"gas","type":"uint256"}],"name":"TransactionProposed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"txid","type":"bytes32"}],"name":"TransactionConfirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"txid","type":"bytes32"}],"name":"TransactionRejected","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"txid","type":"bytes32"},{"indexed":false,"name":"success","type":"bool"}],"name":"TransactionRelayed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"number","type":"uint32"},{"indexed":true,"name":"name","type":"bytes32"},{"indexed":false,"name":"spec","type":"bytes32"},{"indexed":false,"name":"hard","type":"bool"}],"name":"ForkProposed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"number","type":"uint32"}],"name":"ForkAcceptedBy","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"number","type":"uint32"}],"name":"ForkRejectedBy","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"forkNumber","type":"uint32"}],"name":"ForkRejected","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"forkNumber","type":"uint32"}],"name":"ForkRatified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"forkBlock","type":"uint32"},{"indexed":false,"name":"release","type":"bytes32"},{"indexed":false,"name":"track","type":"uint8"},{"indexed":false,"name":"semver","type":"uint24"},{"indexed":true,"name":"critical","type":"bool"}],"name":"ReleaseAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"release","type":"bytes32"},{"indexed":true,"name":"platform","type":"bytes32"},{"indexed":false,"name":"checksum","type":"bytes32"}],"name":"ChecksumAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"ClientAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"}],"name":"ClientRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":true,"name":"old","type":"address"},{"indexed":true,"name":"now","type":"address"}],"name":"ClientOwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"client","type":"bytes32"},{"indexed":false,"name":"now","type":"bool"}],"name":"ClientRequiredChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"old","type":"address"},{"indexed":false,"name":"now","type":"address"}],"name":"OwnerChanged","type":"event"}];