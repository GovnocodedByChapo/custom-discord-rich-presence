const RPC = require("discord-rpc");
const fs = require('fs');
const path = require('path');
const urlRegex = require('url-regex');
const { load, save, defaultConfig } = require('./config.js')
const { getApplicationImages } = require('./activity.js')

const isUrlValid = (url) => urlRegex().test(url)
const configPath ='./mySettings.json';
let applicationImages = [];

const setStatus = (text, color = 'white') => {
    const status = document.getElementById('status');
    status.textContent = text;
    status.style = `color: ${color}; margin-left: 5px;`;
}

const retryConnect = {
    state: false,
    lastTry: -1
}




document.addEventListener('DOMContentLoaded', async () => {
    if (!fs.existsSync(configPath)) save(configPath, {
        clientId: '846495641793462292',
        details: 'ПЛП - Партия Любителей Пива',
        state: 'Присоединяйся!',
        enableTimestamp: false,
        largeImageKey: 'https://media.tenor.com/KQafLCUULQsAAAAi/pixel.gif',
        largeImageText: 'Добро пожаловать в ПЛП!',
        smallImageKey: 'large',
        smallImageText: 'ПЛП - Партия Любителей Пива',
        partyMin: 100,
        partyMax: 100,
        buttons: [
            {label: 'first', url: 'https://google.com'},
            {label: 'first', url: 'https://google.com'}
        ]
    });
    const config = load(configPath)
    const rpc = new RPC.Client({ transport: "ipc" });
    rpc.login({ clientId: config.clientId }).catch((err) => {
        setStatus(err, 'red');
        if (err.toString() == 'Error: Could not connect') {
            let sec = 10;
            const interval = setInterval(() => {
                setStatus(`Retry in ${sec} sec`, 'red')
                sec--;
                if (sec <= 0) {
                    clearInterval(interval)
                    location.reload()
                }
            }, 1000)
        }
    });
    rpc.on('ready', () => {
        document.getElementById('p_username').textContent = rpc?.user?.username ?? 'Unknown';
        document.getElementById('p_tag').textContent = `#${rpc?.user?.discriminator ?? '0000'}`;
        document.getElementById('p_avatar').src = rpc.user ? `https://cdn.discordapp.com/avatars/${rpc.user.id}/${rpc.user.avatar}.png` : '';
        startPresence(config, rpc);
        console.log(rpc)
        setStatus('Connected', 'mediumspringgreen');
    })

    // update application images
    const response = await fetch(`https://discord.com/api/v9/oauth2/applications/${config.clientId}/assets`);
    applicationImages = await response.json();

    // apply saved settings
    document.getElementById('clientid').value = config.clientId;
    document.getElementById('state').value = config.state;
    document.getElementById('details').value = config.details;
    document.getElementById('largeImageKey').value = config.largeImageKey;
    document.getElementById('largeImageText').value = config.largeImageText;
    document.getElementById('smallImageKey').value = config.smallImageKey;
    document.getElementById('smallImageText').value = config.smallImageText;
    document.getElementById('enableTimestamp').checked = config.enableTimestamp;
    document.getElementById('partyMin').value = config.partyMin;
    document.getElementById('partyMax').value = config.partyMax;
    document.getElementById('button1label').value = config.buttons[0].label;
    document.getElementById('button1url').value = config.buttons[0].url;
    document.getElementById('button2label').value = config.buttons[1].label;
    document.getElementById('button2url').value = config.buttons[1].url;
    updatePreview();

    // update tooltips for images keys
    for (const img of applicationImages) {
        document.getElementById('largeImagesList').innerHTML += `<option value="${img.name}">`;
        document.getElementById('smallImagesList').innerHTML += `<option value="${img.name}">`;
        console.log(img.name)
    }

    // save settings and update presence
    document.getElementById('updatePresence').addEventListener('click', () => {
        save(configPath, {
            clientId: document.getElementById('clientid').value,
            state: document.getElementById('state').value,
            details: document.getElementById('details').value,
            largeImageKey: document.getElementById('largeImageKey').value,
            largeImageText: document.getElementById('largeImageText').value,
            smallImageKey: document.getElementById('smallImageKey').value,
            smallImageText: document.getElementById('smallImageText').value,
            enableTimestamp: document.getElementById('enableTimestamp').checked,
            partyMin: document.getElementById('partyMin').value,
            partyMax: document.getElementById('partyMax').value,
            buttons: [
                {label: document.getElementById('button1label').value, url: document.getElementById('button1url').value},
                {label: document.getElementById('button2label').value, url: document.getElementById('button2url').value}
            ]
        });
        location.reload();
    });

    // auto-update preview
    for (const input of document.querySelectorAll('input')) {
        input.addEventListener('input', updatePreview);
    };

    // tabs logic
    const tabs = [ 'tab_main', 'tab_images', 'tab_buttons' ];
    for (const name of tabs) {
        document.getElementById(name).addEventListener('click', () => {
            for (const _name of tabs) {
                document.getElementById(`${_name}_content`).style = 'display: none;';
            };
            document.getElementById(`${name}_content`).style = '';
        });
    };
})

