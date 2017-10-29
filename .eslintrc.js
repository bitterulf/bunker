module.exports = {
    "globals": {
        "m": true,
        "platform": true,
        "iron": true
    },
    "parserOptions": {
        "ecmaVersion": 6
    },
    "env": {
        "browser": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-console": "off",
        "indent": [
            "warn",
            4
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};