npm init svelte@next

# create a new project in my-app

npm init svelte@next my-app

```

const sveltePreprocess = require('svelte-preprocess');



Copy _posts to posts


markdown-config.json
{
    "name": "markdown-json",
    "cwd": "./",
    "src": "posts/",
    "filePattern": "**/*.md",
    "ignore": "",
    "dist": "src/lib/data.json",
    "metadata": true,
    "server": false
  }


  Then, create the endpoint:

  import {data as timeline} from "$lib/data.json";

const contents = Object.values(timeline)
  .map(post => {
    return {
      title: post.title,
      hasContent: !!post.contents,
      date: post.date,
      tags: post.tags,
      thumbnail: post.thumbnail
        ? `timeline/${post.thumbnail}`
        : null
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export function get(_req) {
  return { body: contents };
}



```

How to add head==> svelte:head  -> Com sobre escriure
manifest, favicon, etc

app.scss -> Canviar el lloc on s'importa hightlight? (Per fer pàgina més petita)



Adding footer to layout, header to index because of data


Summary + PostCard


Formatting handlebars Problems with tables

regexp
prism scss a app.scss



Blog page (wordcloud) Be careful with trailing /!!!! They create infinite loops


watch md files
https://itnext.io/4-solutions-to-run-multiple-node-js-or-npm-commands-simultaneously-9edaa6215a93


deploy -> outdir



Errors

Problems: 


../
links without http


A fer

Twitter cards