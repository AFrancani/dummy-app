/* ##############
   Collab context
   ##############

   When ready, display the following query parameters in their dedicated elements (see index.html):
    - clb-collab-id: unique id of the collab the app is installed in
    - clb-doc-path: path to the document the app installed in within the collab
    - clb-doc-name: human readable name of the document the app is installed in
    - clb-drive-id: id of the drive of the collab the app is installed in
*/

const searchParams = new URLSearchParams(window.location.search);
const getQueryParam = (key) => searchParams.get(key);
const getElementById = (id) => document.getElementById(id);
const setElementText = (element, text) => element.innerText = text;
const whenReady = (callback) => window.addEventListener('load', callback);

whenReady(displayCollabContext);
function displayCollabContext() {
    setElementText(getElementById('clb-collab-id'), getQueryParam('clb-collab-id'));
    setElementText(getElementById('clb-doc-path'), getQueryParam('clb-doc-path'));
    setElementText(getElementById('clb-doc-name'), getQueryParam('clb-doc-name'));
    setElementText(getElementById('clb-drive-id'), getQueryParam('clb-drive-id'));
}

/* ############
   App settings
   ############

   When ready, display the settings you created in your settings page.
   Settigns can be found in the query parameters.
*/

whenReady(displayAppSettings);
function displayAppSettings() {
    setElementText(getElementById('setting1'), getQueryParam('setting1'));
    setElementText(getElementById('setting2'), getQueryParam('setting2'));
}

/* ################
   # Deep linking #
   ################

   When ready, display the hash which was passed by the Collaboratory.
   When hash change:
    - display the hash
    - inform the Collaboratory it changed by post a message to it in the form
      {
          topic: hashChangedTopic,
          data: the new hash
      }
*/
const collaboratoryOrigin = 'https://wiki.humanbrainproject.eu';
const hashChangedTopic = '/clb/community-app/hashchange';
const getHash = () => window.location.hash;
const postMessageToParent = (message, parentOrigin) => window.parent.postMessage(message, parentOrigin);
const whenHashChange = (callback) => window.addEventListener('hashchange', callback);

whenReady(displayHash);
whenHashChange(displayHash);
function displayHash() {
    setElementText(getElementById('hash'), getHash());
}

whenHashChange(informParent);
function informParent() {
    postMessageToParent({
        topic: hashChangedTopic,
        data: getHash()
    }, collaboratoryOrigin);
}
