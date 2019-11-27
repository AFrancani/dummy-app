// When the document is loaded, we need to display the values of the settings
window.addEventListener('load', load);
function load() {
    const getElementById = (id) => document.getElementById(id);
    const setElementValue = (element, value) => element.value = value;
    const searchParams = new URLSearchParams(window.location.search);
    const getQueryParam = (key) => searchParams.get(key);

    // Set the value of the settings inputs with their query parameter values
    setElementValue(getElementById('setting1'), getQueryParam('setting1'));
    setElementValue(getElementById('setting2'), getQueryParam('setting2'));
}

// When the settings are saved, we need to send their new value to the Collaboratory
function save() {
    const getElementById = (id) => document.getElementById(id);
    const getElementValue = (element) => element.value;
    const postMessageToParent = (message, parentOrigin) => window.parent.postMessage(message, parentOrigin);
    const updateSettingsTopic = '/clb/community-app/settings';
    const collaboratoryOrigin = 'https://wiki.humanbrainproject.eu'

    // Send a message to the Collaboratory with:
    // {
    //     topic: updateSettingsTopic,
    //     data: {
    //         your-setting-key: your-setting-value,
    //         another-setting-key: another-setting-value,
    //         ...
    //     }
    // }
    let updateSettings = {
        topic: updateSettingsTopic,
        data: {
            setting1: getElementValue(getElementById('setting1')),
            setting2: getElementValue(getElementById('setting2'))
        }
    };
    postMessageToParent(updateSettings, collaboratoryOrigin);
}
