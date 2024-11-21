import * as vscode from 'vscode';

export function deactivate() {
    // Silence Is Golden
}

export function activate(context: vscode.ExtensionContext) {
    onDidChangeConfiguration();

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('run-it')) {
                onDidChangeConfiguration();
            }
        }),
    );
}

interface RunItConfig {
    delay?: number;
    files: string[];
    debug?: boolean;
    commands: string[];
}

const defaultDelay = 2000;
let isStatusBarMessageVisible = false;
const commandsWaitingToRun = new Map<
    string,
    {
        timer: ReturnType<typeof setTimeout>;
    }
>();
const runItOutput = vscode.window.createOutputChannel('Run It');
const watchers: ReturnType<typeof vscode.workspace.createFileSystemWatcher>[] = [];

const showStatusBarMessage = () => {
    if (isStatusBarMessageVisible) {
        return;
    }

    isStatusBarMessageVisible = true;

    let resolvePromise: undefined | (() => void);

    vscode.window.setStatusBarMessage(
        '$(sync~spin) Running commands...',
        new Promise<void>(resolve => {
            resolvePromise = () => {
                resolve();
                isStatusBarMessageVisible = false;
            };
        }),
    );

    return resolvePromise;
};

const onDidChangeConfiguration = () => {
    const config = vscode.workspace.getConfiguration('run-it');
    const commands = config.get<RunItConfig[]>('commands') ?? [];
    const globalDebug = config.get<boolean>('globalDebug') ?? false;

    if (globalDebug) {
        runItOutput.appendLine(`Watchers: ${watchers.length.toString()}`);
        runItOutput.appendLine(`Number of commands waiting to run: ${commandsWaitingToRun.size.toString()}`);

        // prettier-ignore
        runItOutput.appendLine(
            `Commands waiting to run: ${JSON.stringify(
                Array.from(commandsWaitingToRun.keys()),
            )}`,
        );
    }

    while (watchers.length) {
        if (globalDebug) {
            runItOutput.appendLine(`Clearing ${watchers.length.toString()} watchers`);
        }

        const watcher = watchers.pop();

        if (watcher) {
            watcher.dispose();
        }
    }

    if (globalDebug) {
        runItOutput.appendLine(`Commands: ${JSON.stringify(commands)}`);
    }

    for (const { files, delay, debug = false, commands: commandsList } of commands) {
        const executor = () => {
            for (const individualCommand of commandsList) {
                const command = commandsWaitingToRun.get(individualCommand);

                if (command) {
                    if (debug || globalDebug) {
                        runItOutput.appendLine(`Clearing command: ${individualCommand}`);
                    }

                    clearTimeout(command.timer);
                    commandsWaitingToRun.delete(individualCommand);
                }

                if (debug || globalDebug) {
                    runItOutput.appendLine(
                        `Setting command: ${individualCommand} with delay: ${(delay ?? defaultDelay).toString()}`,
                    );
                }

                commandsWaitingToRun.set(individualCommand, {
                    timer: setTimeout(() => {
                        const resolvePromise = showStatusBarMessage();

                        if (debug || globalDebug) {
                            runItOutput.appendLine(`Running command: ${individualCommand}`);
                        }

                        vscode.commands.executeCommand(individualCommand);

                        if (debug || globalDebug) {
                            runItOutput.appendLine(`Deleting command: ${individualCommand}`);
                        }

                        commandsWaitingToRun.delete(individualCommand);

                        if (resolvePromise) {
                            setTimeout(() => {
                                resolvePromise();
                            }, 250);
                        }
                    }, delay ?? 2000),
                });
            }
        };

        for (const filePattern of files) {
            if (globalDebug) {
                runItOutput.appendLine(`Creating watcher for: ${filePattern}`);
            }

            const watcher = vscode.workspace.createFileSystemWatcher(filePattern, false, false, true);

            watcher.onDidCreate(executor);
            watcher.onDidChange(executor);

            watchers.push(watcher);
        }
    }
};
