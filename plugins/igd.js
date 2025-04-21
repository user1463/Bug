const { zokou } = require('../../framework/zokou');
const axios = require('axios');

module.exports = zokou({
    nomCom: "igdl",
    categorie: "Download",
    reaction: "📸",
    description: "Download Instagram content"
}, async (dest, zk, { ms, repondre, arg }) => {
    // Instagram API implementation
});
