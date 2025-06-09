rm -rf dist &&
pnpm build &&
cd dist &&
git init &&
git add . &&
git commit -m "update" &&
git branch -M main &&
git remote add origin git@github.com:Rabbitroll99/ciallo-ui-vue3-website.git &&
git push -f -u origin main &&
cd -
echo https://rabbitroll99.github.io/ciallo-ui-vue3-website/index.html