---
layout: post
title: 'Migrating a Jekyll blog to Svelte-kit'
date: 2021-04-21 18:40:53
teaser: migrate-jekyll-svelte.png
categories: svelte
tags: [jekyll, svelte-kit, markdown]
---

Five years ago I changed my [old blogger blog][blogspot] to Jekyll. Now I've changed to Svelte, and here you have the steps and issues I found. You can find [the blog code repo here][blogcode].

### TOC

- [Why?](#why)
- [Technologies used](#technologies-used)
- [Starting the project](#starting-the-project)
- [package.json](#packagejson)
- [markdown-config-json](#markdown-config-json)
- [Svelte config](#svelte-config)
- [app.html and $layout.svelte](#apphtml-and-layoutsvelte)
- [Endpoints](#endpoints)
- [Getting the data](#getting-the-data)
- [Components](#components)
- [Routes](#routes)
- [Deploying](#deploying)
- [Links](#links)

## Why?

There are many reasons to change an old Jekyll blog (but mine is, honestly, that I wanted to learn Svelte-Kit!).

- Jekyll is getting old, so the possibilities with more modern JavaScript tools is poor
- It's really slow when processing changes
- It's made in Ruby, which is fine, but not a language I know, so modifying it becomes hard for me

You have more reasons and explanations in [this post][nextjs].

I could use some of the react based solutions, but I like Svelte and I couldn't find docs for doing it, so I chose ir. Also, svelte-kit seems a really nice solution, although is still very new.


## Technologies used

- [svelte-kit][svelte-kit]: All the site functionality is done in svelte, and svelte-kit converts all the routes to static html pages that can be uploaded anywhere
- [markdown-json][markdown-json]: I'll keep all the entries written in markdown, so they have to be converted to html somehow. This library does it really well, although some files that Jekyll accepted are not correct for markdown-json
- [prismjs][prismjs]: The previous library doesn't transform the code into highlighted html. Prismjs is the library I used to do it. Configuring it it's not that easy because it doesn't include python highlighting by default
- [handlebars][handlebars] to replace the Jekyll placeholders with values
- [Sass][sass]: Svelte itself can use SaSS, which is very convenient since I was already using it in Jekyll, so I didn't change the styles at all
- [GitHub pages][gh-pages]: There are better options now, but I didn't want to change the domain configuration, so the site is stored directly on GitHub. The generated html has to be in the master branch, while Jekyll was deployed directly by GitHub. It's a point against using this solution.

## Starting the project

Starting the project is as easy as:

npm init svelte@next my-blog

- We'll need to create a folder for the blog posts and Jekyll pages pages (I called it content)
- On src/static, I copied the _images_ folder I already had on Jekyll, the favicon, the manifest file and the CNAME file that enables my domain on GitHub pages

And that's it. Now, all the code has to be written so the blog renders the markdown entries

## package.json

{% highlight json %}
"scripts": {
"dev": "svelte-kit dev",
"build": "npm run contentGen && svelte-kit build",
"start": "svelte-kit start",
"lint": "prettier --check . && eslint --ignore-path .gitignore .",
"format": "prettier --write .",
"contentGen": "markdown-json -c markdown-config.json",
"watch-md": "nodemon -e md -x \"npm run contentGen\"",
"dev-md": "concurrently \"npm run dev\" \"npm run watch-md\""
}
{% endhighlight %}

- *npm run dev will* start the main svelte server, and reload the content when the Svelte files change. The result can be seen on *localhost:3000* by default
- *npm run contentGen* will process the markdown files
- *npm run watch-md* will rerun the previous script every time that a markdown file changes
- *npm run dev-md* will run both the Svelte server ans the markdown generator. Stopping it doesn't work very well (tha console has to be closed to free the port), it's a point to improve


## markdown-config-json

This is where the markdown files are rendered into a JSON object with the html to show on the site. The important part is setting the *src* directory where the markdown lives and a *dist* pat where we will get all the data from

{% highlight json %}
  {
	"name": "markdown-json",
	"cwd": "./",
	"src": "content/",
	"filePattern": "**/*.m*",
	"ignore": "",
	"dist": "src/lib/data.json",
	"metadata": true,
	"server": false
}
{% endhighlight %}

The result, for each entry, is something like this:

{% highlight json %}
{
      "id": "An id that also matches the markdown path",
      "contents": "The rendered HTML",
      "excerpt": "The first part of the rendered HTML so it can be shown",
      "layout": "post",
      "title": "Post or page title",
      "date": "",
      "categories": "",
      "tags": [],
      "teaser": "d3-composite-projections.png",
      "meta": {
        "relativePath": "posts\\d3\\2015-05-12-d3-composite-projections.html",
        "createdAt": "2021-04-11T18:28:06.923Z",
        "lastModified": "2021-04-11T18:28:06.923Z",
        "size": 2668,
        "formattedSize": "2.6 KB"
      }
    }
{% endhighlight %}

The first three fields and the metadata will always appear, while the other fields will match the [front matter section][front-matter] of your Jekyll file:

```
---
property: value
tags: [first, second, third]
-npm--
```

Those properties are necessary to classify and sort the posts and pages.

## Svelte config

The svelte config I used is the following, prepared to generate the static site:


{% highlight js %}
const sveltePreprocess = require("svelte-preprocess");
const nodeStatic = require("@sveltejs/adapter-static");
const pkg = require("./package.json");
module.exports = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: nodeStatic({ pages: "../build", assets: "../build" }),
		appDir: "staticApp",
		target: "#svelte",
		vite: {
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {})
			}
		}
	}
};{% endhighlight %}

- appDir generates a static site
- adapter needs to set the build directory as specified. I needed using different repos for the build and the svelte app, so that's the way you can get a build in another directory

## app.html and $layout.svelte 

- All svelte-kit projects have the app.html which is the place to import libraries (I didn't, better do it with an import inside the svelte files), add meta tags and so on. The meta tags can be added later, but the fixed ones can go here.
- $layout.svelte is the base to our page, its where the header and footer are added. Let's see it, as it's similar to the other svelte files:
{% highlight html %}
<script lang="ts" context="module">
	import type { PageSummary } from '$lib/model';
	export async function load({ fetch }) {
		const resultPages = await fetch('/summary_pages.json');

		const pages = (await resultPages.json()) as PageSummary[];
		return {
			props: { pages }
		};
	}
</script>
<script lang="ts">
	import '../app.scss';

	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	export let pages: PageSummary[] = [];
</script>
<Header {pages} />
<main class="page-content">
	<div class="wrapper">
		<slot />
	</div>
</main>
<Footer />
{% endhighlight %}

- We have to define all the scripts as typescript or we'll get errors
- Note that there are two scripts:
  - When adding *context="module"*, will run before the component is rendered. In our case, we'll use it to call the async functions that call the endpoints.
  - The other script imports the components and exports the variables that we want to use in the template part (the links to the pages in our case)
- The *slot* tag is where the actual pages will put their content

## Endpoints

You can create as many endpoints as you want by adding *ts files to the routes. These files return json objects. It's a good practice to add the json to the name so they are called as json files in the path.

*data.json.ts* could be like:

{% highlight js %}
export function get() {
	return { body: {value: 42}, status: 200 };
}
{% endhighlight %}

The get function sets the get HTTP method, and returns the body of the response and the status. Playing with this is possible to create a complete REST API easily

## Getting the data

A real endpoint using the data created with *markdown-json* is using this function to do it (*get_contents.ts*):

{% highlight js %}
import { data } from '$lib/data.json';
import type { PostSummary } from './model';

export const getContents = (num_posts: string | undefined): PostSummary[] =>
	Object.values(data)
		.filter((value) => value.layout === "post")
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, num_posts ? parseInt(num_posts) : undefined)
		.map((post) => {
			const postDate = new Date(post.date);
			const htmlPath = post.meta.relativePath
				.replace(/\\/g, "/")
				.split("/")
				.pop()
				.split("-")
				.slice(3)
				.join("-");
			return {
				title: post.title,
				date: post.date,
				tags: post.tags,
				categories: post.categories,
				teaser: post.teaser,
				slug: `/${post.categories}/${postDate.getFullYear()}/${postDate.toLocaleDateString(
					"en-US",
					{
						month: "2-digit"
					}
				)}/${postDate.toLocaleDateString("en-US", { day: "2-digit" })}/${htmlPath}`
			};
		});{% endhighlight %}

This is the function that converts the *data.json* file into the object we need. 

- First, the data is filtered so we take only posts and not pages, sorted and ony the first *num_posts* are returned
- The rest of the function just converts the paths and other Jekyll information into the one we need to show the list of posts


## Components

Using svelte-kit, the routes can have most of the component, so as separate components I used only one for the header, another for the footer (copied more or less directly from Jekyll) and one for the main page, that renders the image, title and tag for each blog post.

## Routes

Routing is one of the nice svelte-kit features. The only problem I found is that using a static build, query strings don't work, so all the requests must be only with the path.

There are some routes that don't have variable, like *blog.svelte*

{% highlight js %}<script lang="ts" context="module">
	export async function load({ fetch }) {
		const resultPosts = await fetch('blog.json');
		const posts = (await resultPosts.json()) as PostSummary[];
		const resultTagsAndCategories = await fetch('tags-and-categories.json');
		const tagsAndCategories = (await resultTagsAndCategories.json()) as TagsAndCategories[];
		return {
			props: { posts, tagsAndCategories }
		};
	}
</script>
<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import type { PostSummary, TagsAndCategories } from '$lib/model';
	export let posts: PostSummary[] = [];
	export let tagsAndCategories: TagsAndCategories = { tags: [], categories: [] };
</script>
<h1>Categories</h1>
{#each tagsAndCategories.categories as category, i}<a href="/categories/{category}">{category}</a>
	{#if i < tagsAndCategories.categories.length - 1},{' '}{/if}
{/each}
<h1>Tags</h1>
<div class="tagcloud">
	{#each tagsAndCategories.tags as tag}
		<a
			href="/tags/{tag.label}"
			style="font-size: {`${
				70 +
				100 *
					((tag.occurrences - 1) / Math.max(...tagsAndCategories.tags.map((d) => d.occurrences)))
			}%`}">{tag.label}</a
		>{' '}
	{/each}
</div>
<article class="post-content">
	<h1>Posts</h1>
	<ul class="post-list">
		{#each posts as post}
			<li>
				<PostCard {post} />
			</li>
		{/each}
	</ul>
</article>
<p class="rss-subscribe">subscribe <a href="http://feeds.feedburner.com/Geoexamples">via RSS</a></p>
{% endhighlight %}

Only 50 lines to show all entries and a tag cloud! Again, a *module* context script is run before the component is mounted and provides the data.

The tags cloud could be in another component, but this was a migration and there were many things to change.

Each blog entry takes from Jekyll a category and a date in the form:

  [category]/[year]/[month]/[date]/[slug]

The file, then, has to go into an identical path and can use the *page* variable in the *load* function:

{% highlight js %}
<script lang="ts" context="module">
	export async function load({ page, fetch }) {
		const resultPosts = await fetch(`${page.params.slug}.json`);
		const post = (await resultPosts.json()) as Post[];
		return {
			props: { post }
		};
	}
</script>
{% endhighlight %}

Using it gives us the value of the path. When generating the static web, each possible call will be rendered and we'll have the json and the html file.

The endpoint will then have the same path but finished in *json.ts*. The important part is that the text stored in the data file has to be translated into the final html. This includes replacing the Jekyll placeholders and using *Prism* to translate the code:

{% highlight js %}import { configuration } from '$lib/config';
import Handlebars from 'handlebars';
import Prism from 'prismjs';

export const md2html = (mdContent: string): string => {
	const template = Handlebars.compile(mdContent);

	const text = template(configuration);

	const codeMatches = text.match(/{% highlight [a-z]* %}(.|\n)*?{% endhighlight %}/g);

	const formattedCode = codeMatches?.map((d) => {
		const lang = d
			.match(/{% highlight [a-z]* %}/g)[0]
			.replace(/{% highlight /g, '')
			.replace(/ %}/g, '');
		const code = d
			.replace(/<p>/g, '\n')
			.replace(/<\/p>/g, '')
			.replace(/&quot;/gi, `"`)
			.replace(/&lt;/gi, '<')
			.replace(/&gt;/gi, '>')
			.replace(/{% highlight [a-z]* %}/g, '')
			.replace(/{% endhighlight %}/g, '');

		switch (lang) {
			case 'js':
				return `<pre><code>${Prism.highlight(code, Prism.languages.javascript)}</code></pre>`;
			case 'json':
				return `<pre><code>${Prism.highlight(code, Prism.languages.javascript)}</code></pre>`;
			case 'html':
				return `<pre><code>${Prism.highlight(code, Prism.languages.html)}</code></pre>`;
			case 'python':
				return `<pre><code>${Prism.highlight(code, Prism.languages.js)}</code></pre>`;
			default:
				return `<pre><code>${Prism.highlight(code, Prism.languages.js)}</code></pre>`;
		}
	});

	return codeMatches?.reduce((acc, curr, i) => acc.replace(curr, formattedCode[i]), text) ?? text;
};
{% endhighlight %}

- The placeholders from Jekyll are replaced using handlebars. For instance {{author}} would be changed to the name in the configuration.
- Prism has to detect the language. The problem is that by default it doesn't include Python and I didn't find the way to do it in Svelte (instructions are for babel). Using the Javascript hightlighting for python doesn't give a bad result.
- HTML entities give some problems, so I had to replace them. Maybe there's a better way...

## Deploying

To make things faster I didn't want to change my GitHub hosting with gh-pages. To upload a site there, a repo with the name *username.github.io* has to be created. With Jekyll is cool because you can upload your Jekyll code directly there and GitHub creates the static site directly. In this case, we have the html and this is what has to go there, while the site code can go either in another branch or another repo (my option).

To make the custom domain work, a file called *CNAME* with the domain as the content must be in the *static* folder.

## Links

- [Blog code repo][blogcode]
- [Blogspot blog][blogspot]
- [Migrating from Jekyll to Nextjs][nextjs]
- [svelte-kit][svelte-kit]
- [markdown-json][markdown-json]
- [prismjs][prismjs]
- [handlebars][handlebars]
- [Sass][sass]
- [GitHub pages][gh-pages]
- [Front Matter][front-matter]

[blogcode]: https://github.com/rveciana/geoexamples-blog
[blogspot]: http://geoexamples.blogspot.com/
[nextjs]: https://ghostinspector.com/blog/rebuilding-jekyll-website-next-js-theme-ui/
[svelte-kit]: https://kit.svelte.dev/docs
[markdown-json]: https://github.com/klaytonfaria/markdown-json#readme
[prismjs]: https://github.com/PrismJS/prism#readme
[sass]: https://sass-lang.com/
[gh-pages]: https://pages.github.com/
[front-matter]: https://jekyllrb.com/docs/front-matter/
[handlebars]: https://handlebarsjs.com/





