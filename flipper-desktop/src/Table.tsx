import React from "react";
import MaterialTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

export const Table = ({
  rows,
}: {
  rows: { title: string; value: string | number }[];
}) => {
  return (
    <MaterialTable aria-label="simple table">
      <TableBody>
        {rows.map(({ title, value }) => (
          <TableRow key={title}>
            <TableCell component="th" scope="row">
              {title}
            </TableCell>
            <TableCell align="right">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </MaterialTable>
  );
};
