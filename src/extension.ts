import * as vscode from 'vscode';

interface RunItConfig {
    commands: string[];
    debug?: boolean;
    delay?: number;
    files: string[];
}

const defaultDelay = 2000;
let isStatusBarMessageVisible = false;
const commandsWaitingToRun = new Map<
    string,
    {
        timer: ReturnType<typeof setTimeout>;
    }
>();

let config = vscode.workspace.getConfiguration('run-it');
let commands = config.get<RunItConfig[]>('commands') ?? [];
let globalDebug = config.get<boolean>('globalDebug') ?? false;

const runItOutput = vscode.window.createOutputChannel('Run It');
const watchers: ReturnType<typeof vscode.workspace.createFileSystemWatcher>[] = [];

const disposeAllWatchers = () => {
    if (globalDebug) {
        runItOutput.appendLine(`Disposing ${watchers.length.toString()} attached watchers`);
    }

    while (watchers.length) {
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

const showStatusBarMessage = () => {
    if (isStatusBarMessageVisible) {
        return;
    }

    isStatusBarMessageVisible = true;

    let resolvePromise: (() => void) | undefined;

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
    config = vscode.workspace.getConfiguration('run-it');
    commands = config.get<RunItConfig[]>('commands') ?? [];
    globalDebug = config.get<boolean>('globalDebug') ?? false;

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

    for (const { commands: commandsList, debug = false, delay, files } of commands) {
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
