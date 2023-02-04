const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
module.exports = {
    getApplicationImages: async (appId) => {
        const list = [];
        const response = await fetch(`https://discord.com/api/v9/oauth2/applications/${appId}/assets`);
        for (const img of await response.json()) {
            list.push(img.name)
        }
        return list;
    },
    getApplicationInfo: async (appId) => {
        const response = await fetch(`https://discord.com/api/v9/applications/public?application_ids=${appId}`);
        console.log(await response)
        return await response.json();
    },
    getAppliactionImageUrlByName: async (appId, name) => {
        const response = await fetch(`https://discord.com/api/v9/oauth2/applications/${appId}/assets`);
        for (const img of await response.json()) {
            if (name == img.name) {
                return `https://cdn.discordapp.com/app-assets/${appId}/${img.id}`
            }
        }
        return name;
    }
}

//https://cdn.discordapp.com/app-icons/846495641793462292/847186716090695710
//https://cdn.discordapp.com/app-icons/846495641793462292/38609f7ce396310489d59de06797f49d.png?size=256"
//https://cdn.discordapp.com/app-assets/846495641793462292/847186716090695710.png"