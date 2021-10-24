singlemd --input SITE.md --output index.html --style style.css --title "hmprt personal site"&&
git add * &&
git commit -m "Updated site" &&
git push && 
echo "Updated site https://hmprt.com"
