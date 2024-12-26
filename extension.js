// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "switch-npm" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('switch-npm.switchNpmRegistry', function () {
		// The code you place here will be executed every time your command is executed
		const registriesPath = path.join(__dirname, 'registries.json');
		try {
            const registries = JSON.parse(fs.readFileSync(registriesPath, 'utf8'));
            getCurrentRegistry().then(currentRegistry => {
                const registryOptions = Object.keys(registries).map(key => {
                    const label = (registries[key].registry === currentRegistry)? `*${key}` : key;
                    return {
                        label,
                        description: registries[key].home,
                        registry: registries[key].registry
                    };
                });

                vscode.window.showQuickPick(registryOptions, {
                    matchOnDescription: true,
                    placeHolder: 'Select a NPM registry'
                }).then(selection => {
                    if (selection) {
                        const selectedRegistryName = selection.label;
                        const selectedRegistry = selection.registry;
                        exec(`npm config set registry ${selectedRegistry}`, (error, stdout, stderr) => {
                            if (error) {
                                vscode.window.showErrorMessage(`Error switching registry: ${error.message}`);
                                return;
                            }
                            if (stderr) {
                                vscode.window.showWarningMessage(`Warning: ${stderr}`);
                            }
                            vscode.window.showInformationMessage(`Success, Switched to ${selectedRegistryName}: ${selectedRegistry}`);
                        });
                    }
                });
            }).catch(err => {
                vscode.window.showErrorMessage(`Error getting current registry: ${err.message}`);
            });
        } catch (err) {
            vscode.window.showErrorMessage(`Error reading registries.json: ${err.message}`);
        }
	});

	context.subscriptions.push(disposable);
}

function getCurrentRegistry() {
    return new Promise((resolve, reject) => {
        exec('npm config get registry', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

// function getRegistries() {
//     const registriesPath = path.join(__dirname, 'registries.json');
//     const registries = JSON.parse(fs.readFileSync(registriesPath, 'utf8'));
//     return Object.keys(registries).map(key => ({
//         label: key,
//         description: registries[key].home,
//         registry: registries[key].registry
//     }));
// }

// function switchNpmRegistry(registry) {
//     exec(`npm config set registry ${registry}`, (error, stdout, stderr) => {
//         if (error) {
//             vscode.window.showErrorMessage(`Error switching registry: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             vscode.window.showInformationMessage(`Warning: ${stderr}`);
//         }
//         vscode.window.showInformationMessage(`Switched to ${registry}`);
//     });
// }

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
