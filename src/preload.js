const RPC = require("discord-rpc");
const { getAppliactionImageUrlByName, getApplicationInfo, getApplicationImages } = require('./activity.js')

const applicationImages = [];
const tabs = [
    'tab_main',
    'tab_images',
    'tab_buttons'
];
const path = require('path');
const fs = require('fs');
const { openJson } = require('reactive-json-file')
let config = openJson(path.join(__dirname, 'myPresence.json'), {default: {
    clientId: '846495641793462292',
    details: 'Пьем пиво,',
    state: 'вступай в наши ряды!',
    largeImageKey: 'https://media.tenor.com/KQafLCUULQsAAAAi/pixel.gif',
    largeImageText: 'ПЛП',
    smallImageKey: 'large',
    smallImageText: 'ПЛП',
    enableTimestamp: false,
    party: {
        show: false,
        min:  1,
        max:  100
    },
    buttons: [
        {label: '1', url: 'https://google.com'},
        {label: '2', url: 'https://google.com'}
    ]
}})

const checkButtons = () => {
    console.log(config.buttons)
    // const buttons = [
    //     {label: document.getElementById('button1label').value, url: document.getElementById('button1url').value},
    //     {label: document.getElementById('button2label').value, url: document.getElementById('button2url').value}
    // ]
    const btns = config.buttons.filter(v => v.label.length > 1 && isUrlValid(v.url))
    return btns.length > 0 ? btns : undefined;
}

const startPresence = () => {
    const rpc = new RPC.Client({ transport: "ipc" });
    rpc.login({ clientId: config.clientId }).catch((err) => {
        alert(`[RPC.Client] ${err}`)
    });
    rpc.on('ready', () => {
        console.log(rpc.user);
        document.getElementById('p_username').textContent = rpc?.user?.username ?? 'undefined';
        document.getElementById('p_tag').textContent = `#${rpc?.user?.discriminator ?? 'undefined'}`;
        document.getElementById('p_avatar').src = rpc.user ? `https://cdn.discordapp.com/avatars/${rpc.user.id}/${rpc.user.avatar}.png` : '';
        const activity = config;
        
        activity.state = config.state.length >= 1 ? config.state : undefined;
        activity.details = config.details.length >= 1 ? config.details : undefined;
        activity.startTimestamp = config.enableTimestamp ? Date.now() : undefined;
        activity.smallImageText = config.smallImageText.length >= 1 ? config.smallImageText : undefined;
        activity.largeImageText = config.largeImageText.length >= 1 ? config.largeImageText : undefined;
        activity.buttons = checkButtons();
        rpc.setActivity(activity);
    })
}

window.addEventListener('DOMContentLoaded', async () => {
    // making tabs buttons clickable
    for (const name of tabs) {
        document.getElementById(name).addEventListener('click', () => {
            for (const _name of tabs) {
                document.getElementById(`${_name}_content`).style = 'display: none;';
            }
            document.getElementById(`${name}_content`).style = '';
        });
    };

    // add event listeners to inputs for preview auto updading
    for (const input of document.querySelectorAll('input')) { input.addEventListener('input', () => setPreview()); };

    document.getElementById('updatePresence').addEventListener('click', async () => {
        config = getSettings();
        fs.writeFile(path.join(__dirname, 'myPresence.json'), JSON.stringify(config), err => {
            if (err) alert(`Error saving config: ${err}`);
            location.reload();
        });
        console.log('Preview updated');
        
    })
    console.log('Started.');
    setSettings(config);
    setPreview();
    startPresence();
})

const urlRegex = require('url-regex');
const isUrlValid = (url) => urlRegex().test(url)//url.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/) != null


const setPreview = async () => {
    const settings = getSettings();
    console.log('details changed to', document.getElementById('details').value)
    document.getElementById('p_details').textContent = settings.details;
    document.getElementById('p_state').textContent = settings.state;
    document.getElementById('p_time').textContent = settings.enableTimestamp ? 'Прошло 00:00' : ''; 
    document.getElementById('p_imgLarge').src = settings.largeImageKey;
    document.getElementById('p_imgSmall').src = settings.smallImageKey;
};

const getSettings = () => {
    return {
        clientId: document.getElementById('clientid').value,
        state: document.getElementById('state').value,
        details: document.getElementById('details').value,
        largeImageKey: document.getElementById('largeImageKey').value,
        largeImageText: document.getElementById('largeImageText').value,
        smallImageKey: document.getElementById('smallImageKey').value,
        smallImageText: document.getElementById('smallImageText').value,
        enableTimestamp: document.getElementById('enableTimestamp').checked,
        
        buttons: [
            {label: document.getElementById('button1label').value, url: document.getElementById('button1url').value},
            {label: document.getElementById('button2label').value, url: document.getElementById('button2url').value}
        ]
    }
}

const setSettings = (settings) => {
    document.getElementById('clientid').value = settings.clientId;
    document.getElementById('state').value = settings.state;
    document.getElementById('details').value = settings.details;
    document.getElementById('largeImageKey').value = settings.largeImageKey;
    document.getElementById('largeImageText').value = settings.largeImageText;
    document.getElementById('smallImageKey').value = settings.smallImageKey;
    document.getElementById('smallImageText').value = settings.smallImageText;
    document.getElementById('enableTimestamp').checked = settings.enableTimestamp;
    // party: {
    //     show: document.getElementById('showParty').checked,
    //     min:  document.getElementById('partyMin').value,
    //     max:  document.getElementById('partyMax').value
    // },
    document.getElementById('button1label').value = settings.buttons[0].label;
    document.getElementById('button1url').value = settings.buttons[0].url;
    document.getElementById('button2label').value = settings.buttons[1].label;
    document.getElementById('button2url').value = settings.buttons[1].url;
}
