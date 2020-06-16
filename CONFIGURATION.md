# Configuration

The Safe Places server utilizes a configuration file in [YAML format
version 1.2](https://yaml.org/spec/1.2/spec.html) for ease of use.
This configuration file needs to be created for the server to function
correctly.

## Specifying the file path

By default, the server looks for a configuration file named
`config.yaml` at the root of the server directory.

To specify another file path, use the `--config` flag when running
the server.

For example, to use a configuration file at the path
`/root/spl-config.yaml`, you can run the server with

```shell script
npm start -- --config=/root/spl-config.yaml
```

**Note the two hyphens** `--` after `npm start`. This is required so
that the `--config` flag is passed to the _server, not NPM_.

## Configuration format

_Last updated: 16 June 2020_

See `config.template.yaml`, which is a sample configuration file that
correctly follows the required schema. Feel free to copy that file
and make modifications accordingly.

The configuration file should match the following format,
with no additional properties:

```yaml
allowedOrigins:
# - your origins here (string value)
  - https://example.com
  - http://localhost:3000
```
