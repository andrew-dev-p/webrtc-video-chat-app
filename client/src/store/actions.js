const Actions = {
  SET_IS_ROOM_HOST: "SET_IS_ROOM_HOST",
  SET_ONLY_WITH_AUDIO: "SET_ONLY_WITH_AUDIO",
};

export const setIsRoomHost = (isRoomHost) => {
  return {
    type: Actions.SET_IS_ROOM_HOST,
    payload: {
      isRoomHost,
    },
  };
};

export const setConnectOnlyWithAudio = (connectOnlyWithAudio) => {
  return {
    type: Actions.SET_ONLY_WITH_AUDIO,
    payload: {
      connectOnlyWithAudio,
    },
  };
};

export default Actions;
