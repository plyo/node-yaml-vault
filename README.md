# node-yaml-vault

Inspired by [yaml-vault](https://github.com/joker1007/yaml_vault)

## Installation

```bash
$ npm i -g node-yaml-vault
```
 
## Usage

*test.yml*
```yml
redis:
  environment:
    REDIS_PASS: secret_pass
```

*command*
```bash
$ node-yaml-vault encrypt -f test.yml -k ^.*?\\.environment -p password
```

*output*
```yml
redis:
  environment:
    REDIS_PASS: d860d4f47437b38e5beb8c
```

The same for decryption. Type `node-yaml-vault --help` for more information.
