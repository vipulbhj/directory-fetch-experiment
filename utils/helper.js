function createAnchorTag(href, prepandString) {
  let url = prepandString + '/' + href;
  let a = document.createElement('a');
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('target', '_blank');
  a.setAttribute('href', url);
  return a;
}

function createContentListing(allUrls, fetchedFrom) {
  let list = document.createElement('ul');
  for(let url of allUrls) {
    let listItem = document.createElement('li');
    let link = createAnchorTag(url, fetchedFrom);
    listItem.appendChild(link);
    list.appendChild(listItem);
  }
  return list;
} 