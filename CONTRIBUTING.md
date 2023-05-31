# Contribution guidelines

Thanks for taking the time to contribute!

To discuss problems or for suggestions [open an issue](https://github.com/OnkarRuikar/markdownlint-rule-search-replace/issues/new).\
If you have already implemented any changes then feel free to submit a pull request.

## Dev Tooling

Before committing the code run following commands in the order:

```shell
npm run test
npm run lint
npm run pretty
```

The GitHub PR workflows will run these commands anyway, but it'll save time if you do it in local before commits.

## Node.js version

The project needs to support Node.js `>=14.18.0` version to match upstream [markdownlint](https://github.com/DavidAnson/markdownlint) repository. To avoid downgrading your currently installed Node.js, try to use [Node Version Manager(NVM)](https://github.com/nvm-sh/nvm), [Fast Node Manager(fnm)](https://github.com/Schniz/fnm), or any suitable Node version manager.\
Before installing check if the version manager supports your environment. For example, fnm supports Fish shell as well.
