---
layout: ../../layouts/Post.astro
title: "Jekyll tags and categories plugin for gh-pages"
pubDate: 2015-06-04 18:40:53
teaser: jekyll-tags-categories.png
categories: other
tags: [jekyll]
---

Switching from [Blogger](http://www.blogger.com) to [Jekyll](http://jekyllrb.com/) was an amazing experience. Everything was quite easy (although not as fast as I thought, it's always the same). I found only one problem a bit difficult to solve:

I wanted to use the [GitHub pages hosting](https://pages.github.com/), uploading the Jekyll site source, not the final site, so I could have it everywhere just cloning the repo.

At the same time, I wanted to have categories and tags pages (a page for each tag and category).

I found two solutions to the problem:

- Using a plugin like [this one](https://github.com/recurser/jekyll-plugins), which creates the pages. The problem is that GitHub doesn't accept custom plugins for security reasons.
- Creating the templates for each tag and category, as explained in [this post](http://www.minddust.com/post/tags-and-categories-on-github-pages/). The solutions works perfectly on GitHub pages, but a new template has to be created manually every time a category or tag is added to the blog!

So I decided creating a small plugin that pre-generates the templated needed by the second solution. You can create the posts locally, and the templated will be created by the plugin. Then, upload the new post and templates to GitHub and that's it.

There are two problems:

- When the Jekyll server is started, new tags or categories won't be generated on the \_site folder. You have to start it again. When adding new tags with the server running, works ok. This could be solved using [hooks](http://jekyllrb.com/docs/plugins/#hooks), I guess, but this feature is not released yet.
- Files edited directly on GitHub won't run the plugin, so the new tags or categories won't appear until the site is generated locally. Without plugins running there, there is no solution for that.

## Installation

Copy the following files to the _\_layouts_ dir:

blog_by_category.html

{% highlight html %}

<h1>Articles by category :{{ page.category }}</h1>
<div>
    {{ "{% if site.categories[page.category] " }}%}
        {{ "{% for post in site.categories[page.category] " }}%}
            <a href="{{  post.url  }}">{{ "{{ post.title  }}"}}</a>
        {{ "{% endfor " }}%}
    {{ "{% else " }}%}
        <p>There are no posts for this category.</p>
    {{ "{% endif " }}%}
</div>

```

blog_by_tag.html
{% highlight html %}

<h1>Articles by tag :{{ page.tag }}</h1>
<div>
   {{ "{% if site.tags[page.tag] " }}%}
        {{ "{% for post in site.tags[page.tag] " }}%}
            <a href={{ post.url }}/>{{  post.title  }}</a>
        {{ "{% endfor " }}%}
    {{ "{% else " }}%}
        <p>There are no posts for this tag.</p>
    {{ "{% endif " }}%}
</div>

```

And the plugin to the _\_plugins_ dir:

categories_tags_generator.rb

{% highlight ruby linenos %}
module Jekyll
class TagsGenerator < Generator

    def generate(site)
        tags_dir = Dir.pwd + '/tags'

        if !Dir.exists?(tags_dir)
            puts "Creating tags dir"
            Dir.mkdir(tags_dir)
        end
        regenerate_flag = false

        site.tags.each do |i|
            if !File.exists?(tags_dir + '/' + i[0])
                puts "Creating tag page for: " + i[0]
                tag_file = File.new(tags_dir + '/' + i[0], "w")
                tag_file.puts("---\nlayout: blog_by_tag\ntag: " + i[0] + "\npermalink: /tags/" + i[0] + "/\n---")
                tag_file.close

                regenerate_flag = true
            end
        end

        if regenerate_flag
            FileUtils.touch Dir.pwd+'/_config.yml'
        end



    end

end
end

```

Now you will have the url _/tags/[name_of_the_tag]_ and _/categories/[name_of_teh_category]_ pages accessible. There are many ways to create the links to them. To put an example, I create a category list and a tag word cloud using this code in the _blog_ page:

Next post will be about maps again!
```
