import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./JoinRoomPage.css";
import { setIsRoomHost } from "../../store/actions";
import { connect } from "react-redux";

const JoinRoomPage = (props) => {
  const search = useLocation().search;
  const { setIsRoomHostActions } = props;

  useEffect(() => {
    const isRoomHost = new URLSearchParams(search).get("host");
    if (isRoomHost) {
      setIsRoomHostActions(true);
    }
  }, []);

  return (
    <div className="join_room_page_container">
      <div className="join_room_page_panel"></div>
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};

const mapActionsToProps = (dispatch) => {
  return {
    setIsRoomHostActions: (isRoomHost) => {
      dispatch(setIsRoomHost(isRoomHost));
    }
  }
}

export default connect(mapStoreStateToProps, mapActionsToProps)(JoinRoomPage);
