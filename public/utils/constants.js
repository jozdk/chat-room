export const PORT = 8080;
export const CLIENT = {
  MESSAGE: {
    NEW_USER: 'NEW_USER',
    USER_LEFT: 'USER_LEFT',
    NEW_MESSAGE: 'NEW_MESSAGE',
    OWN_MESSAGE_WITH_TIME: 'OWN_MESSAGE_WITH_TIME'
  }
};

// This check allows the module to be used in the client and the server
// if (typeof module !== "undefined" && module.exports) {
//   module.exports = exports = {
//     PORT,
//     CLIENT
//   }
// }

