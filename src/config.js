const fs = require('fs');

module.exports = {
    defaultConfig: {
        clientId: '',
        details: '',
        state: '',
        enableTimestamp: false,
        largeImageKey: '',
        largeImageText: '',
        smallImageKey: '',
        smallImageText: '',
        buttons: [
            {label: 'first', url: 'https://google.com'},
            {label: 'first', url: 'https://google.com'}
        ]
    },
    load: (path) => {
        const buffer = fs.readFileSync(path, 'utf8');
        return JSON.parse(buffer.toString())
    },
    save: (path, config) => {
        fs.writeFileSync(path, JSON.stringify(config), err => {
            if (err) alert(`Error saving config: ${err}`);
        });
    }
}