const getImageUrl = (appId, name) => {
    if (isUrlValid(name)) return name;
    for (const image of applicationImages) {
        if (image.name == name) return `https://cdn.discordapp.com/app-assets/${appId}/${image.id}`
    }
}

const isButtonValid = (btn) => btn.label.length > 1 && isUrlValid(btn.url)

const updatePreview = async () => {
    document.getElementById('p_details').textContent = document.getElementById('details').value;
    document.getElementById('p_state').textContent = document.getElementById('state').value;
    document.getElementById('p_time').textContent = document.getElementById('enableTimestamp').checked ? 'Прошло 00:00' : '';
    document.getElementById('p_imgLarge').src = getImageUrl(document.getElementById('clientid').value, document.getElementById('largeImageKey').value);//document.getElementById('largeImageKey').value;
    document.getElementById('p_imgSmall').src = getImageUrl(document.getElementById('clientid').value, document.getElementById('smallImageKey').value);//document.getElementById('smallImageKey').value;
    

    // check party
    const party = {
        min: document.getElementById('partyMin').value,
        max: document.getElementById('partyMax').value
    }
    document.getElementById('p_party').textContent = (party.min.match(/(\d+)/) && party.max.match(/(\d+)/)) ? ` (${party.min} из ${party.max})` : ''  

    // check buttons; hide invalid buttons
    const buttons = [
        {label: document.getElementById('button1label').value, url: document.getElementById('button1url').value},
        {label: document.getElementById('button2label').value, url: document.getElementById('button2url').value}
    ]
    document.getElementById('p_btn1').textContent = buttons[0].label;
    document.getElementById('p_btn2').textContent = buttons[1].label;
    document.getElementById('p_btn1').style.display = isButtonValid(buttons[0]) ? null : 'none';
    document.getElementById('p_btn2').style.display = isButtonValid(buttons[1]) ? null : 'none';
}

const getButtons = (buttons) => {
    const result = buttons.filter(v => v.label.length > 1 && isUrlValid(v.url))
    console.log(result)
    return result.length > 0 ? result : undefined;
}

const startPresence = (config, rpc) => {
    rpc.clearActivity();
    rpc.setActivity({
        details: config.details.length > 1 ? config.details : undefined,
        state: config.state.length > 1 ? config.state : undefined,
        largeImageKey: config.largeImageKey.length > 1 ? config.largeImageKey : undefined,
        largeImageText: config.largeImageText.length > 1 ? config.largeImageText : undefined,
        smallImageKey: config.smallImageKey.length > 1 ? config.smallImageKey : undefined,
        smallImageText: config.smallImageText.length > 1 ? config.smallImageText : undefined,
        buttons: getButtons(config.buttons),
        startTimestamp: config.enableTimestamp ? Date.now() : undefined,
        partySize: (config.partyMin.length > 0 && config.partyMin.match(/(\d+)/)) ? +config.partyMin : undefined  ,
        partyMax: (config.partyMax.length > 0 && config.partyMax.match(/(\d+)/)) ? +config.partyMax : undefined   ,
    });
}