const initialState = {
  user: {},
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload, //whatever that's in the state
      };
    case "LOGIN_ERROR":
      return initialState;
    default:
      return initialState;
  }
};
