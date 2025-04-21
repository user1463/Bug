module.exports = {
    isAdmin: async (zk, groupId, userId) => {
        const metadata = await zk.groupMetadata(groupId);
        return metadata.participants.find(p => p.id === userId)?.admin || false;
    },
    
    isBotAdmin: async (zk, groupId) => {
        const metadata = await zk.groupMetadata(groupId);
        return metadata.participants.find(p => p.id === zk.user.id)?.admin || false;
    },
    
    getGroupInfo: async (zk, groupId) => {
        return await zk.groupMetadata(groupId);
    },
    
    mentionAll: async (zk, groupId) => {
        const { participants } = await zk.groupMetadata(groupId);
        return participants.map(p => `@${p.id.split('@')[0]}`).join(' ');
    }
};
