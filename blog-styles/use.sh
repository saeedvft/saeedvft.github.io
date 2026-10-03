#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
[ -f "blog-styles/$1.src.css" ] || { echo "usage: blog-styles/use.sh editorial|docs|midnight|current"; exit 1; }
sed 's/@@/body[data-section="posts"][data-kind="page"]/g' "blog-styles/$1.src.css" > static/css/blog.css
echo "now using: $1"
