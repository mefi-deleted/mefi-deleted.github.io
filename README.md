# mefi-deleted
> MetaFilter deleted posts

Scrape MetaFilter to find deleted posts and turn them into a Jekyll blog.

The interesting code is all in `src/tasks/mefi_deleted.js`. That handles the 
MeFi fetching/parsing, finds the deleted posts, and outputs blog posts containing 
the results in `mefideleted-blog/_posts`. Subsequently, Jekyll runs to turn those
posts into a static blog.

## Usage

This is intended to run in GitHub Actions. See `.github/workflows/workflow.yaml`
for all the magic there. 

To run it locally, you'll need both Node+Yarn and Ruby+Bundler no matter how much 
you wish it was only one or the other.
```
Setup
  $ yarn install
  $ cd mefideleted-blog && bundle install

Usage
   $ node cli.js deleted blue # find deleted posts and populate mefideleted-blog/_posts
   $ node cli.js deleted green # find deleted askme posts
   $ cd mefideleted-blog && bundle exec jekyll build # generate the blog
```

## Created by
[Zach Lipton](https://github.com/zachlipton)

## License
MIT 

