---
layout: post
title:  "Jekyll tags and categories plugin for gh-pages"
date:   2015-06-01 19:40:53
categories: other
---
sdadasdsdassa

{% highlight html+django %}
---
layout: default
---

<h1>Articles by category :{{ page.category }}</h1>
<div>
    {{ "{% if site.categories[page.category] " }}%}
        {{ "{% for post in site.categories[page.category] " }}%}
            <a href="{{ "{{ post.url " }}}}/">{{ "{{ post.title " }}}}</a>
        {{ "{% endfor " }}%}
    {{ "{% else " }}%}
        <p>There are no posts for this category.</p>
    {{ "{% endif " }}%}
</div>

{% endhighlight %}

{% highlight html+django %}
---
layout: default
---

<h1>Articles by tag :{{ page.tag }}</h1>
<div>
   {{ "{% if site.tags[page.tag] " }}%}
        {{ "{% for post in site.tags[page.tag] " }}%}
            <a href={{ "{{ post.url " }}}}/>{{ "{{ post.title " }}}}</a>
        {{ "{% endfor " }}%}
    {{ "{% else " }}%}
        <p>There are no posts for this tag.</p>
    {{ "{% endif " }}%}
</div>

{% endhighlight %}

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
{% endhighlight %}

