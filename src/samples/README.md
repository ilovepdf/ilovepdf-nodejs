# Examples

This folder has some examples to use ILovePDFApi and each of its available tools.

## Configuration

For example purposes there are variables that need to change before use:

1. **<FILE_PATH>**: File system path. Be sure to add also the extension,
2. **<FILE_URL>**: Public file URL.
3. **`process.env.PUBLIC_KEY` and `process.env.SECRET_KEY`**: For security reasons and good practices, keep your SECRET_KEY as environment variable. To do this, add it to your system or create a .env file in the root of this project.

## How to run it?

You can create a separated project, copy the example and fix the import paths. However, we recommend execute the examples inside this project following the next steps:

1. Set the variables explained before in all the examples that you want to execute.
2. Re-build the project with `npm run build`.
3. Execute the compiled example with `node ./samples/<example>`.