import * as vscode from 'vscode';

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
const config = vscode.workspace.getConfiguration('run-it');
const runItOutput = vscode.window.createOutputChannel('Run It');
const commands = config.get<RunItConfig[]>('commands') ?? [];
const globalDebug = config.get<boolean>('globalDebug') ?? false;
const watchers: ReturnType<typeof vscode.workspace.createFileSystemWatcher>[] = [];

const disposeAllWatchers = () => {
    while (watchers.length) {
        if (globalDebug) {
            runItOutput.appendLine(`Disposing ${watchers.length.toString()} attached watchers`);
        }

        const watcher = watchers.pop();

        if (watcher) {
            watcher.dispose();
        }
    }
};

export function deactivate() {
    disposeAllWatchers();

    commandsWaitingToRun.forEach(({ timer }, individualCommand: string) => {
        runItOutput.appendLine(`Clearing command: ${individualCommand}`);
        clearTimeout(timer);
    });

    if (globalDebug) {
        runItOutput.appendLine(`Deleting ${commandsWaitingToRun.size.toString()} commands`);
    }
    commandsWaitingToRun.clear();
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
    if (globalDebug) {
        runItOutput.appendLine(`Number of attached watchers: ${watchers.length.toString()}`);
        runItOutput.appendLine(`Number of commands waiting to run: ${commandsWaitingToRun.size.toString()}`);

        // prettier-ignore
        runItOutput.appendLine(
            `Commands waiting to run: ${JSON.stringify(
                Array.from(commandsWaitingToRun.keys()),
            )}`,
        );
    }

    disposeAllWatchers();

    if (globalDebug) {
        runItOutput.appendLine(`Loaded commands: ${JSON.stringify(commands)}`);
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
