# Run It

Runs VSCode commands on file changes

```
"run-it.commands": [
    {
        "delay": 4000,
        "debug": false,
        "commands": ["eslint.restart"],
        "files": ["**/clients/**/*.ts", "**/styles/**/*.d.ts"]
    }
]
```

## I built this extension because ESLint is not able to see the updated content of a generated file until you restart it.

ESLint currently does not have any way of telling parsers such as ours when an arbitrary file is changed on disk. That means if you change file A that is imported by file B, it won't update lint caches for file B -- even if file B's text contents have changed. Sometimes the only solution is to restart your ESLint editor extension altogether.

https://typescript-eslint.io/troubleshooting/faqs/general/#i-get-no-unsafe--complaints-for-cross-file-changes

https://typescript-eslint.io/troubleshooting/faqs/general/#changes-to-one-file-are-not-reflected-when-linting-other-files-in-my-ide
