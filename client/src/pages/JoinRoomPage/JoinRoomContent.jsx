import React, { useState } from "react";
import JoinRoomInputs from "./JoinRoomInputs";
import { connect } from "react-redux";
import OnlyWithAudioCheckbox from "./OnlyWithAudioCheckbox";
import { setConnectOnlyWithAudio } from "../../store/actions";
import JoinRoomButtons from "./JoinRoomButtonts";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const JoinRoomContent = (props) => {
  const { isRoomHost, setConnectOnlyWithAudio, connectOnlyWithAudio } = props;

  const [roomIdValue, setRoomIdValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const handleJoinRoom = () => {
    if (!nameValue.trim()) {
      setError("Please enter your name.");
      return;
    }
    let roomId = roomIdValue;
    if (isRoomHost) {
      roomId = uuidv4();
    } else if (!roomIdValue.trim()) {
      setError("Please enter a room ID.");
      return;
    }
    history.push(`/room?roomId=${roomId}&name=${encodeURIComponent(nameValue)}`);
  };

  return (
    <>
      <JoinRoomInputs
        roomIdValue={roomIdValue}
        setRoomIdValue={setRoomIdValue}
        nameValue={nameValue}
        setNameValue={setNameValue}
        isRoomHost={isRoomHost}
      />
      <OnlyWithAudioCheckbox
        setConnectOnlyWithAudio={setConnectOnlyWithAudio}
        connectOnlyWithAudio={connectOnlyWithAudio}
      />
      {error && <div className="error_message_container"><span className="error_message_paragraph">{error}</span></div>}
      <JoinRoomButtons handleJoinRoom={handleJoinRoom} isRoomHost={isRoomHost} />
    </>
  );
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};

const mapActionsToProps = (dispatch) => {
  return {
    setConnectOnlyWithAudio: (connectOnlyWithAudio) => {
      dispatch(setConnectOnlyWithAudio(connectOnlyWithAudio));
    },
  };
};

export default connect(
  mapStoreStateToProps,
  mapActionsToProps
)(JoinRoomContent);
