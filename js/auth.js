// We start by configuring the Keycloak javascript client
// It needs to know your app id in order to authenticate users for it
const keycloak = Keycloak({
        url: 'https://iam.humanbrainproject.eu/auth',
        realm: 'hbp',
        clientId: 'dummy-app'
    });
const YOUR_APP_SCOPES = 'team email profile';

// When ready, we initialise the keycloak client
// Once done, it will call our `checkAuth` function
window.addEventListener('DOMContentLoaded', initKeycloak);
function initKeycloak() {
    console.log('DOM content is loaded, initialising Keycloak client...');
    keycloak
        .init({flow: 'implicit'})
        .success(checkAuth)
        .error(console.log);
}

function checkAuth() {
    console.log('Keycloak client is initialised, veryfing authentication...');

    // Is the user anonymous or authenticated?
    const isAuthenticated = keycloak.authenticated;
    const isAnonymous = !keycloak.authenticated;
    // Is this app a standalone app, a framed app or a delegate?
    const isParent = (window.opener == null);
    const isIframe = (window !== window.parent);
    const isMainFrame = (window === window.parent);
    const isStandaloneApp = isMainFrame && isParent;
    const isFramedApp = isIframe && isParent;
    const isDelegate = (window.opener != null);
    // Posting and listening to messages
    const postMessageToParentTab = (message, parentTabOrigin) => window.opener.postMessage(message, parentTabOrigin);
    const listenToMessage = (callback) => window.addEventListener('message', callback);
    const AUTH_MESSAGE = 'clb.authenticated';
    const myAppOrigin = window.location.origin;
    // Manipulating URLs and tabs
    const openTab = (url) => window.open(url);
    const getCurrentURL = () => new URL(window.location);
    const closeCurrentTab = () => window.close();

    const login = (scopes) => keycloak.login({ scope: scopes });

    // A standalone app should simply login if the user is not authenticated
    // and do its business logic otherwise
    if(isStandaloneApp) {
        console.log('This is a standalone app...');
        if(isAnonymous) {
            console.log('...which is not authenticated, starting login...');
            return login();
        }
        if(isAuthenticated) {
            console.log('...which is authenticated, starting business logic...');
            return doBusinessLogic();
        }
    }

    // A framed app should open a delegate to do the authentication for it and listen to its messages and verify them
    // If the user is authenticated, it should do its business logic
    if(isFramedApp) {
        console.log('This is a framed app...');
        if(isAnonymous) {
            console.log('...which is not authenticated, delegating to new tab...');
            listenToMessage(verifyMessage);
            return openTab(getCurrentURL());
        }
        if(isAuthenticated) {
            console.log('...which is authenticated, starting business logic...');
            return doBusinessLogic();
        }
    }

    // A delegate should login if the user is not authenticated
    // Otherwise, it should inform its opener that the user is authenticated and close itself
    if(isDelegate) {
        console.log('This is a delegate tab...');
        if(isAnonymous) {
            console.log('...which is not authenticated, starting login...');
            return login(YOUR_APP_SCOPES);
        }
        if(isAuthenticated) {
            console.log('...which is authenticated, warn parent and close...');
            postMessageToParentTab(AUTH_MESSAGE, myAppOrigin);
            return closeCurrentTab();
        }
    }
}

function verifyMessage(event) {
    console.log('Message receveived, verifying it...');

    const AUTH_MESSAGE = 'clb.authenticated';
    const receivedMessage = event.data;
    const messageOrigin = event.origin;
    const myAppOrigin = window.location.origin;
    const reload = () => window.location.reload();
    const login = (scopes) => keycloak.login({ scope: scopes });


    // Stop if the message is not the auth message
    if (receivedMessage !== AUTH_MESSAGE) return;

    // Stop if the message is not coming from our app origin
    if (messageOrigin !== myAppOrigin) return;

    // Login otherwise
    return login(YOUR_APP_SCOPES);
}

function doBusinessLogic() {
    displayUserIdentity();

    // Request userinfo and display the user roles
    keycloak
        .loadUserInfo()
        .success(displayRoles)
        .error(console.log);
}


//  #####################
//  Display user identity
//  #####################

function displayUserIdentity() {
    const token = keycloak.tokenParsed;
    const getElementById = (id) => document.getElementById(id);
    const setElementText = (element, text) => element.innerText = text;

    // Display user's username, email and name
    setElementText(getElementById('username'), token.preferred_username);
    setElementText(getElementById('email'), token.email);
    setElementText(getElementById('name'), token.name);
}


//  ###########
//  Collab role
//  ###########

function displayRoles() {
    const searchParams = new URLSearchParams(window.location.search);
    const getQueryParam = (key) => searchParams.get(key);
    const roles = keycloak.userInfo.roles;
    const teams = roles.team;

    // Display the role the user has for the current collab
    // Collab roles are in form of collab-<the-collab-id>-<role>, for example `collab-my-collab-editor`
    // Roles can be `administrator`, `editor` or `viewer`
    // A user can have several roles for a single collab, the priority is the following:
    //   `administrator` > `editor` > `viewer`
    const collabId = getQueryParam('clb-collab-id');
    let collabRole = '';
    if(teams.includes(`collab-${collabId}-administrator`)) {
        collabRole = 'administrator';
    } else if(teams.includes(`collab-${collabId}-editor`)) {
        collabRole = 'editor';
    } else if (teams.includes(`collab-${collabId}-viewer`)) {
        collabRole = 'viewer';
    }
    setElementText(getElementById('collab-role'), collabRole);


    //  ##############
    //  Your app roles
    //  ##############

    // Display the roles the user has for your app
    setElementText(getElementById('app-roles'), keycloak.userInfo.roles['dummy-app']);
}
