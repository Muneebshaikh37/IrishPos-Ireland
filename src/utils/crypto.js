// utils/crypto.js
export const encrypt = (text) => {
    return btoa(text); // Base64 encode
};

export const decrypt = (text) => {
    return atob(text); // Base64 decode
};
