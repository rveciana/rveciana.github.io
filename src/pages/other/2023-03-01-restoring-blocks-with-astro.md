---
layout: ../../layouts/Post.astro
title: "Restoring bl.ocks.org using astrojs"
pubDate: 2023-03-01
teaser: blocks-astro.png
categories: other
tags: [astro]
thumbnail: /images/other/blocks-astro/twitter.png
description: "So my loved bl.ocks.org disappeared! All my examples are gone but, even more, all the other people's examples are gone too! I wanted to republish mine, so I did it here"
twitter-card: summary
---

So my loved [bl.ocks.org][bl.ocks.org] disappeared! All my examples are gone but, even more, all the other people's examples are gone too! I wanted to republish mine, so I did it here: [geoexamples.com/blocks][geoexamplesblocks] and here I´ll explain how.

## bl.ocks.org

This was a very clever idea. The users could add github gists, which are git repositories that are supposed to be small, not projects, and the site checked the index.html file plus some helper files as _thumbnail.png_, _README.md_, _.block_ that helped the blocks page create a nice landing page for any user. Me and many more learned d3 by looking at Mike Bostock's amazing examples there and started adding our own examples.

After some years, Mike created the even more amazing [observable.io][observable] site, and started migrating the official examples there but I still liked the simplicity of blocks, though. Now, for some reason, the page is not working anymore, so all the examples can´t be seen. The good part is that the code for each of the blocks is at github gists, so the site can be reproduced.

## Astrojs

I change my blog when I want to learn something. From blogger to jekyll, sveltekit and now Astrojs! It´s an amazing library, and now it´s forever, I swear (again!).

Astrojs has a _public_ folder where you can put anything. The blocks are html files that call css files, javascript files or whatever. Therefore I thought that putting all the blocks there would work. Of course, the blocks that linked other people´s files won´t work anymore, but with some patience they can be modified and make them look as the first day.

## Step by step

First, I downloaded all the gists from my user rveciana into a file. GitHub still allows this, so:

`https://api.github.com/users/rveciana/gists`

Where `rveciana` is my username, but can be changed to `mbostock` if you want to see tons of examples!

Then, I made a small python script to download all the files that come in the json and prepare it for astro:

```python
import requests
import json
import os
import tempfile
from slugify import slugify


def prepare_files(out_dir, api_file):
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    with open(api_file, 'r', encoding="utf-8") as fp:
        blocks = json.load(fp)

        for block in blocks:
            print("files for ", block['description'])
            slug = slugify(block['description'])
            block_dir = f"{out_dir}/{slug}"
            if not os.path.exists(block_dir):
                os.makedirs(block_dir)

            # print(block['description'], block_dir)
            for block_file in block['files'].values():
                if not os.path.exists(f"{block_dir}/{block_file['filename']}"):
                    print(block_file['filename'])
                    req = requests.get(
                        block_file['raw_url'], allow_redirects=True, timeout=10)
                    open(
                        f"{block_dir}/{block_file['filename']}", 'wb').write(req.content)


def create_index(username, api_file):
    with open(api_file, 'w') as fp:
        url = f"https://api.github.com/users/{username}/gists"

        out_data = []
        is_last = False

        while is_last is False:
            req = requests.get(url, allow_redirects=True, timeout=10)
            print("downloading", url)

            page_content = json.loads(req.content)

            page_content_slug = [
                {**x, 'slug': slugify(x['description'])} for x in page_content]

            out_data += page_content_slug

            if 'next' in req.links:
                url = req.links['next']['url']
            else:
                json.dump(out_data, fp)
                is_last = True


def create_blocks(out_dir, username, api_file='api_result.json'):
    # create_index(username, api_file)
    prepare_files(out_dir, api_file)


if __name__ == '__main__':
    create_blocks('out', 'rveciana')

```

Now I have the file `api_result.json` that has the description, slug, etc and also I downloaded all the files. These will go to a folder called `public/blocks/rveciana` so astrojs can access it.

### Astro pages

So we have to create the index page and each of the examples. For the index, I create a folder `blocks` on `pages` with the following astro code:

