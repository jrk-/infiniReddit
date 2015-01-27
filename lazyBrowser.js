// globals..
var url = null;

// snoocore
var reddit = null;

// history stack
var history = null;

// container for appending the reddit listings
var container = null;

// are new listings completely appended to the dom?
var isReady = true;

// how many listings to fetch per request
var maxListings = 4;

// clear container
function clearNode(node)
{
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function appendListing(data)
{
  var thumbnail = document.createElement("img");
  var img = document.createElement("img");
  var row = document.createElement("div");
  var left = document.createElement("div");
  var right = document.createElement("div");
  var link = document.createElement("a");

  link.setAttribute("href", "http://www.reddit.com" + data.permalink);
  link.innerHTML = data.title;
  link.className = "center";
  row.appendChild(link);

  img.className = "center";
  img.setAttribute("src", data.url);
  row.appendChild(img);

  container.appendChild(row);

  var hr = document.createElement("hr");
  hr.setAttribute("width", "90%")
  container.appendChild(hr);
}

function loadNextListing()
{
  isReady = false;

  var promise = null;

  if (history.isEmpty()) {
    promise = reddit(url).get({ limit: maxListings });
  } else {
    var name = history.peek().name;
    promise = reddit(url).get({ limit: maxListings, after: name });
  }

  promise.then(function(result)
  {
    result.data.children.forEach(function(child) {
      if (! child.data.stickied) {
        listingNode(child.data);
        history.push(child.data);
      }
    });

    isReady = true;

  }).catch(function(error)
  {
    div = document.createElement("div");
    div.innerHTML = "ERROR: " + error;
    container.appendChild(div);
  });
}

function loadMore()
{
  window.onscroll = null;

  var barrier      = 3.0;
      scrollTop    = document.documentElement.scrollTop;
      scrollTopMax = document.documentElement.scrollTopMax;

  if (isReady && scrollTopMax / scrollTop < barrier) {
    loadNextListing();
  }

  window.onscroll = loadMore;
}

function main()
{
  // initialize global variables
  url = '/r/woahdude/hot'
  history = new Stack();
  container = document.getElementById("container");
  reddit = new window.Snoocore({ userAgent: 'LazyBrowser@0.0.1 by jrk-' });

  loadNextListing();
  window.onscroll = loadMore;
}

// yay for a sane STL..
function Stack() {
  this.dataStore = [];
  this.top = 0;
  this.push = push;
  this.pop = pop;
  this.peek = peek;
  this.size = size;
  this.clear = clear;
  this.isEmpty = isEmpty;
}

function push(element) {
  this.dataStore[this.top] = element;
  ++this.top;
}

function pop() {
  if (this.top > 0) {
    --this.top;
    var tmp = this.dataStore[this.top];
    this.dataStore.pop();
    return tmp;
  } else {
    return null;
  }
}

function peek() {
  if (this.top > 0) {
    return this.dataStore[this.top - 1];
  } else {
    return null;
  }
}

function size() {
  return this.top;
}

function clear() {
  this.dataStore = [];
  this.top = 0;
}

function isEmpty()
{
  return this.top == 0;
}
