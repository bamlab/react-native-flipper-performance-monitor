import { styled } from "flipper-plugin";

export const ScrollContainer = styled("div")<{}>(() => ({
  overflow: "auto",
  flex: "auto",
  flexDirection: "column",
  display: "flex",
}));
