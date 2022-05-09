export const PORT = 8080;
export const MESSAGES = {
  MESSAGE: {
    NEW_USER: 'NEW_USER',
    USER_LEFT: 'USER_LEFT',
    NEW_MESSAGE: 'NEW_MESSAGE',
    OWN_MESSAGE_WITH_TIME: 'OWN_MESSAGE_WITH_TIME'
  }
};

export const COLORS = {
  RED: '#FF1900',
  GREEN: '#74ee15',
  TURQOISE: '#4deeea',
  BLUE: '#001eff',
  PURPLE: '#f000ff',
  ORANGE: '#FF8800',
  PINK: '#FF008C',
  LIGHTBLUE: '#00DDFF'
}

// export const SERVER = {
//   MESSAGE: {
//     OWN_MESSAGE_WITH_TIME: 'OWN_MESSAGE_WITH_TIME'
//   },
//   BROADCAST: {
//     NEW_USER: 'NEW_USER',
//     USER_LEFT: 'USER_LEFT',
//     NEW_MESSAGE: 'NEW_MESSAGE'
//   }
// }

// This check allows the module to be used in the client and the server
// if (typeof module !== "undefined" && module.exports) {
//   module.exports = exports = {
//     PORT,
//     CLIENT
//   }
// }

