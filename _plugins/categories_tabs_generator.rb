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
            tag_name = i[0]

             if !File.exists?(tags_dir + '/' + tag_name + '.md')
                puts "Creating tag page for: " + tag_name
                tag_file = File.new(tags_dir + '/' + tag_name + '.md', "w")
                tag_file.puts("---\nlayout: blog_by_tag\ntag: " + tag_name + "\npermalink: /tags/" + tag_name + "/\navoid_main_menu: true\n---")
                tag_file.close

                regenerate_flag = true
            end
        end

        if regenerate_flag
            FileUtils.touch Dir.pwd+'/_config.yml'
        end



    end
  end

  class CategoryGenerator < Generator

    def generate(site)
        category_dir = Dir.pwd + '/categories'

        if !Dir.exists?(category_dir)
            puts "Creating categories dir"
            Dir.mkdir(category_dir)
        end
        regenerate_flag = false

        site.categories.each do |i|
            if !File.exists?(category_dir + '/' + i[0] + '.md')
                puts "Creating category page for: " + i[0]
                category_file = File.new(category_dir + '/' + i[0] + '.md', "w")
                category_file.puts("---\nlayout: blog_by_category\ncategory: " + i[0] + "\npermalink: /categories/" + i[0] + "/\n---")
                category_file.close

                regenerate_flag = true
            end
        end

        if regenerate_flag
            FileUtils.touch Dir.pwd+'/_config.yml'
        end



    end
  end
end
