
const trMap = { "ş":"s","Ş":"S","ç":"c","Ç":"C","ğ":"g","Ğ":"G","ı":"i","İ":"I","ö":"o","Ö":"O","ü":"u","Ü":"U" };
const trRe = new RegExp("[" + Object.keys(trMap).join("") + "]", "g");

module.exports = function sanitize(name) {
  return name
    .normalize("NFC")
    .replace(trRe, (c) => trMap[c])
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");
};
