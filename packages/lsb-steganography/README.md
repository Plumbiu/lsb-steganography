# lsb-steganography

通过图片隐藏数据。

<p>
  <p>
    源图片：
  </p>
  <img width="200" src="./__test__/fixture.jpg" />
  <p>
    加密图片：
  </p>
  <img width="200" src="./__test__/fixture.png" />
</p>

运行 `lsb decode "./__test__/fixture.png" --log` 解析加密图片，终端显示 [pnpm-lock.yaml](./pnpm-lock.yaml) 数据。

# 安装

```bash
npm install -g lsb-steganography
```

# 使用

## cli

### encode

> [!NOTE]
> 保存的加密图片以 png 结尾，因为 png 不会压缩。

```bash
lsb encode "加密数据" -i "源图片地址" -o "加密图片保存地址"
# -f, --file 指定加密的数据文件
lsb encode -f "源数据.zip" -i "源图片地址" -o "加密图片保存地址"
# 可以不指定源图片地址，此时使用白色图片处理
lsb encode -f "源数据.zip" -o "加密图片保存地址"
```

### decode

```bash
lsb decode "加密图片地址" -o "源数据保存地址"
# 仅打印，不保存源数据
lsb decode "加密图片地址" --log
```

### help

运行 `lsb -h`：

```bash
lsb

Usage:
  $ lsb <command> [options]

Commands:
  encode [data]   加密数据
  decode <input>  解密图片地址

For more info, run any command with the `--help` flag:
  $ lsb encode --help
  $ lsb decode --help

Options:
  -h, --help  Display this messag
```

## 方法

查看 [lib.ts](/src/lib.ts)。
