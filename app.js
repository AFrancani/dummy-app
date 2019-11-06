window.addEventListener('hashchange', function() {
  window.parent.postMessage(JSON.stringify({
  topic: '/clb/community-app/hashchange',
  data: window.location.hash
  }), '*')
})

// Write Javascript code!

const appDiv = document.body;

let urlQS = new URLSearchParams(window.location.search);
let settings = Array.from(urlQS.keys()).map(qs => `<li>${qs}: ${urlQS.get(qs)}</li>`).join('');
appDiv.innerHTML = `<ul>${settings}</ul>`;

let message = JSON.stringify({
  topic: '/clb/community-app/settings',
  data: `setting1=value1%26setting2=value2`
});
window.parent.postMessage(message, '*');
