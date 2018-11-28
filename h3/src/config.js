export const API_URL_BASE = process.env.OPENSECRET_API_URL || window.OPENSECRET_API_URL || (()=>{throw new Error('no api url defined')})();
export const UPLOAD_URL_BASE = process.env.OPENSECRET_UPLOAD_URL || window.OPENSECRET_UPLOAD_URL || (()=>{throw new Error('no upload url defined')})();

