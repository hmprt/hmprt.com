singlemd --input SITE.md --output index.html --style themes/monokai.css &&
git add * &&
git commit -m "Updated site" &&
git push && 
echo "Updated site https://hmprt.com"
