import React from "react";

const Button = ({ buttonText, cancelButton = false, onClickHandler }) => {
  const buttonClass = cancelButton
    ? "join_room_cancel_button"
    : "join_room_success_button";

  return (
    <button onClick={onClickHandler} className={buttonClass}>
      {buttonText}
    </button>
  );
};

const JoinRoomButtons = ({ handleJoinRoom, isRoomHost }) => {
  const successButtonText = isRoomHost ? "Host" : "Join";

  return (
    <div className="join_room_buttons_container">
      <Button buttonText={successButtonText} onClickHandler={handleJoinRoom} />
      <Button
        buttonText="Cancel"
        cancelButton
        onClickHandler={() => window.history.back()}
      />
    </div>
  );
};

export default JoinRoomButtons;
