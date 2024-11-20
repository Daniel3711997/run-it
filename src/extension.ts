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
        command: string;
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
    while (watchers.length) {
        const watcher = watchers.pop();

        if (watcher) {
            watcher.dispose();
        }
    }

    const config = vscode.workspace.getConfiguration('run-it');
    const commands = config.get<RunItConfig[]>('commands');

    if (commands) {
        for (const { files, delay, debug, commands: commandsList } of commands) {
            const executor = () => {
                for (const individualCommand of commandsList) {
                    const command = commandsWaitingToRun.get(individualCommand);

                    if (command) {
                        if (debug) {
                            runItOutput.append(`Clearing command: ${individualCommand}`);
                        }

                        clearTimeout(command.timer);
                        commandsWaitingToRun.delete(individualCommand);
                    }

                    if (debug) {
                        runItOutput.append(
                            `Setting command: ${individualCommand} with delay: ${(delay ?? defaultDelay).toString()}`,
                        );
                    }

                    commandsWaitingToRun.set(individualCommand, {
                        command: individualCommand,
                        timer: setTimeout(() => {
                            const resolvePromise = showStatusBarMessage();

                            if (debug) {
                                runItOutput.append(`Running command: ${individualCommand}`);
                            }

                            vscode.commands.executeCommand(individualCommand);

                            if (debug) {
                                runItOutput.append(`Deleting command: ${individualCommand}`);
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
                const watcher = vscode.workspace.createFileSystemWatcher(filePattern, false, false, true);

                watcher.onDidCreate(executor);
                watcher.onDidChange(executor);

                watchers.push(watcher);
            }
        }
    }
};
