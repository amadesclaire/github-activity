# Github user activity cli

## Usage

1. Ensure you have Deno installed on your system.
2. Clone the repository or download the source files.
3. Open a terminal and navigate to the project directory.
4. Run `deno task compile`
5. Run `github-activity <username>`

You can filter event types by using the `--type` flag

```
github-activity <username> --type=PushEvent,WatchEvent
```

to see a full list of types using the `--help` flag

```
github-activity --help
```