```astro
---
import BlockCard from "../../components/BlockCard.astro";
import indexData from "/public/blocks/rveciana/api_result.json";
import "../../components/blocks.css";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>Astro</title>
  </head>
  <body>
    <header>
      <div class="column">
        <a class="user self">rveciana</a>'s blocks
        <div class="date">Updated November 9, 2016</div>
      </div>
    </header>
    <div class="column gists">
      {
        indexData.map((block) => (
          <BlockCard
            title={block.description}
            slug={block.slug}
            username="rveciana"
          />
        ))
      }
    </div>
  </body>
</html>
```

Basically it iterates the json and creates a card for each block. The css is the original one I found in a [forgotten page][blocksindex]. The `BlockCard` component is this one:

```astro
---
const { title, slug, username } = Astro.props;
---

<a
  class="gist gist--thumbnail"
  style={`background-image: url('/blocks/${username}/${slug}/thumbnail.png')`}
  href={`/blocks/${username}/${slug}`}
>
  <div class="gist-description gist-underline">{title}</div>
</a>
```

Simple!

Now, for each example, a new page has to be created. This will be done with dynamic pages, so a `[username]/[slug].astro` file is created inside blocks with the content:

```astro
---
import { Code } from "astro/components";

import indexData from "/public/blocks/rveciana/api_result.json";

export async function getStaticPaths() {
  return indexData.map((block) => ({
    params: { username: "rveciana", slug: block.slug },
  }));
}

const { username, slug } = Astro.params;

const posts = await Astro.glob("/public/blocks/**/README.md");

const indexs = import.meta.glob("/public/blocks/**/index.html", { as: "raw" });

const readme =
  slug &&
  username &&
  posts
    .find(
      (post) => post.file.indexOf(username) >= 0 && post.file.indexOf(slug) >= 0
    )
    ?.compiledContent();

const index =
  slug &&
  username &&
  Object.entries(indexs).find(
    (indexPage) =>
      indexPage[0].indexOf(username) >= 0 && indexPage[0].indexOf(slug) >= 0
  );

const indexContent = await (index && index[1]());

const description = indexData.find((d) => d.slug === slug)?.description;
---

<html>
  <body>
    {username} - {slug}
    <h3>{description}</h3>
    <iframe
      width={960}
      height={500}
      src={`/blocks/${username}/${slug}/index.html`}></iframe>
    <a href={`/blocks/${username}/${slug}/index.html`}
      >Open raw page in new tab</a
    >
    <div set:html={readme} />
    <Code code={indexContent ?? ""} lang="html" theme="github-light" />
  </body>
</html>

<style>
  body {
    display: flex;
    flex-direction: column;
  }
</style>
```

- `getStaticPaths` is used to create each of the pages, statically
- The `Astro.glob` function only works with markdown. But at [the docs][globdocs] explains that under the hood, a [vite function][vitedocs] is used. And we have access to it, and it has a `raw` option that returns the file as a string!
- The [Code component][codecomp] can be used to render the index file.
- `Astro.glob` has a method `compiledContent` that will format the markdown for you, so the readme file can be shown properly

## Conclusions

First of all, make copies of all your code in a secure place, you never know! Code, notes, emails and everything...

Astrojs is amazing, I had to learn several things to get it, but the final structure and code seems really simple for a site like this one.

All this site code can be found here: https://github.com/rveciana/rveciana.github.io

## Links

- [bl.ocks.org][bl.ocks.org]
- [geoexamples.com/blocks][geoexamplesblocks]
- [observable.io][observable]
- [blocks example page][blocksindex]
- [glob docs][globdocs]
- [vite docs][vitedocs]
- [Code component][codecomp]

[bl.ocks.org]: https://bl.ocks.org
[geoexamplesblocks]: https://geoexamples.com/blocks
[observable]: https://observable.io
[blocksindex]: http://g-mops.net/epica_saitama/epica_d3js/MikeBostocksBlocks.html
[globdocs]: https://docs.astro.build/en/reference/api-reference/#astroglob
[vitedocs]: https://vitejs.dev/guide/features.html#glob-import
[codecomp]: https://docs.astro.build/en/reference/api-reference/#code-
