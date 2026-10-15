+++
date = '2026-10-14T09:58:08+03:30'
draft = false
title = 'The 64-Byte Difference Between uImage and zImage'
tags = ['u-boot', 'zImage', 'uImage']
categories = ['Tutorials']
author = 'Saeed Nourian'
description = 'Both are kernel images. The "u" describes the container format, not the contents.'
+++


If you've spent any time in embedded Linux, you've run into `zImage` and `uImage`. You've probably also seen `u-boot.bin` sitting right next to them in the same directory, which leads to a very common question:

**Are these kernel images or U-Boot images?**

Short answer: **They're both kernel images.** The "u" in uImage is misleading — it refers to the format, not the contents. Let's break it down properly.


## The Two Files at a Glance

| File | What it actually is |
|------|---------------------|
| `zImage` | A compressed, self-extracting **Linux kernel** |
| `uImage` | That same kernel, plus a **64-byte U-Boot header** |
| `u-boot.bin` | The **bootloader itself** (a completely different thing) |

So when you see `uImage` in your boot partition, that's the kernel U-Boot will load — not U-Boot.


## What Is a zImage?

`zImage` is the compressed Linux kernel produced by the kernel build system. The "z" means compressed, and it's a **self-extracting** image: the first few bytes contain a small decompression stub. When the CPU jumps to the start of a zImage, that stub runs, decompresses the real kernel into memory, and hands off control.

You get it by building the kernel:

```bash
make ARCH=arm zImage
```

No extra tooling required. The kernel build system produces it directly.


## What Is a uImage?

A `uImage` is a zImage (or a raw `Image`) wrapped in a **U-Boot-specific container format**. It's created by a tool called `mkimage`, which lives in the U-Boot source tree:

```bash
mkimage -A arm -O linux -T kernel -C none \
        -a 0x8000 -e 0x8000 \
        -n "Linux Kernel" \
        -d zImage uImage
```

That command prepends a **64-byte header** containing metadata:

- OS type (Linux)
- CPU architecture (ARM, MIPS, etc.)
- Compression type
- Load address
- Entry point
- A name string and a CRC checksum

The header exists purely so the bootloader can parse the image before jumping into it.


## The Key Insight: Strip the Header, Get a zImage

If you start executing a uImage at **offset 64** — skipping the header — it behaves exactly like a zImage. That's because it *is* a zImage underneath. The header adds no code, no compression, no functionality. It's just metadata for the bootloader.

This is why the file sizes differ by exactly 64 bytes.


## Why Do Both Exist?

The answer is bootloader history.

### Legacy U-Boot → uImage

Older versions of U-Boot only supported the `bootm` command, which **requires** a valid uImage header. It needs to know where to load the kernel, what architecture it's for, and where to jump. Without the header, `bootm` can't do its job. If you're stuck on an old bootloader, you must use a uImage.

### Modern U-Boot → zImage

Newer U-Boot versions added the `bootz` command, which boots a zImage **directly** — no header needed. The bootloader figures out the rest. This is now the preferred path because:

- It removes the `mkimage` step from the build.
- It's simpler and less error-prone.
- It's the **only option for ARM64** — the kernel build system no longer supports generating uImages for 64-bit ARM at all.


## The Naming Confusion, Explained

Here's why people get tripped up:

- `mkimage` is part of the **U-Boot source tree**.
- The uImage format is **defined by U-Boot**.
- So the header is "U-Boot's header," applied to a kernel.

That's it. The "u" describes the **container format**, not the **payload**. The payload is always the Linux kernel.

A quick sanity check on any real uImage:

```bash
file uImage
# uImage, Linux kernel, ...
```

The `file` utility confirms it: kernel payload, U-Boot container.


## Which One Should You Use?

| Situation | Use |
|-----------|-----|
| Legacy U-Boot (only `bootm`) | **uImage** |
| Modern U-Boot (`bootz` available) | **zImage** |
| ARM64 / AArch64 | **zImage** (uImage not supported) |
| You want fewer build steps | **zImage** |

**So a Rule of thumb:** If your bootloader supports `bootz`, use zImage and skip `mkimage` entirely. If it doesn't, you're on old U-Boot and you need a uImage.


