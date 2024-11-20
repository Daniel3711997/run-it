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
    commands: string[];
}

let isStatusBarMessageVisible = false;
const commandsWaitingToRun: {
    command: string;
    timer: ReturnType<typeof setTimeout>;
}[] = [];
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
        commands.forEach(({ commands: commandsList, files, delay }) => {
            files.forEach(filePattern => {
                const watcher = vscode.workspace.createFileSystemWatcher(filePattern, false, false, true);

                watcher.onDidChange(() => {
                    commandsList.forEach((individualCommand, index) => {
                        commandsWaitingToRun.slice().forEach(({ timer, command }) => {
                            if (command === individualCommand) {
                                clearTimeout(timer);
                            }

                            commandsWaitingToRun.splice(index, 1);
                        });

                        commandsWaitingToRun.push({
                            command: individualCommand,
                            timer: setTimeout(() => {
                                const resolvePromise = showStatusBarMessage();

                                vscode.commands.executeCommand(individualCommand);

                                if (resolvePromise)
                                    setTimeout(() => {
                                        resolvePromise();
                                    }, 250);
                            }, delay ?? 2000),
                        });
                    });
                });

                watchers.push(watcher);
            });
        });
    }
};
