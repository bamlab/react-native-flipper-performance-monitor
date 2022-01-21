import { styled } from "flipper-plugin";

export const ScrollContainer = styled("div")<{ scrollable: boolean }>(
  ({ scrollable }) => ({
    overflow: scrollable ? "auto" : "hidden",
    flex: "auto",
    flexDirection: "column",
    display: "flex",
  })
);
