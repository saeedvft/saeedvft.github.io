---
title: "Signing a FIT Image for Secure Boot"
date: 2026-09-19T12:00:00+03:00
draft: true
description: "A sample post to check how code, tables and quotes render."
tags: ["secure-boot", "u-boot", "yocto"]
---

{{< toc >}}

## Why sign the FIT image

A FIT image bundles the kernel, device tree and ramdisk into one file. If the bootloader verifies its signature, an attacker can't swap in a modified kernel without the private key.

> Secure boot is a chain. One unsigned link and the rest is decoration.

Inline code like `mkimage`, `/dev/mmcblk0p2` and `CONFIG_FIT_SIGNATURE=y` should look distinct from the surrounding text.

## Generating a key pair

```bash
mkdir -p keys
openssl genrsa -F4 -out keys/dev.key 2048
openssl req -batch -new -x509 -key keys/dev.key -out keys/dev.crt
```

Keep `dev.key` out of git. Add it to `.gitignore` right away:

```bash
echo "keys/*.key" >> .gitignore
```

## Describing the image

A minimal `image.its` (addresses are placeholders):

```dts
/dts-v1/;

/ {
    description = "Signed FIT";

    images {
        kernel {
            data = /incbin/("Image");
            type = "kernel";
            arch = "arm64";
            os = "linux";
            compression = "none";
            load = <0x00400000>;
            entry = <0x00400000>;
            hash { algo = "sha256"; };
        };
    };

    configurations {
        default = "conf";
        conf {
            kernel = "kernel";
            signature {
                algo = "sha256,rsa2048";
                key-name-hint = "dev";
                sign-images = "kernel";
            };
        };
    };
};
```

## Building and signing

```bash
mkimage -f image.its -K u-boot.dtb -k keys -r image.fit
```

## What lives where

| Item             | Location            | Secret? |
|------------------|---------------------|---------|
| Private key      | Build machine / HSM | Yes     |
| Public key       | Bootloader DTB      | No      |
| Signed FIT image | Boot partition      | No      |

## Checklist

- Private key never leaves the signing host
- Public key embedded in the bootloader
- Unsigned images rejected at boot
- Key rotation plan written down

1. Sign the image
2. Flash it
3. Confirm a tampered image fails to boot
