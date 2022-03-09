import React from "react";
import { Dialog } from "flipper-plugin";

const MIGRATION_LINK =
  "https://github.com/bamlab/react-native-performance#install-androidios-plugin";

export const openMigrationDialog = () =>
  Dialog.show({
    defaultValue: false,
    children: () => (
      <div>
        This version of the Performance Android plugin is now <b>deprecated</b>.
        <br />
        <br />
        Please migrate to the <a href={MIGRATION_LINK}>new native plugin</a>,
        which features:
        <ul>
          <li> • iOS support 🎉</li>
          <li> • easier installation</li>
          <li> • more accurate reporting</li>
        </ul>
      </div>
    ),
    title: "Migrate to new plugin",
    okText: "See how to migrate",
    onConfirm: () => require("electron").shell.openExternal(MIGRATION_LINK),
  });
