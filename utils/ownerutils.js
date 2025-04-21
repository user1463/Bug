module.exports = {
    getContacts: async (zk) => {
        const chats = await zk.fetchAllContacts();
        return {
            contacts: chats.filter(c => !c.id.includes('@g.us')),
            groups: chats.filter(c => c.id.includes('@g.us'))
        };
    },
    
    isOwner: (userId) => {
        return config.OWNER_NUMBER === userId.split('@')[0];
    },
    
    restartBot: async () => {
        process.send('reset');
    }
};
