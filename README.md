# mefi-deleted
> MetaFilter deleted posts

Scrape MetaFilter to find deleted posts and turn them into a Jekyll blog.

The interesting code is all in `src/tasks/mefi_deleted.js`. That handles the 
MeFi fetching and parsing and outputs blog posts in `mefideleted-blog/_posts`.
Subsequently, Jekyll is used to turn those posts into a static blog.

## Usage

This is intended to run in GitHub Actions.

```
Usage

   $ node cli.js deleted blue # find deleted posts and populate mefideleted-blog/_posts
   $ cd mefideleted-blog && jekyll build # generate the blog
```

## Created by
[Zach Lipton](https://github.com/zachlipton)

## License
MIT 
